import logging
from typing import Optional
from pymongo import MongoClient
from pymongo.database import Database as PyMongoDatabase
from backend.config import MONGODB_URL, DATABASE_NAME

logger = logging.getLogger("greesal.database")

class MongoManager:
    client: Optional[MongoClient] = None
    db: Optional[PyMongoDatabase] = None

db_manager = MongoManager()

def connect_to_mongo():
    """Connect to MongoDB with PyMongo."""
    logger.info(f"Connecting to MongoDB at {MONGODB_URL}...")
    try:
        client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
        # Verify connection
        client.admin.command('ping')
        db_manager.client = client
        # Extract db name if in URI or fallback to DATABASE_NAME
        try:
            default_db = client.get_default_database()
            db_name = default_db.name if default_db is not None else DATABASE_NAME
        except Exception:
            db_name = DATABASE_NAME

        db_manager.db = client[db_name]
        logger.info(f"Successfully connected to MongoDB database '{db_name}'!")
    except Exception as e:
        logger.warning(f"MongoDB not reachable ({e}). Operating with in-memory fallbacks where applicable.")
        db_manager.client = None
        db_manager.db = None

def get_db() -> Optional[PyMongoDatabase]:
    """Get the active database handle."""
    if db_manager.db is None and db_manager.client is None:
        connect_to_mongo()
    return db_manager.db

def close_mongo_connection():
    """Close the active connection."""
    if db_manager.client is not None:
        db_manager.client.close()
        db_manager.client = None
        db_manager.db = None
