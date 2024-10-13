from fastapi import APIRouter, status, HTTPException, Depends
from fastapi.responses import JSONResponse

from app.controllers.task import TaskController
from app.models.task import Task, TaskUpdate
from app.config.logging import logger

router = APIRouter(
    prefix="/tasks",
    tags=[
        "tasks"
    ]
)

task_controller = TaskController()

@router.get("/")
def read_tasks():
    return task_controller.read_tasks()


@router.get("/task/")
def read_task(item_id: str):
    return task_controller.read_task(item_id=item_id)


@router.post("/task/post")
def post_task(task: Task):
    return task_controller.create_task(task)

@router.put("/task/update")
def update_task(item_id: str, task: TaskUpdate):
    logger.info(task)
    return task_controller.modify_task(item_id, task)

@router.delete("/task/delete")
def delete_task(item_id: str):
    return task_controller.remove_task(item_id)