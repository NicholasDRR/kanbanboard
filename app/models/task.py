from datetime import datetime, timezone
from pydantic import BaseModel, Field
from typing import Optional

from app.models.enums.task_status import TaskStatus
from app.models.enums.task_priority import TaskPriority


class Task(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    status: TaskStatus = Field(..., description="O status atual da tarefa")
    priority: TaskPriority = Field(..., description="A prioridade da tarefa")
    link: Optional[str] = "#"
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc), description="The creation date and time of the task")
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc), description="The update date and time of the task")
    user_id: Optional[str] = None
    active: bool = Field(default=True, description="Indicates if the task is active (not deleted)")
    deleted_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc), description="The date and time when the task was deleted (soft delete)")

    
    
class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = Field(None, description="O status atual da tarefa")
    priority: Optional[TaskPriority] = Field(None, description="A prioridade da tarefa")
    link: Optional[str] = None
    user_id: Optional[str] = None
    active: Optional[bool] = Field(default=True, description="Indicates if the task is active (not deleted)")
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc), description="The creation date and time of the task")