-- Create the uuid-ossp extension if it does not exist
CREATE EXTENSION IF NOT EXISTS dblink;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'task_management') THEN 
        PERFORM dblink_exec('dbname=postgres', 'CREATE DATABASE task_management');
    END IF; 
END $$;

\c task_management

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create task_status ENUM type in task_mgmt schema if it does not exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN 
        CREATE TYPE task_status AS ENUM ('backlog', 'doing', 'review', 'done'); 
    END IF; 
END $$;

-- Create task_priority ENUM type in task_mgmt schema if it does not exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN 
        CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high'); 
    END IF; 
END $$;

-- Create the users table in task_mgmt schema if it does not exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Create the tasks table in task_mgmt schema if it does not exist
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status task_status NOT NULL,
    priority task_priority NOT NULL,
    link VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    active BOOLEAN DEFAULT TRUE, -- nova coluna para indicar se a tarefa está ativa
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create the Revoked_Tokens table in task_mgmt schema if it does not exist
CREATE TABLE IF NOT EXISTS revoked_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, 
    token VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);