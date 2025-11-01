# backend/agents/get_ticket_details.py
import os
import json
import boto3
import logging
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

# --- Configuration ---
# We'll set SECRET_ID as an environment variable in our Lambda
SECRET_ID = os.environ.get("SECRET_ID", "priorityops/docdb")
DB_NAME = "priorityopsdb"
COLLECTION_NAME = "tickets"

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# --- Database Connection (Singleton for Lambda) ---
# This client can be reused across "warm" Lambda invocations
db_client = None

def get_db_connection():
    """
    Initializes and returns a synchronous pymongo client.
    Fetches credentials from AWS Secrets Manager.
    """
    global db_client
    if db_client:
        logger.info("Reusing existing MongoDB connection.")
        return db_client

    logger.info("Initializing new MongoDB Atlas connection...")
    try:
        # Get credentials from Secrets Manager
        sm_client = boto3.client("secretsmanager")
        secret_val = sm_client.get_secret_value(SecretId=SECRET_ID)
        secret = json.loads(secret_val["SecretString"])
        
        # Build connection string
        conn_str = secret["connection_string"].replace("<password>", secret["password"])
        
        # Create the client
        client = MongoClient(conn_str)
        client.admin.command('ismaster') # Test connection
        
        logger.info("MongoDB Atlas (sync) connection successful.")
        db_client = client[DB_NAME] # Get the database instance
        return db_client
        
    except Exception as e:
        logger.error(f"FATAL: Could not connect to MongoDB Atlas: {e}")
        raise # Fail the Lambda if DB connection fails

# --- BSON/JSON Conversion Helper ---
def mongo_converter(o):
    """Converts non-serializable BSON types to strings for JSON."""
    if isinstance(o, ObjectId):
        return str(o)
    if isinstance(o, datetime):
        return o.isoformat()
    logger.warning(f"Type {type(o)} not serializable")
    raise TypeError(f"Object of type {o.__class__.__name__} is not JSON serializable")

# --- Lambda Handler (The main function) ---
def lambda_handler(event, context):
    """
    Lambda handler that fetches a full ticket document from MongoDB.
    
    This function is triggered by EventBridge.
    The 'event' it receives is the { "detail": { "ticket_id": "..." } }
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # 1. Get ticket_id from the event
        # The 'detail' from EventBridge might be a string,
        # but in a Step Function, it's passed as the event itself.
        # We'll check for both.
        
        if 'detail' in event:
            # Event came directly from EventBridge
            event_detail = event['detail']
            if isinstance(event_detail, str):
                event_detail = json.loads(event_detail)
        else:
            # Event is from a Step Function test or direct invoke
            event_detail = event 
            
        ticket_id = event_detail.get('ticket_id')
        if not ticket_id:
            raise ValueError("Missing 'ticket_id' in event payload")

        logger.info(f"Processing ticket_id: {ticket_id}")

        # 2. Get DB connection
        db = get_db_connection()
        collection = db[COLLECTION_NAME]
        
        # 3. Fetch the ticket
        obj_id = ObjectId(ticket_id)
        ticket_doc = collection.find_one({"_id": obj_id})
        
        if not ticket_doc:
            raise Exception(f"No ticket found with ID: {ticket_id}")
            
        logger.info(f"Successfully fetched ticket: {ticket_id}")

        # 4. Return the full document (made JSON serializable)
        # What we RETURN here becomes the INPUT for the next agent
        return json.loads(json.dumps(ticket_doc, default=mongo_converter))
        
    except Exception as e:
        logger.error(f"ERROR: {e}")
        # Re-raise the exception to fail the Lambda
        # This will allow our Step Function to catch the error
        raise Exception(str(e))