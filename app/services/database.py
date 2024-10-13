from app.config.logging import logger
from app.database.database import connect_to_postgres as connect_db
from app.database.ddl import create_tables as create_tb, create_database as create_db
from app.parameters import POSTGRES_HOST, POSTGRES_DATABASE, POSTGRES_PORT, POSTGRES_PASSWORD, POSTGRES_USER



class DatabaseService:
    def __init__(self, host: str = POSTGRES_HOST, port: str = POSTGRES_PORT, db_name: str = 'postgres', 
                user: str = POSTGRES_USER, password: str = POSTGRES_PASSWORD):
        self.db_name = db_name
        self.user = user
        self.password = password
        self.host = host
        self.port = port
        self.connection = None
        self.cursor = None

    def connect_to_postgres(self, db_name=None):
        """Connect to PostgreSQL server (default database)"""
        if db_name is None:
            db_name = self.db_name
        self.connection, self.cursor = connect_db(
            db_name=db_name,        
            user=self.user,
            password=self.password,
            host=self.host,
            port=self.port
        )
        logger.info(f"Connected to PostgreSQL database: {db_name}")

    def create_database(self):
        """Create the PostgreSQL database if it doesn't already exist."""
        try:
            self.connect_to_postgres()
            create_db(self.cursor)
        except Exception as error:
            logger.error(f"Failed to create database: {error}")
        else:
            logger.info("Database 'task_management' created successfully.")
        finally:
            self.close_connection()  # Close connection in the end


    def create_tables(self):
        """Create tables in the PostgreSQL database."""
        try:
            # Reconnect to the newly created database to create tables
            self.connect_to_postgres(db_name=POSTGRES_DATABASE)  # Connect to the new database
            create_tb(self.cursor)
        except Exception as e:
            logger.error(f"Failed to create tables: {e}")
            raise  # Re-raise the exception for further handling
        else:
            logger.info("Tables created successfully.")
        finally:
            self.close_connection() 
        
    def initialize(self):
        """Initialize the database service by creating the database and tables."""
        self.create_database()  # Create the database
        self.create_tables()     # Create the tables in the new database

    def close_connection(self):
        """Close the database connection."""
        if self.cursor:
            self.cursor.close()
            logger.info("Cursor closed.")
        if self.connection:
            self.connection.close()
            logger.info("Database connection closed.")
