from fastapi import HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta

from app.database.user import (
    get_user_by_email,
    create_user,
    get_user_by_id,
    delete_user,
    update_user,
    get_all_users
)
from app.database.token import insert_revoked_tokens, select_revoked_token
from app.parameters import ACCESS_TOKEN_EXPIRES, ALGORITHM, SECRET_KEY
from app.config.logging import logger
from app.services.redis_service import RedisService


class UserController:
    
    def __init__(self):
        self.crypt = CryptContext(schemes=['bcrypt'])
        self.oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
        self.redis_service = RedisService()  # Initialize Redis service
        
    def create_hash(self, password):
        return self.crypt.hash(password)
    
    def read_users(self):
        return get_all_users()
    
    def read_user(self, user_id: int):
        return get_user_by_id(user_id)
    
    def create_user(self, email: str, password: str):
        return create_user(email, self.create_hash(password))
    
    def update_user(self, id: str, email: str, password: str):
        return update_user(id, email, password)
    
    def delete_user(self, user_id: int):
        return delete_user(user_id)
    
    def validate_password(self, password_hash, password):
        return self.crypt.verify(password, password_hash)
    
    def decode_token(self, token: str):
        try:
            return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        except JWTError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={'msg': 'Invalid token'})
    
    def check_token_revocation(self, token: str, user_id: str):
        if select_revoked_token(user_id=user_id, token=token):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"msg": "Token has been revoked"})
    
    def return_token(self, token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login"))):
        payload = self.decode_token(token)
        user_id = payload['sub'] 
        existing_token = self.redis_service.get_token(user_id)
        if existing_token:
            return existing_token
        
        self.check_token_revocation(token, payload['sub'])
        return payload
    
    def verify_token_health(self, token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login"))):
        payload = self.decode_token(token)
        user_id = payload['sub'] 
        
        existing_token = self.redis_service.get_token(user_id)
        if existing_token:
            return existing_token
        
        self.check_token_revocation(token, payload['sub'])
        return payload
    
    def login(self, user: OAuth2PasswordRequestForm):
        user_data = get_user_by_email(user.username)
        if not user_data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"msg": "User not found!"})

        if not self.validate_password(password=user.password, password_hash=user_data.password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"msg": "Invalid credentials"})

        existing_token = self.redis_service.get_token(user_data.id)
        if existing_token:
            return existing_token

        payload = {
            'sub': str(user_data.id),
            'exp': datetime.utcnow() + timedelta(days=int(ACCESS_TOKEN_EXPIRES)),
        }
        
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

        self.redis_service.set_token(token, user_data.id, expiry=int(ACCESS_TOKEN_EXPIRES))
        return token
    
    def logout(self, token: str):
        payload = self.decode_token(token)
        user_id = payload['sub'] 
        self.redis_service.delete_token(user_id)
        return insert_revoked_tokens(user_id=payload['sub'], token=token)
