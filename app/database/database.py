import psycopg2
from pymongo import MongoClient

from ..config.logging import logger
from ..parameters import POSTGRES_HOST, POSTGRES_DATABASE, POSTGRES_PORT, POSTGRES_PASSWORD, POSTGRES_USER, MONGODB_HOST, MONGODB_PASSWORD, MONGODB_PORT, MONGODB_USERNAME, MONGODB_DATABASE


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
    

def get_mongodb_tasks_collection(host: str = MONGODB_HOST, port: int = MONGODB_PORT, username: str = MONGODB_USERNAME,
                                password: str = MONGODB_PASSWORD, database_name: str = MONGODB_DATABASE, logger=logger):
    """
    Estabelece uma conexão com o banco de dados MongoDB, cria a coleção 'tasks' se não existir, e a retorna.

    :param host: Endereço do host do MongoDB
    :param port: Porta do MongoDB
    :param username: Nome de usuário do MongoDB
    :param password: Senha do MongoDB
    :param database_name: Nome do banco de dados do MongoDB
    :param logger: Logger para registrar mensagens
    :return: Objeto da coleção 'tasks' do MongoDB
    """
    try:
        mongo_uri = f"mongodb://{username}:{password}@{host}:{port}/"
        client = MongoClient(mongo_uri)
        db = client[database_name]
        
        # Cria a coleção 'tasks' caso ela ainda não exista
        collection_name = 'tasks'
        if collection_name not in db.list_collection_names():
            db.create_collection(collection_name)
            logger.info(f"Coleção '{collection_name}' criada com sucesso.")
        else:
            logger.info(f"Coleção '{collection_name}' já existe.")
        
        collection = db[collection_name]
        logger.info("Conexão ao banco de dados MongoDB estabelecida com sucesso.")
        return collection

    except Exception as e:
        logger.error("Ocorreu um erro ao conectar ao MongoDB:", e)
        return None