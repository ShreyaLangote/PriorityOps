# backend/agents/ai_triage_agent.py
import os
import json
import boto3
import logging

# --- Configuration ---
# Model ID for Claude 3 Sonnet on Bedrock
BEDROCK_MODEL_ID = "anthropic.claude-3-sonnet-20240229-v1:0"

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# --- Boto3 Client (reusable) ---
bedrock_runtime = boto3.client(service_name="bedrock-runtime")

# --- System Prompt ---
# This is the most important part. We instruct the AI to return
# JSON that *exactly* matches what our frontend UI needs.
BEDROCK_SYSTEM_PROMPT = """
You are an expert IT support triage agent. Your sole purpose is to read a support ticket and return a valid JSON object. Do not add any text before or after the JSON.
The JSON object must have the following exact structure:
{
  "priority": "...",
  "category": "...",
  "confidence_score": ...,
  "estimated_resolution_time": "...",
  "recommended_solution_steps": ["...", "..."]
}
- "priority" must be one of: "Low", "Medium", "High", "Critical".
- "category" must be a single, concise string like "Network Connectivity" or "Software License".
- "confidence_score" must be an integer between 0 and 100 representing your confidence in the solution.
- "estimated_resolution_time" must be a string like "5-10 minutes" or "1-2 hours".
- "recommended_solution_steps" must be an array of short, actionable strings for a support agent. Provide at least 3 steps.
"""

# --- Lambda Handler (The main function) ---
def lambda_handler(event, context):
    """
    Lambda handler that uses Bedrock to triage a ticket.
    
    Input: The output from the 'duplicate_detector' agent.
           { "ticket_data": {...}, "duplicate_check": {...} }
    Output: The input, plus new 'triage_results'.
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # 1. Get ticket data from the event
        # The 'event' is the JSON output from the previous agent
        ticket_data = event.get('ticket_data')
        duplicate_check = event.get('duplicate_check')
        
        if not ticket_data:
            raise ValueError("Event is missing 'ticket_data'")
        
        title = ticket_data.get('title')
        description = ticket_data.get('description')

        if not all([title, description]):
            raise ValueError("Ticket data is missing title or description")

        logger.info(f"Triaging ticket: {ticket_data.get('id')}")

        # 2. Check for duplicates
        # If it's a duplicate, we can skip the AI triage
        if duplicate_check and duplicate_check.get('is_duplicate'):
            logger.info("Ticket is a duplicate. Skipping AI triage.")
            # Pass the data through, the update_agent will handle it
            return {
                "ticket_data": ticket_data,
                "duplicate_check": duplicate_check,
                "triage_results": None # Explicitly set to None
            }

        # 3. Craft the User Prompt for Bedrock
        user_prompt = f"Please triage this ticket:\n\nTitle: {title}\nDescription: {description}"
        
        # 4. Call Bedrock (Claude 3 Sonnet)
        # We use the new "messages" API format
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "system": BEDROCK_SYSTEM_PROMPT,
            "messages": [
                {
                    "role": "user",
                    "content": [{"type": "text", "text": user_prompt}]
                }
            ]
        }
        
        response = bedrock_runtime.invoke_model(
            body=json.dumps(request_body), 
            modelId=BEDROCK_MODEL_ID, 
            accept="application/json", 
            contentType="application/json"
        )
        
        response_body = json.loads(response.get('body').read())
        
        # 5. Extract the JSON response from Claude
        # The actual JSON text is in response_body['content'][0]['text']
        raw_json_response = response_body['content'][0]['text']
        logger.info(f"Bedrock raw response: {raw_json_response}")
        
        # Parse the JSON string into a Python dict
        triage_results = json.loads(raw_json_response)
        
        # 6. Return all data (original + new)
        # We must return everything, so the final agent
        # has all the info it needs to update the database.
        return {
            "ticket_data": ticket_data,
            "duplicate_check": duplicate_check,
            "triage_results": triage_results
        }

    except Exception as e:
        logger.error(f"ERROR: {e}")
        raise Exception(str(e))