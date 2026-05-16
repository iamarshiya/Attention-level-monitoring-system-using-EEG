from motor.motor_asyncio import AsyncIOMotorClient
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db = None

    @classmethod
    async def connect_db(cls):
        logger.info("Connecting to MongoDB...")
        try:
            cls.client = AsyncIOMotorClient(settings.MONGODB_URL)
            cls.db = cls.client[settings.DATABASE_NAME]
            logger.info("Connected to MongoDB successfully.")
        except Exception as e:
            logger.error(f"Could not connect to MongoDB: {e}")

    @classmethod
    async def close_db(cls):
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connection closed.")

db_instance = Database()
