from app.database.database import connect_to_postgres
from app.config.logging import logger

def select_revoked_token(user_id: int, token: str):
    connection, cursor = connect_to_postgres()
    
    query = """
    SELECT user_id, token
    FROM Revoked_Tokens
    WHERE token = %s AND user_id = %s;
    """
    
    try:
        cursor.execute(query, (token, user_id))
        revoked_token = cursor.fetchone()  # Fetch a single revoked token record
        return revoked_token  # Return the fetched token or None if not found

    except Exception as error:
        logger.error(f"Error fetching revoked token: {error}")
        return None

    finally:
        cursor.close()
        connection.close()


def insert_revoked_tokens(user_id: int, token: str):
    connection, cursor = connect_to_postgres()

    query = """
    INSERT INTO Revoked_Tokens (user_id, token)
    VALUES (%s, %s);
    """
    
    try:
        cursor.execute(query, (user_id, token))
        connection.commit()  # Commit the transaction
        return token  # Return True if the insert was successful

    except Exception as error:
        logger.error(f"Error inserting revoked token: {error}")
        connection.rollback()  # Rollback the transaction in case of error
        return False  # Return False if the insert failed

    finally:
        cursor.close()
        connection.close()
