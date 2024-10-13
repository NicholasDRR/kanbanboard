import redis
from typing import Optional
from app.parameters import REDIS_HOST, REDIS_PORT, REDIS_DB

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
