from fastapi import APIRouter, Depends, HTTPException
from app.database.database import clone_postgres_to_mongodb, get_mongo_client
from app.api.routes import get_current_user
from app.utils import convert_task_document

router = APIRouter(
    prefix="/backup",
    tags=["backup"]
)


@router.post("backup/clone/", dependencies=[Depends(get_current_user)])
def clone_data(current_user: dict = Depends(get_current_user)):
    user_id = current_user['sub']
    return clone_postgres_to_mongodb(user_id)


@router.get("/backup/tasks/")
def get_user_backup_tasks(current_user: dict = Depends(get_current_user)):
    user_id = current_user['sub']
    mongo_db = get_mongo_client()
    tasks_cursor = mongo_db['tasks'].find({"user_id": user_id})
    
    tasks = list(tasks_cursor)
    if not tasks:
        raise HTTPException(status_code=404, detail="No tasks found for this user.")

    # Converter todos os documentos de tarefa
    converted_tasks = [convert_task_document(task) for task in tasks]

    return converted_tasks