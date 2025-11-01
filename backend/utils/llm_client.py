# backend/utils/llm_client.py
import uuid

def create_ticket_record(ticket):
    # Temporary placeholder until we connect DynamoDB
    ticket_id = f"TCKT-{uuid.uuid4().hex[:6].upper()}"
    return {
        "ticket_id": ticket_id,
        "name": ticket.name,
        "department": ticket.department,
        "issue_title": ticket.issue_title,
        "description": ticket.description,
        "priority": "Pending",
        "status": "Open"
    }

