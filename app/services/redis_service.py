import redis
from typing import Optional
from app.parameters import REDIS_HOST, REDIS_PORT, REDIS_DB
from app.config.logging import logger

class RedisService:
    def __init__(self, host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB):
        self.redis_client = redis.Redis(host=host, port=port, db=db)

    def get(self, key: str) -> Optional[str]:
        """Recupera um valor do Redis com a chave fornecida."""
        return self.redis_client.get(key)

    def set(self, key: str, value: str, expire: Optional[int] = None):
        """Define um valor no Redis com a chave fornecida."""
        if expire:
            self.redis_client.setex(key, expire, value)
        else:
            self.redis_client.set(key, value)

    def delete(self, key: str):
        """Deleta um valor do Redis com a chave fornecida."""
        self.redis_client.delete(key)

    def exists(self, key: str) -> bool:
        """Verifica se uma chave existe no Redis."""
        return self.redis_client.exists(key)
    
    def set_token(self, token: str, user_id: str, expiry: int):
        self.redis_client.setex(f"user_token:{user_id}", expiry, token)

    def get_token(self, user_id: str):
        token_key = f"user_token:{user_id}"
        logger.debug(f"Geting token from Redis for user_id: {user_id}")
        token = self.redis_client.get(token_key)  
        if token:
            return token.decode('utf-8')  
        return None  

    def delete_token(self, user_id: str):
        token_key = f"user_token:{user_id}"
        logger.debug(f"Deleting token from Redis for user_id: {user_id}")
        result = self.redis_client.delete(token_key) 
        logger.debug(f"Delete result for user_id {user_id}: {result}")
        return result 
