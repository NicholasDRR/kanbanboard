FROM python:3.10-slim

# Define o diretório de trabalho
WORKDIR /code

# Instala dependências do sistema, incluindo libssl-dev e ca-certificates
RUN apt-get update && \
    apt-get install -y libsystemd-dev gcc libssl-dev ca-certificates && \
    rm -rf /var/lib/apt/lists/*

RUN update-ca-certificates

# Atualiza o pip e instala as dependências do Python
COPY ./requirements.txt /code/requirements.txt
RUN pip install --upgrade pip \
    && pip install "cython<3.0.0" wheel \
    && pip install "pyyaml==5.4.1" --no-build-isolation \
    && pip install python-multipart \
    && pip install -r /code/requirements.txt

# Copia os arquivos da aplicação e o .env para o container
COPY ./app /code/app
COPY ./.env /code/
COPY ./init-db/ /init-db

# Define o PYTHONPATH para incluir o diretório da aplicação
ENV PYTHONPATH=/code/app

# Comando para iniciar o servidor
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
