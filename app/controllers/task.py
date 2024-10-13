from fastapi import HTTPException
from app.database.tasks import get_all_tasks, get_task, insert_task, update_task, delete_task, insert_completed_task, get_completed_tasks
from app.models.task import Task, TaskUpdate
from app.services.redis_service import RedisService
from app.config.logging import logger


class TaskController:
    def __init__(self):
        self.redis_service = RedisService()
    
    def read_tasks(self, user_id: str):
        return get_all_tasks(user_id)
    
    def read_completed_tasks(self, user_id: str):
        return get_completed_tasks(user_id)
    
    def read_task(self, item_id: str, user_id: str):       
        cached_task = self.redis_service.get(item_id)       
        if cached_task:
            return cached_task
        
        task = get_task(item_id, user_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task
    
    def create_task(self, task: Task):
        task_id = insert_task(task)
        self.redis_service.set(task_id, task.json())
        
        return task_id
    
    def modify_task(self, item_id: str, task_update: TaskUpdate):
        
        if task_update.status == 'completed':
            updated_task = insert_completed_task(item_id, task_update) 
            if updated_task:
                delete_task(item_id, task_update.user_id)   
        else:
            updated_task = update_task(item_id, task_update)
            
        if updated_task:
            self.redis_service.set(item_id, task_update.json())
        else:
            self.redis_service.delete(item_id)
            
        return updated_task
    
    
    def remove_task(self, item_id: str, user_id: str):
        delete_success = delete_task(item_id, user_id)
        if delete_success:
            self.redis_service.delete(item_id)

        return delete_success
