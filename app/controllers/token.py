from fastapi import HTTPException
from app.models.task import Task, TaskUpdate
from app.services.redis_service import RedisService


class TokenController:
    def __init__(self):
        self.redis_service = RedisService()
    
    def insert_revoked_tokens():
        ...