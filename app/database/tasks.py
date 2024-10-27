from app.database.database import connect_to_postgres
from app.models.task import TaskUpdate, Task
from app.config.logging import logger




def insert_task(task: Task):
    connection, cursor = connect_to_postgres()
    
    query = """
    INSERT INTO tasks (title, description, status, priority, link, user_id, active, deleted_at) 
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id;
    """
    
    try:
        cursor.execute(query, (
            task.title,
            task.description,
            task.status.value,
            task.priority.value,
            task.link,
            task.user_id,
            task.active,         # This will default to True
            task.deleted_at      # This will default to None
        ))
        task_id = cursor.fetchone()[0] 
        connection.commit() 
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
    
    query = "SELECT * FROM tasks WHERE id = %s AND user_id = %s AND active = TRUE;"
    
    try:
        cursor.execute(query, (task_id, user_id,))
        task = cursor.fetchone()
        if task:
            return Task(
                id=task[0],
                user_id=task[1],
                title=task[2],
                description=task[3],
                status=task[4],
                priority=task[5],
                link=task[6],
                created_at=task[7],
                updated_at=task[8],
                active=True  
            )
        return None
    except Exception as error:
        logger.error(f"Error fetching task: {error}")
        return None
    finally:
        cursor.close()
        connection.close()


def get_all_tasks(user_id):
    connection, cursor = connect_to_postgres()
    query = "SELECT * FROM tasks WHERE user_id = %s AND active = TRUE;"
    tasks = [] 
    
    try:
        cursor.execute(query, (user_id,))
        all_tasks = cursor.fetchall()  
        for task in all_tasks:
            tasks.append(Task(
                id=task[0],
                user_id=task[1],
                title=task[2],
                description=task[3],
                status=task[4],
                priority=task[5],
                link=task[6],
                created_at=task[7],
                updated_at=task[8],  # Ensure this is a datetime
                active=True
            ))
        return tasks  # Return the list of Task instances
    except Exception as error:
        logger.error(f"Error fetching tasks: {error}")
        return None
    finally:
        cursor.close()
        connection.close()



def get_all_deleted_tasks(user_id):
    connection, cursor = connect_to_postgres()
    query = "SELECT * FROM tasks WHERE user_id = %s AND active = False;"
    tasks = [] 
    
    try:
        cursor.execute(query, (user_id,))
        all_tasks = cursor.fetchall()  
        for task in all_tasks:
            tasks.append(Task(
                id=task[0],
                user_id=task[1],
                title=task[2],
                description=task[3],
                status=task[4],
                priority=task[5],
                link=task[6],
                created_at=task[7],
                updated_at=task[8],  # Ensure this is a datetime
                deleted_at=task[9],
                active=False
                
            ))
        return tasks  # Return the list of Task instances
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
    SET title = %s, description = %s, status = %s, priority = %s, link = %s, updated_at = %s
    WHERE id = %s and user_id = %s;
    """
    
    try:
        # Adding `task.updated_at` and `task_id` to match placeholders in the query
        cursor.execute(query, (
            task.title, 
            task.description, 
            task.status, 
            task.priority, 
            task.link, 
            task.updated_at, 
            task_id,          
            task.user_id
        ))
        connection.commit()  
        return task_id
    except Exception as error:
        logger.error(f"Error updating task: {error}")
        connection.rollback()
        return None
    finally:
        cursor.close()
        connection.close()

def activate_task(task_id: str, user_id: str):
    connection, cursor = connect_to_postgres()
    query = """
    UPDATE tasks 
    SET active = TRUE, deleted_at = NULL, updated_at = CURRENT_TIMESTAMP
    WHERE id = %s AND user_id = %s;
    """

    try:
        cursor.execute(query, (task_id, user_id))
        connection.commit()
        logger.info(f"Task {task_id} activated successfully.")
        return task_id
    except Exception as error:
        logger.error(f"Error activating task: {error}")
        connection.rollback()
        return None
    finally:
        cursor.close()
        connection.close()
        
        
def delete_task(task_id: str, user_id: str):
    connection, cursor = connect_to_postgres()
    query = """
    UPDATE tasks 
    SET active = FALSE, deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = %s AND user_id = %s;
    """

    try:
        cursor.execute(query, (task_id, user_id))
        connection.commit()
        logger.info(f"Task {task_id} deleted successfully.")
        return task_id
    except Exception as error:
        logger.error(f"Error deleting task: {error}")
        connection.rollback()
        return None
    finally:
        cursor.close()
        connection.close()