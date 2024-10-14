from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.authentication import router as router_authentication
from app.api.routes import router as router_tasks
from app.api.user import router as router_user
from app.services.database import DatabaseService

app = FastAPI()


origins = [
    "http://54.219.225.136.tiangolo.com",
    "https://54.219.225.136.tiangolo.com",
    "http://54.219.225.136",
    "http://54.219.225.136/",
    "http://54.219.225.136:3001",
    "http://54.219.225.136:3001/",
    "http://54.219.225.136:3000",
    "http://54.219.225.136:3000/",
    "http://54.219.225.136:3000/",
    "http://54.219.225.136:5000",
    "http://54.219.225.136:5000/",
    "http://54.219.225.136:5500",
    "http://54.219.225.136:5500/",
    "http://54.219.225.136:80"
    "http://54.219.225.136:80/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(router=router_tasks)
app.include_router(router=router_authentication)
app.include_router(router=router_user)