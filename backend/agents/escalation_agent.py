# backend/agents/escalation_agent.py
import os
import json
import boto3
import logging
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta

# --- Configuration ---
SECRET_ID = os.environ.get("SECRET_ID", "priorityops/docdb")
DB_NAME = "priorityopsdb"
COLLECTION_NAME = "tickets"
# This Lambda MUST have this environment variable set to send alerts
SNS_TOPIC_ARN = os.environ.get("SNS_TOPIC_ARN", "") 
# Define our SLA. We'll escalate tickets older than 1 hour.
SLA_HOURS = 1

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# --- Boto3 and DB Clients (reusable) ---
db_client = None
sns_client = boto3.client("sns")

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
        client.admin.command('ismaster')
        
        logger.info("MongoDB Atlas (sync) connection successful.")
        db_client = client[DB_NAME]
        return db_client
        
    except Exception as e:
        logger.error(f"FATAL: Could not connect to MongoDB Atlas: {e}")
        raise

# --- Lambda Handler (The main function) ---
def lambda_handler(event, context):
    """
    Lambda handler that runs on a schedule to find and escalate tickets
    that have breached their SLA.
    
    Trigger: AWS EventBridge Scheduler (e.g., rate(5 minutes))
    """
    logger.info("EscalationAgent running. Checking for SLA breaches...")
    
    try:
        # 1. Define the SLA breach time
        # We'll query for tickets that haven't been *updated* in 1 hour
        sla_breach_time = datetime.utcnow() - timedelta(hours=SLA_HOURS)
        
        # 2. Build the query
        query = {
            "status": "Open",  # Only find open tickets
            "priority": {"$in": ["High", "Critical"]}, # That are high or critical
            "updated_at": {"$lt": sla_breach_time} # And haven't been touched
        }

        # 3. Get DB connection and find tickets
        db = get_db_connection()
        collection = db[COLLECTION_NAME]
        
        # Use .find() to get a cursor, which is memory-efficient
        breached_tickets = collection.find(query)
        
        escalated_count = 0
        
        # 4. Process each breached ticket
        for ticket in breached_tickets:
            ticket_id = ticket["_id"]
            ticket_id_str = str(ticket_id)
            logger.warning(f"SLA BREACH detected for ticket: {ticket_id_str}")
            
            try:
                # 4a. Update the ticket status in MongoDB
                history_entry = {
                    "agent": "EscalationAgent",
                    "action": f"Breached {SLA_HOURS}-hour SLA. Status set to Escalated.",
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                collection.update_one(
                    {"_id": ticket_id},
                    {
                        "$set": {"status": "Escalated", "updated_at": datetime.utcnow()},
                        "$push": {"agent_history": history_entry}
                    }
                )
                
                # 4b. Publish an alert to the SNS Topic
                if not SNS_TOPIC_ARN:
                    logger.warning("SNS_TOPIC_ARN is not set. Cannot send alert.")
                    continue # Move to the next ticket

                alert_message = {
                    "default": f"Ticket {ticket_id_str} has breached its SLA and has been escalated.",
                    "email": (
                        f"Priority: {ticket.get('priority')}\n"
                        f"Ticket ID: {ticket_id_str}\n"
                        f"Title: {ticket.get('title')}\n\n"
                        "This ticket has breached its SLA and requires immediate attention."
                    ),
                    # You can add other formats like 'slack' here
                }
                
                sns_client.publish(
                    TopicArn=SNS_TOPIC_ARN,
                    Message=json.dumps(alert_message),
                    Subject=f"SLA BREACH: Ticket {ticket_id_str} Escalated",
                    MessageStructure="json"
                )
                
                logger.info(f"Successfully escalated and sent alert for {ticket_id_str}")
                escalated_count += 1
                
            except Exception as e:
                logger.error(f"Failed to process ticket {ticket_id_str}: {e}")
                # Don't stop the loop; just move to the next ticket
                pass
                
        logger.info(f"Escalation run complete. Escalated {escalated_count} ticket(s).")
        return {
            "status": "SUCCESS",
            "escalated_count": escalated_count
        }

    except Exception as e:
        logger.error(f"ERROR: {e}")
        raise Exception(str(e))