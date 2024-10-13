from datetime import datetime, timezone
from pydantic import BaseModel, Field
from typing import Optional

from app.models.enums.task_status import TaskStatus


class Task(BaseModel):
    id: Optional[str] = None
    title: str
    type: str
    description: str
    status: TaskStatus = Field(..., description="O status atual da tarefa")
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc), description="The creation date and time of the task")
    user_id: Optional[str] = None
    
class TaskUpdate(BaseModel):
    title: str
    type: str
    description: str
    status: TaskStatus = Field(..., description="O status atual da tarefa")
    user_id: Optional[str] = None