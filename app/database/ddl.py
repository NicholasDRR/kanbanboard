def create_database(cursor):
    # Verifica se o banco de dados já existe
    cursor.execute("""
    SELECT 1 FROM pg_database WHERE datname = 'task_management';
    """)
    
    if not cursor.fetchone():
        cursor.connection.rollback()  # Commit para sair da transação atual
        cursor.execute("""
        CREATE DATABASE task_management;
        """)

def create_tables(cursor):
    # Verifica e cria a extensão 'uuid-ossp' se não existir
    cursor.execute("""
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    """)

    cursor.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
            CREATE TYPE task_status AS ENUM (
                'backlog', 
                'doing', 
                'review', 
                'done' 
            );
        END IF;
    END $$;
    """)
    
    cursor.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
            CREATE TYPE task_priority AS ENUM (
                'low', 
                'medium', 
                'high'
            );
        END IF;
    END $$;
    """)

    # Criando a tabela 'users' se não existir
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    );
    """)

    # Criando a tabela 'tasks' se não existir
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status task_status NOT NULL,
        priority task_priority NOT NULL,
        link VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # Criando a tabela 'Revoked_Tokens' se não existir
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS Revoked_Tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL, 
        token VARCHAR(255) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)
