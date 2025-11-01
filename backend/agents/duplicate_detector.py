# backend/agents/duplicate_detector.py
import os
import json
import boto3
import logging
from opensearchpy import OpenSearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth

# --- Configuration ---
# We MUST set OPENSEARCH_HOST as an environment variable in this Lambda
OPENSEARCH_HOST = os.environ.get("OPENSEARCH_HOST", "") 
OPENSEARCH_INDEX = "tickets-index" # The name of our index
BEDROCK_MODEL_ID = "amazon.titan-embed-text-v1" # The embedding model

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# --- Boto3 Clients (reusable) ---
bedrock_runtime = boto3.client(service_name="bedrock-runtime")
session = boto3.Session()
credentials = session.get_credentials()
region = session.region_name or "us-east-1"
service = 'aoss' # 'Amazon OpenSearch Serverless'

# Create the AWS authentication object
awsauth = AWS4Auth(
    credentials.access_key,
    credentials.secret_key,
    region,
    service,
    session_token=credentials.token
)

# --- OpenSearch Client (reusable) ---
os_client = None

def get_opensearch_client():
    """
    Initializes and returns a reusable OpenSearch client.
    """
    global os_client
    if os_client:
        return os_client

    if not OPENSEARCH_HOST:
        logger.error("FATAL: OPENSEARCH_HOST environment variable is not set.")
        raise ValueError("OPENSEARCH_HOST environment variable is not set.")

    logger.info(f"Initializing OpenSearch client for host: {OPENSEARCH_HOST}")
    
    os_client = OpenSearch(
        hosts=[{'host': OPENSEARCH_HOST, 'port': 443}],
        http_auth=awsauth,
        use_ssl=True,
        verify_certs=True,
        connection_class=RequestsHttpConnection,
        pool_maxsize=20
    )
    return os_client

# --- Lambda Handler (The main function) ---
def lambda_handler(event, context):
    """
    Lambda handler that detects duplicate tickets.
    
    Input: The full ticket document from the 'get_ticket_details' agent.
    Output: The original ticket document, plus new 'duplicate_check' data.
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # 1. Get ticket data from the event
        # The 'event' is the entire ticket JSON from the previous step
        ticket_id = event.get('id') or event.get('_id') # Handle both 'id' and '_id'
        title = event.get('title')
        description = event.get('description')
        
        if not all([ticket_id, title, description]):
            raise ValueError("Event is missing ticket_id, title, or description")

        logger.info(f"Processing ticket: {ticket_id}")

        # 2. Generate Vector from Bedrock
        text_to_embed = f"Title: {title}\nDescription: {description}"
        body = json.dumps({"inputText": text_to_embed})
        
        response = bedrock_runtime.invoke_model(
            body=body, 
            modelId=BEDROCK_MODEL_ID, 
            accept="application/json", 
            contentType="application/json"
        )
        response_body = json.loads(response.get("body").read())
        vector = response_body.get("embedding")
        
        if not vector:
            raise Exception("Failed to generate vector from Bedrock")
            
        logger.info(f"Successfully generated vector for ticket {ticket_id}")

        # 3. Connect to OpenSearch
        client = get_opensearch_client()
        
        # 4. Index the document in OpenSearch
        # This saves the vector so future tickets can find *this* ticket.
        doc_to_index = {
            'ticket_id': ticket_id,
            'title': title,
            'description': description,
            'ticket_vector': vector # The vector field
        }
        
        client.index(
            index=OPENSEARCH_INDEX,
            body=doc_to_index,
            id=ticket_id,
            refresh=True # Force refresh for the demo (not for production)
        )
        logger.info(f"Successfully indexed document {ticket_id}")

        # 5. Query for Duplicates (k-NN Vector Search)
        knn_query = {
            "size": 3, # Find the top 3 similar tickets
            "query": {
                "knn": {
                    "ticket_vector": {
                        "vector": vector,
                        "k": 3
                    }
                }
            }
        }
        
        response = client.search(index=OPENSEARCH_INDEX, body=knn_query)
        logger.info(f"OpenSearch KNN response: {response}")

        # 6. Analyze Results and Prepare Output
        duplicate_check_result = {
            "is_duplicate": False,
            "duplicate_of": None,
            "duplicate_score": 0
        }

        for hit in response['hits']['hits']:
            hit_id = hit['_id']
            hit_score = hit['_score']

            # Don't match with itself!
            if hit_id == ticket_id:
                continue
            
            # Found a potential duplicate
            # We set a threshold for similarity (e.g., 0.9)
            if hit_score > 0.9:
                logger.info(f"Found duplicate: {hit_id} with score {hit_score}")
                duplicate_check_result = {
                    "is_duplicate": True,
                    "duplicate_of": hit['_source']['ticket_id'],
                    "duplicate_score": hit_score
                }
                break # Stop at the first match

        # 7. Return the combined data
        # We must return the original ticket data AND our new results
        # so the next agent (AI Triage) can use them.
        return {
            "ticket_data": event, # The original input event
            "duplicate_check": duplicate_check_result
        }
        
    except Exception as e:
        logger.error(f"ERROR: {e}")
        raise Exception(str(e))