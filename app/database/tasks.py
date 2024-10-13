from app.database.database import connect_to_postgres
from app.models.task import TaskUpdate, Task
from app.config.logging import logger


def insert_task(task: Task):
    connection, cursor = connect_to_postgres()
    
    query = """
    INSERT INTO tasks (title, type, description, status, user_id) 
    VALUES (%s, %s, %s, %s, %s) RETURNING id;
    """
    try:
        cursor.execute(query, (task.title, task.type, task.description, task.status, task.user_id))
        task_id = cursor.fetchone()[0]  # Obter o ID gerado
        connection.commit()  # Commit da transação
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
            return Task(id=task[0], title=task[1], type=task[2], description=task[3], status=task[4], created_at=task[5])
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
    
    tasks = []  # Lista para armazenar todas as tarefas
    
    try:
        cursor.execute(query, (user_id, ))
        all_tasks = cursor.fetchall()  # Busca todas as tarefas
        
        for task in all_tasks:
            # Cria um objeto Task para cada registro retornado
            tasks.append(Task(id=task[0], user_id=task[1], title=task[2], type=task[3], description=task[4], status=task[5], created_at=task[6]))
        return tasks  # Retorna a lista de tarefas
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
        connection.commit()  # Commit da transação
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
        connection.commit()  # Commit da transação
        return task_id
    except Exception as error:
        logger.error(f"Error deleting task: {error}")
        connection.rollback()
        return None
    finally:
        cursor.close()
        connection.close()
