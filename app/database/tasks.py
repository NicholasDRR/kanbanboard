from app.database.database import connect_to_postgres
from app.models.task import TaskUpdate, Task
from app.config.logging import logger




def insert_task(task: Task):
    connection, cursor = connect_to_postgres()
    
    query = """
    INSERT INTO tasks (title, description, status, priority, link, user_id, active) 
    VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id;
    """
    
    try:
        cursor.execute(query, (
            task.title,
            task.description,
            task.status.value,
            task.priority.value,
            task.link,
            task.user_id,
            task.active        # This will default to True
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
    
    query = "SELECT * FROM tasks WHERE id = %s AND user_id = %s;"
    
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
                deleted_at=task[9],
                active=task[10]
            )
        return task
    except Exception as error:
        logger.error(f"Error fetching task: {error}")
        return None
    finally:
        logger.error(f"Error fetching task: {task_id}")
        logger.error(f"Error fetching task: {user_id}")
        cursor.close()
        connection.close()


def get_all_tasks(user_id):
    
    connection, cursor = connect_to_postgres()
    query = "SELECT * FROM tasks WHERE user_id = %s AND active = TRUE ORDER BY created_at DESC;"
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
    query = "SELECT * FROM tasks WHERE user_id = %s AND active = False ORDER BY deleted_at DESC;"
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
    
    fields_to_update = []
    values = []
    
    if task.title is not None:
        fields_to_update.append("title = %s")
        values.append(task.title)
    if task.description is not None:
        fields_to_update.append("description = %s")
        values.append(task.description)
    if task.status is not None:
        fields_to_update.append("status = %s")
        values.append(task.status)
    if task.priority is not None:
        fields_to_update.append("priority = %s")
        values.append(task.priority)
    if task.link is not None:
        fields_to_update.append("link = %s")
        values.append(task.link)
    if task.updated_at is not None:
        fields_to_update.append("updated_at = %s")
        values.append(task.updated_at)
    
    if not fields_to_update:
        logger.warning("No fields provided for update")
        return None
    
    # Add the WHERE clause for task_id and user_id
    query = f"UPDATE tasks SET {', '.join(fields_to_update)} WHERE id = %s AND user_id = %s"
    values.extend([task_id, task.user_id])
    
    try:
        cursor.execute(query, tuple(values))
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
        
def full_delete_task(task_id: str, user_id: str):
    connection, cursor = connect_to_postgres()
    query = """
    DELETE FROM tasks
    WHERE id = %s AND user_id = %s;
    """

    try:
        cursor.execute(query, (task_id, user_id))
        connection.commit()
        logger.info(f"Task {task_id} full deleted successfully.")
        return task_id
    except Exception as error:
        logger.error(f"Error deleting task: {error}")
        connection.rollback()
        return None
    finally:
        cursor.close()
        connection.close()