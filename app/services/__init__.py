from app.services.database import DatabaseService
from app.config.logging import logger

db_service = DatabaseService()
try:
    db_service.initialize()
except Exception as e:
    logger.error(f"An error occurred: {e}")
finally:
    db_service.close_connection()
