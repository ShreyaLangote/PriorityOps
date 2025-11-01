# backend/utils/events.py
import boto3
import json
import os
import logging

logger = logging.getLogger(__name__)

# Fetch the Event Bus name from environment variables
# We'll need to add EVENT_BUS_NAME to our .env file later
EVENT_BUS_NAME = os.environ.get("EVENT_BUS_NAME", "PriorityOps-Bus")

# Initialize the boto3 client once
try:
    event_client = boto3.client("events")
    logger.info("Boto3 EventBridge client initialized.")
except Exception as e:
    logger.error(f"Failed to initialize Boto3 client: {e}")
    event_client = None

def fire_event(event_type: str, detail: dict):
    """
    Fires a custom event to the AWS EventBridge bus.
    """
    if event_client is None:
        logger.error("EventBridge client is not initialized. Cannot fire event.")
        return

    logger.info(f"Firing event to EventBridge: {event_type} with detail: {detail}")
    
    try:
        # We must serialize the detail dictionary into a JSON string
        event_client.put_events(
            Entries=[{
                "Source": "priorityops.api",
                "DetailType": event_type,
                "Detail": json.dumps(detail),
                "EventBusName": EVENT_BUS_NAME
            }]
        )
        logger.info(f"Successfully fired event: {event_type}")
        
    except Exception as e:
        logger.error(f"Failed to put event to EventBridge: {e}")
        # We log the error but do not fail the main API request
        pass