from fastapi import APIRouter, Depends
from app.controllers.user import UserController
from app.models.user import User
from app.api.routes import get_current_user

router = APIRouter(
    prefix="/users",
    tags=[
        "users"
    ]
)

user_controller = UserController()

# @router.get("/")
# def read_users():
#     return user_controller.read_users()


# @router.get("/user/")
# def read_user(user_id: str):
#     return user_controller.read_user(user_id=user_id)


@router.post("/user/post")
def post_user(user: User):
    return user_controller.create_user(user.email, user.password)


@router.put("/user/update")
def update_user(old_password:str, new_password: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user['sub']
    return user_controller.update_user(old_password, new_password, user_id)


# @router.delete("/user/delete")
# def delete_user(user: str):
#     return user_controller.delete_user(user)