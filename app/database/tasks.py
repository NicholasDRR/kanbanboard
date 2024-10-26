from app.database.database import connect_to_postgres, get_mongodb_tasks_collection
from app.models.task import TaskUpdate, Task
from app.config.logging import logger


def get_completed_tasks(user_id: str):
    
    def serialize_task(task):
        task["_id"] = str(task["_id"])
        return task
        
    try:
        tasks_collection = get_mongodb_tasks_collection()
        tasks = list(tasks_collection.find({"user_id": user_id}))
        tasks = [serialize_task(task) for task in tasks]
        logger.info(f"Todas as tarefas para o usuário {user_id} foram recuperadas com sucesso.")
        return tasks

    except Exception as error:
        logger.error(f"Erro ao recuperar tarefas para o usuário {user_id}: {error}")
        return None
    

def insert_completed_task(item_id: str, task_update: TaskUpdate):
    try:
        tasks_collection = get_mongodb_tasks_collection()
        task_dict = task_update.dict()  
        task_dict["status"] = task_dict["status"].value  
        updated_task = tasks_collection.insert_one({"item_id": item_id, **task_dict})
        
    except Exception as error:
        logger.info(f"Error inserting task: {error}")
        return False
    else:  
        logger.info(f"Tarefa inserida no MongoDB com ID: {updated_task.inserted_id}")  
        return True
    

def insert_task(task: Task):
    connection, cursor = connect_to_postgres()
    
    query = """
    INSERT INTO tasks (title, description, status, priority, link, created_at, user_id) 
    VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id;
    """
    try:
        cursor.execute(query, (task.title, task.description, task.status.value, task.priority.value, task.link, task.created_at, task.user_id))
        task_id = cursor.fetchone()[0]  # Retrieve the generated ID
        connection.commit()  # Commit the transaction
        return task_id
    except Exception as error:
        logger.info(f"Error inserting task: {error}")
        connection.rollback()
        return None
    finally:
        cursor.close()
        connection.close()


def get_task(task_id: str, user_id: str):
    connection, cursor = connect_to_postgres()
    
    query = "SELECT * FROM tasks WHERE id = %s AND user_id = %s;"
    
    try:
        cursor.execute(query, (task_id, user_id, ))
        task = cursor.fetchone()
        if task:
            return Task(id=task[0], user_id=task[1], title=task[2], description=task[3], status=task[4], priority=task[5], link=task[6], created_at=task[6])
        return None
    except Exception as error:
        logger.error(f"Error fetching task: {error}")
        return None
    finally:
        cursor.close()
        connection.close()
        
        
def get_all_tasks(user_id):
    connection, cursor = connect_to_postgres()
    query = "SELECT * FROM tasks WHERE user_id = %s;"
    tasks = [] 
    
    try:
        cursor.execute(query, (user_id, ))
        all_tasks = cursor.fetchall()  
        for task in all_tasks:
            tasks.append(Task(id=task[0], user_id=task[1], title=task[2], description=task[3], status=task[4], priority=task[5], link=task[6], created_at=task[6]))
        return tasks 
    except Exception as error:
        logger.error(f"Error fetching tasks: {error}")
        return None
    finally:
        cursor.close()
        connection.close()

def update_task(task_id: str, task: TaskUpdate):
    connection, cursor = connect_to_postgres()
    query = """
    UPDATE tasks 
    SET title = %s, type = %s, description = %s, status = %s 
    WHERE id = %s and user_id = %s;
    """
    
    try:
        cursor.execute(query, (task.title, task.type, task.description, task.status, task_id, task.user_id))
        connection.commit()  
        return task_id
    except Exception as error:
        logger.error(f"Error updating task: {error}")
        connection.rollback()
        return None
    finally:
        cursor.close()
        connection.close()
        

def delete_task(task_id: str, user_id: str):
    connection, cursor = connect_to_postgres()
    query = "DELETE FROM tasks WHERE id = %s and user_id = %s;"
    
    try:
        cursor.execute(query, (task_id, user_id, ))
        connection.commit()
        return task_id
    except Exception as error:
        logger.error(f"Error deleting task: {error}")
        connection.rollback()
        return None
    finally:
        cursor.close()
        connection.close()
