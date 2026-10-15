import logging
import time
from typing import Optional
from pymongo import MongoClient
from pymongo.database import Database as PyMongoDatabase
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from backend.config import MONGODB_URL, DATABASE_NAME

logger = logging.getLogger("greesal.database")

class MongoManager:
    client: Optional[MongoClient] = None
    db: Optional[PyMongoDatabase] = None

db_manager = MongoManager()

MAX_RETRIES = 3
RETRY_DELAY_SECONDS = 2

def connect_to_mongo():
    """Connect to MongoDB with PyMongo, with retry logic for Atlas reliability."""
    masked_url = MONGODB_URL[:30] + "..." if len(MONGODB_URL) > 30 else MONGODB_URL
    logger.info(f"Connecting to MongoDB at {masked_url}...")
    start_time = time.time()

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            client = MongoClient(
                MONGODB_URL,
                serverSelectionTimeoutMS=8000,
                connectTimeoutMS=10000,
                socketTimeoutMS=20000,
                maxPoolSize=50,
                retryWrites=True,
                retryReads=True,
                tlsAllowInvalidCertificates=True,
            )
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
            elapsed = round(time.time() - start_time, 2)
            logger.info(
                f"✅ Connected to MongoDB Atlas database '{db_name}' "
                f"(attempt {attempt}, {elapsed}s elapsed)"
            )
            return  # success
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.warning(f"MongoDB connection attempt {attempt}/{MAX_RETRIES} failed: {e}")
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY_SECONDS * attempt)
        except Exception as e:
            logger.error(f"MongoDB connection error (attempt {attempt}/{MAX_RETRIES}): {e}")
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY_SECONDS * attempt)

    elapsed = round(time.time() - start_time, 2)
    logger.error(
        f"❌ All MongoDB connection attempts failed after {elapsed}s. "
        f"Operating with fallback handling."
    )
    db_manager.client = None
    db_manager.db = None

def _is_connection_alive() -> bool:
    """Check if the current MongoDB connection is still alive."""
    if db_manager.client is None:
        return False
    try:
        db_manager.client.admin.command('ping')
        return True
    except Exception:
        return False

def get_db() -> Optional[PyMongoDatabase]:
    """Get the active database handle. Reconnects if connection was lost."""
    if db_manager.db is None or not _is_connection_alive():
        if db_manager.db is not None:
            logger.warning("MongoDB connection lost — attempting reconnection...")
        # Reset stale state and reconnect
        db_manager.client = None
        db_manager.db = None
        connect_to_mongo()
    return db_manager.db

def close_mongo_connection():
    """Close the active MongoDB connection."""
    if db_manager.client is not None:
        logger.info("Closing MongoDB connection...")
        db_manager.client.close()
        db_manager.client = None
        db_manager.db = None
