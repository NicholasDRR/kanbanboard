import os
from dotenv import load_dotenv

load_dotenv()

POSTGRES_HOST = os.getenv("POSTGRES_HOST")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")
POSTGRES_DATABASE = os.getenv("POSTGRES_DATABASE")  
POSTGRES_USER = os.getenv("POSTGRES_USER")  
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")


REDIS_HOST = os.getenv("REDIS_HOST")  
REDIS_PORT = os.getenv("REDIS_PORT")  
REDIS_DB = os.getenv("REDIS_DB")