from fastapi import APIRouter, Depends
from app.controllers.task import TaskController
from app.models.task import Task, TaskUpdate
from app.controllers.user import UserController

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"]
)

task_controller = TaskController()
user_controller = UserController()

def get_current_user(token: str = Depends(user_controller.oauth2_scheme)):
    payload = user_controller.return_token(token)
    return payload

@router.get("/", dependencies=[Depends(get_current_user)])
def read_tasks(current_user: dict = Depends(get_current_user)):
    user_id = current_user['sub']
    return task_controller.read_tasks(user_id)

@router.get("/deleted", dependencies=[Depends(get_current_user)])
def read_deleted_tasks(current_user: dict = Depends(get_current_user)):
    user_id = current_user['sub']
    return task_controller.read_deleted_tasks(user_id)

@router.get("/task/", dependencies=[Depends(get_current_user)])
def read_task(item_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user['sub']
    return task_controller.read_task(item_id=item_id, user_id=user_id)

@router.post("/task/post", dependencies=[Depends(get_current_user)])
def post_task(task: Task, current_user: dict = Depends(get_current_user)):
    task.user_id = current_user['sub']
    return task_controller.create_task(task)

@router.put("/task/update", dependencies=[Depends(get_current_user)])
def update_task(item_id: str, task: TaskUpdate, current_user: dict = Depends(get_current_user)):
    task.user_id = current_user['sub']
    return task_controller.modify_task(item_id, task)

@router.put("/task/activate", dependencies=[Depends(get_current_user)])
def activate_task(item_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user['sub']
    return task_controller.activate_task(item_id, user_id)

@router.delete("/task/delete", dependencies=[Depends(get_current_user)])
def delete_task(item_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user['sub']
    return task_controller.remove_task(item_id, user_id)

@router.delete("/task/full_delete", dependencies=[Depends(get_current_user)])
def full_delete_task(item_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user['sub']
    return task_controller.full_remove_task(item_id, user_id)