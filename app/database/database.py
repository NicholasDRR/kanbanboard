import psycopg2

from ..config.logging import logger
from ..parameters import POSTGRES_HOST, POSTGRES_DATABASE, POSTGRES_PORT, POSTGRES_PASSWORD, POSTGRES_USER


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
        # Estabelecer a conexão
        conn = psycopg2.connect(
            host=host,
            port=port,
            database=db_name,
            user=user,
            password=password
        )
        conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)

        # Criar um cursor
        cursor = conn.cursor()
        logger.info("Conexão ao banco de dados estabelecida com sucesso.")
        return conn, cursor

    except Exception as e:
        logger.error("Ocorreu um erro ao conectar ao banco de dados:", e)
        return None, None