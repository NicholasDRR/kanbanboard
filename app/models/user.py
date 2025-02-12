from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    id: Optional[str] = None
    email: str
    password: str
    
class UserUpdate(BaseModel):
    email: str
    password: str
