from fastapi import HTTPException, status
from app.database.tasks import get_all_tasks, get_task, insert_task, update_task, delete_task, get_all_deleted_tasks, activate_task
from app.models.task import Task, TaskUpdate
from app.services.redis_service import RedisService

class TaskController:
    def __init__(self):
        self.redis_service = RedisService()
    
    def read_tasks(self, user_id: str):
        has_tasks = get_all_tasks(user_id)
        if not has_tasks:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User has no tasks") 
        return has_tasks
    
    def read_deleted_tasks(self, user_id: str):
        has_deleted_tasks = get_all_deleted_tasks(user_id)
        if not has_deleted_tasks:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User has no deleted tasks") 
        return has_deleted_tasks

    def read_task(self, item_id: str, user_id: str):  
        task = get_task(item_id, user_id)
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        return task
    
    def create_task(self, task: Task):
        task_id = insert_task(task)
        self.redis_service.set(task_id, task.json())
        return task_id
    
    def activate_task(self,task_id, user_id):
        task_activated = activate_task(task_id, user_id)
        if not task_activated:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error in activation")
        
        return task_activated
    
    def modify_task(self, item_id: str, task_update: TaskUpdate):
        task_exists = self.read_task(item_id=item_id, user_id=task_update.user_id)
        if not task_exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        
        updated_task = update_task(item_id, task_update)
        if updated_task:
            self.redis_service.set(item_id, task_update.json())
        else:
            self.redis_service.delete(item_id)
            
        return updated_task
    
    def remove_task(self, item_id: str, user_id: str):
        task_exists = self.read_task(item_id=item_id, user_id=user_id)
        if not task_exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        delete_success = delete_task(item_id, user_id)
        if delete_success:
            self.redis_service.delete(item_id)
        return delete_success
