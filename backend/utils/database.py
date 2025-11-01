# backend/utils/database.py
import os
import json
import boto3
import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from botocore.exceptions import ClientError, NoCredentialsError

logger = logging.getLogger(__name__)

# --- Configuration ---
SECRET_ID = os.environ.get("SECRET_ID", "priorityops/docdb")
DB_NAME = "priorityopsdb"

# --- Global Client Instance ---
_mongo_client: Optional[AsyncIOMotorClient] = None
_database: Optional[AsyncIOMotorDatabase] = None


async def connect_to_mongo():
    """
    Connect to MongoDB Atlas asynchronously on app startup.
    Fetches credentials from AWS Secrets Manager.
    """
    global _mongo_client, _database
    
    if _mongo_client:
        logger.info("MongoDB connection already established.")
        return

    logger.info("Initializing new MongoDB Atlas (async) connection...")
    
    try:
        # 1. Get secret from AWS Secrets Manager (This is a sync call, but OK once at startup)
        try:
            session = boto3.session.Session()
            sm_client = session.client(service_name='secretsmanager')
            
            logger.info(f"Fetching MongoDB credentials from secret: {SECRET_ID}")
            response = sm_client.get_secret_value(SecretId=SECRET_ID)
            secret_string = response['SecretString']
            credentials = json.loads(secret_string)
            logger.info("Successfully retrieved MongoDB credentials.")
            
        except (ClientError, NoCredentialsError) as e:
            logger.error(f"Failed to retrieve AWS secret {SECRET_ID}: {e}")
            raise Exception("Failed to get DB credentials from AWS Secrets Manager")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse secret JSON from {SECRET_ID}: {e}")
            raise Exception("Invalid JSON format in AWS secret")

        # 2. Get connection details from secret
        username = credentials.get('username')
        password = credentials.get('password')
        conn_string_template = credentials.get('connection_string')

        if not all([username, password, conn_string_template]):
             raise Exception("Secret is missing 'username', 'password', or 'connection_string'")

        # 3. Inject password into the connection string
        mongodb_uri = conn_string_template.replace("<password>", password)

        # 4. Create the ASYNC client
        _mongo_client = AsyncIOMotorClient(
            mongodb_uri,
            maxPoolSize=50,
            minPoolSize=5
        )
        
        # Test the connection
        await _mongo_client.admin.command('ping')
        
        _database = _mongo_client[DB_NAME]
        
        # Create indexes
        await create_indexes()
        
        logger.info(f"Successfully connected to MongoDB and database '{DB_NAME}'")

    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        _mongo_client = None
        _database = None
        raise # Re-raise exception to stop the app if DB connection fails


async def close_mongo_connection():
    """Close database connection"""
    global _mongo_client
    if _mongo_client:
        _mongo_client.close()
        logger.info("Disconnected from MongoDB")


async def create_indexes():
    """Create database indexes for better performance"""
    global _database
    if not _database:
        logger.warning("No database connection, skipping index creation.")
        return
    
    try:
        tickets_collection = _database.tickets
        
        # Create indexes for common query patterns
        await tickets_collection.create_index("status")
        await tickets_collection.create_index("priority")
        await tickets_collection.create_index("created_at")
        await tickets_collection.create_index("department")
        await tickets_collection.create_index("assignee")
        await tickets_collection.create_index([("title", "text"), ("description", "text")])
        
        logger.info("Database indexes created/verified successfully")
    except Exception as e:
        logger.error(f"Failed to create indexes: {str(e)}")


async def get_database() -> AsyncIOMotorDatabase:
    """
    FastAPI Dependency to get the database instance.
    """
    global _database
    if _database is None:
        # This should not happen if startup events are configured correctly
        logger.warning("Database not initialized, attempting to connect...")
        await connect_to_mongo()
        
    if _database is None:
         # If connection still failed, raise a clear error
         raise Exception("Database connection is not available.")
         
    return _database