TO RUN
fastapi dev app/main.py

localserver
http://127.0.0.1:8000/docs
http://127.0.0.1:8000/redoc


RUN postgres
sudo docker run --name my-postgres -e POSTGRES_PASSWORD=123 -d -p 5432:5432 postgres  

show containers running
sudo docker ps   

enter postgres
sudo docker exec -it my-postgres psql -U postgres

stop container 
sudo docker stop my-postgres

remove container
docker rm my-postgres

persistency volume
sudo docker run --name my-postgres2 -e POSTGRES_PASSWORD=123 -d -p 5432:5432 -v pgdata:/var/lib/postgresql/data --network rede1 postgres


redis server
sudo apt-get install redis-server
sudo service redis-server start


run dockercompose 
sudo docker compose up


 sudo docker compose up --build;
 docker-compose up -d
 sudo docker compose down