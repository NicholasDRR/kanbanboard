from app.database.database import connect_to_postgres
from app.models.user import User  # Ensure you have a User model defined
from app.config.logging import logger
from app.models.user import User


def get_all_users():
    connection, cursor = connect_to_postgres()
    
    query = "SELECT * FROM users"
    
    users = []  
    
    try:
        cursor.execute(query)
        all_users = cursor.fetchall()  
        
        for user in all_users:
            # Cria um objeto Task para cada registro retornado
            users.append(User(id=user[0], email=user[1], password=user[2]))
        
        return all_users  # Retorna a lista de tarefas
    except Exception as error:
        logger.error(f"Error fetching tasks: {error}")
        return None
    finally:
        cursor.close()
        connection.close()
        
        
def get_user_by_email(email: str):
    connection, cursor = connect_to_postgres()
    
    query = "SELECT * FROM users WHERE email = %s;"
    
    try:
        cursor.execute(query, (email,))
        user = cursor.fetchone() 
        
        if user:
            return User(id=user[0], email=user[1], password=user[2]) 
        return None
    except Exception as error:
        logger.error(f"Error fetching user by email: {error}")
        return None
    finally:
        cursor.close()
        connection.close()
        

def create_user(email: str, password: str):
    connection, cursor = connect_to_postgres()
    
    query = """
    INSERT INTO users (email, password)
    VALUES (%s, %s) RETURNING id;
    """
    
    try:
        cursor.execute(query, (email, password))
        user_id = cursor.fetchone()[0]  
        connection.commit() 
        return user_id  

    except Exception as error:
        logger.error(f"Error creating user: {error}")
        connection.rollback() 
        return None

    finally:
        cursor.close()
        connection.close()


def get_user_by_id(user_id: int):
    connection, cursor = connect_to_postgres()
    
    query = "SELECT id, email, password FROM users WHERE id = %s;"
    
    try:
        cursor.execute(query, (user_id,))
        user = cursor.fetchone()  
        
        if user:
            return User(id=user[0], email=user[1], password=user[2])  
        return None

    except Exception as error:
        logger.error(f"Error fetching user by ID: {error}")
        return None

    finally:
        cursor.close()
        connection.close()


def update_user(user_id: int, email: str = None, password: str = None):
    connection, cursor = connect_to_postgres()
    
    query = "UPDATE users SET "
    params = []
    
    if email is not None:
        query += "email = %s, "
        params.append(email)
    if password is not None:
        query += "password = %s, "
        params.append(password)
    
    query = query.rstrip(", ") + " WHERE id = %s;"
    params.append(user_id)
    
    try:
        cursor.execute(query, tuple(params))
        connection.commit()  
        return user_id  

    except Exception as error:
        logger.error(f"Error updating user: {error}")
        connection.rollback() 
        return None

    finally:
        cursor.close()
        connection.close()


def delete_user(user_id: int):
    connection, cursor = connect_to_postgres()
    
    query = "DELETE FROM users WHERE id = %s;"
    
    try:
        cursor.execute(query, (user_id,))
        connection.commit()  
        return user_id  

    except Exception as error:
        logger.error(f"Error deleting user: {error}")
        connection.rollback() 
        return None

    finally:
        cursor.close()
        connection.close()
