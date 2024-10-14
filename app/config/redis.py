import os

import redis

REDIS_HOST = os.getenv("REDIS_HOST", "54.219.225.136")
REDIS_PORT = os.getenv("REDIS_PORT", 6379)
