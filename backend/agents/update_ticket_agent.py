# backend/agents/update_ticket_agent.py
import os
import json
import boto3
import logging
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

# --- Configuration ---
SECRET_ID = os.environ.get("SECRET_ID", "priorityops/docdb")
DB_NAME = "priorityopsdb"
COLLECTION_NAME = "tickets"

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# --- Database Connection (Singleton for Lambda) ---
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
        sm_client = boto3.client("secretsmanager")
        secret_val = sm_client.get_secret_value(SecretId=SECRET_ID)
        secret = json.loads(secret_val["SecretString"])
        
        conn_str = secret["connection_string"].replace("<password>", secret["password"])
        
        client = MongoClient(conn_str)
        client.admin.command('ismaster') # Test connection
        
        logger.info("MongoDB Atlas (sync) connection successful.")
        db_client = client[DB_NAME]
        return db_client
        
    except Exception as e:
        logger.error(f"FATAL: Could not connect to MongoDB Atlas: {e}")
        raise

# --- Lambda Handler (The main function) ---
def lambda_handler(event, context):
    """
    Lambda handler that updates the ticket in MongoDB with AI results.
    
    Input: The output from the 'ai_triage_agent'.
           { "ticket_data": {...}, 
             "duplicate_check": {...},
             "triage_results": {...} }
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # 1. Parse all data from the event
        ticket_data = event.get('ticket_data')
        duplicate_check = event.get('duplicate_check')
        triage_results = event.get('triage_results') # This might be None

        ticket_id = ticket_data.get('id') or ticket_data.get('_id')
        if not ticket_id:
            raise ValueError("Event is missing 'ticket_data.id'")

        logger.info(f"Updating ticket: {ticket_id}")

        # 2. Get DB connection
        db = get_db_connection()
        collection = db[COLLECTION_NAME]
        obj_id = ObjectId(ticket_id)

        update_payload = {}
        history_entry = {
            "timestamp": datetime.utcnow().isoformat()
        }

        # 3. Decide what to update (Duplicate vs. New Triage)
        if duplicate_check.get('is_duplicate'):
            # --- IT'S A DUPLICATE ---
            logger.info("Ticket is a duplicate. Updating status to 'Closed'.")
            duplicate_id = duplicate_check.get('duplicate_of')
            
            update_payload = {
                "status": "Closed",
                "duplicate_of": duplicate_id,
                "updated_at": datetime.utcnow()
            }
            history_entry["agent"] = "DuplicateDetectorAgent"
            history_entry["action"] = f"Closed as duplicate of ticket {duplicate_id}"

        elif triage_results:
            # --- IT'S A NEW TICKET, UPDATE WITH AI RESULTS ---
            logger.info("Ticket is not a duplicate. Updating with AI triage results.")
            
            # This payload matches the fields our frontend needs
            update_payload = {
                "status": "Open", # Mark as triaged and ready for an agent
                "priority": triage_results.get('priority'),
                "category": triage_results.get('category'),
                "confidence_score": triage_results.get('confidence_score'),
                "estimated_resolution_time": triage_results.get('estimated_resolution_time'),
                "recommended_solution_steps": triage_results.get('recommended_solution_steps'),
                "updated_at": datetime.utcnow()
            }
            history_entry["agent"] = "AITriageAgent"
            history_entry["action"] = f"Triaged. Set priority to {triage_results.get('priority')}"
        
        else:
            # This case shouldn't happen, but good to handle
            logger.warning("No duplicate and no triage results. Making no changes.")
            return {
                "status": "SKIPPED",
                "ticket_id": ticket_id,
                "message": "No action taken."
            }

        # 4. Execute the update in MongoDB
        result = collection.update_one(
            {"_id": obj_id},
            {
                "$set": update_payload,
                "$push": {"agent_history": history_entry}
            }
        )

        if result.modified_count == 0:
            logger.warning(f"Ticket {ticket_id} was not updated (maybe already updated or not found).")

        logger.info(f"Successfully updated ticket: {ticket_id}")
        
        # 5. Return success
        return {
            "status": "SUCCESS",
            "ticket_id": ticket_id
        }

    except Exception as e:
        logger.error(f"ERROR: {e}")
        raise Exception(str(e))