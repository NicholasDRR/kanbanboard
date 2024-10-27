import psycopg2
from pymongo import MongoClient
from fastapi import HTTPException

from ..config.logging import logger
from ..parameters import POSTGRES_HOST, POSTGRES_DATABASE, POSTGRES_PORT, POSTGRES_PASSWORD, POSTGRES_USER, MONGODB_HOST, MONGODB_PASSWORD, MONGODB_PORT, MONGODB_USERNAME, MONGODB_DATABASE


def get_mongo_client():
    mongo_uri = f"mongodb://{MONGODB_USERNAME}:{MONGODB_PASSWORD}@{MONGODB_HOST}:{MONGODB_PORT}/"
    return MongoClient(mongo_uri)[MONGODB_DATABASE]


def connect_to_postgres(host: str = POSTGRES_HOST, port: str = POSTGRES_PORT, db_name: str = POSTGRES_DATABASE, 
                user: str = POSTGRES_USER, password: str = POSTGRES_PASSWORD):
    """
    Estabelece uma conexão com o banco de dados PostgreSQL e retorna a conexão e o cursor.

    :param host: Endereço do host do banco de dados
    :param port: Porta do banco de dados
    :param dbname: Nome do banco de dados
    :param user: Nome de usuário do banco de dados
    :param password: Senha do banco de dados
    :return: Uma tupla contendo a conexão e o cursor
    """
    try:
        conn = psycopg2.connect(
            host=host,
            port=port,
            database=db_name,
            user=user,
            password=password
        )
        conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        logger.info("Conexão ao banco de dados estabelecida com sucesso.")
        return conn, cursor

    except Exception as e:
        logger.error("Ocorreu um erro ao conectar ao banco de dados:", e)
        return None, None
    


def clone_postgres_to_mongodb(user_id: str):
    # Load environment variables
    pg_host = POSTGRES_HOST
    pg_port = POSTGRES_PORT
    pg_database = POSTGRES_DATABASE
    pg_user = POSTGRES_USER
    pg_password = POSTGRES_PASSWORD

    mongo_host = MONGODB_HOST
    mongo_port = MONGODB_PORT
    mongo_username = MONGODB_USERNAME
    mongo_password = MONGODB_PASSWORD
    mongo_database = MONGODB_DATABASE

    pg_conn = psycopg2.connect(
        dbname=pg_database,
        user=pg_user,
        password=pg_password,
        host=pg_host,
        port=pg_port
    )
    pg_cursor = pg_conn.cursor()
    
    mongo_uri = f"mongodb://{mongo_username}:{mongo_password}@{mongo_host}:{mongo_port}/"
    mongo_client = MongoClient(mongo_uri)
    mongo_db = mongo_client[mongo_database]

    try:
        # Clone user data (optional, if needed)
        pg_cursor.execute("SELECT * FROM users WHERE id = %s;", (user_id,))
        user_row = pg_cursor.fetchone()
        if user_row:
            user_col_names = [desc[0] for desc in pg_cursor.description]
            user_document = {user_col_names[i]: user_row[i] for i in range(len(user_col_names))}
            mongo_db['users'].update_one(
                {"id": user_id},  # Assume 'id' is a unique field
                {"$set": user_document},
                upsert=True
            )
            logger.info('User document cloned/updated successfully.')

        # Clone tasks for the specific user
        pg_cursor.execute("SELECT * FROM tasks WHERE user_id = %s;", (user_id,))
        task_rows = pg_cursor.fetchall()
        task_col_names = [desc[0] for desc in pg_cursor.description]

        # Prepare documents for MongoDB
        task_documents = []
        for row in task_rows:
            task_document = {task_col_names[i]: row[i] for i in range(len(task_col_names))}
            task_documents.append(task_document)

        # Insert documents into MongoDB
        if task_documents:
            for task_document in task_documents:
                mongo_db['tasks'].update_one(
                    {"id": task_document['id']},  # Substitua 'id' pelo campo único de tarefa
                    {"$set": task_document},
                    upsert=True
                )
            logger.info(f'Inserted/updated {len(task_documents)} task documents into tasks collection.')
        else:
            logger.info(f'No tasks found for user_id {user_id}.')

        # Clone revoked tokens for the specific user
        pg_cursor.execute("SELECT * FROM revoked_tokens WHERE user_id = %s;", (user_id,))
        revoked_rows = pg_cursor.fetchall()
        revoked_col_names = [desc[0] for desc in pg_cursor.description]

        revoked_documents = []
        for row in revoked_rows:
            revoked_document = {revoked_col_names[i]: row[i] for i in range(len(revoked_col_names))}
            revoked_documents.append(revoked_document)

        # Insert revoked tokens into MongoDB
        if revoked_documents:
            for revoked_document in revoked_documents:
                mongo_db['revoked_tokens'].update_one(
                    {"id": revoked_document['id']},  # Substitua 'id' pelo campo único de token revogado
                    {"$set": revoked_document},
                    upsert=True
                )
            logger.info(f'Inserted/updated {len(revoked_documents)} revoked token documents into revoked_tokens collection.')
        else:
            logger.info(f'No revoked tokens found for user_id {user_id}.')

        return {"message": "Data cloned successfully."}

    except Exception as e:
        logger.error(f'Error: {e}')
        raise HTTPException(status_code=500, detail="An error occurred while cloning data.")
    finally:
        pg_cursor.close()
        pg_conn.close()
        mongo_client.close()