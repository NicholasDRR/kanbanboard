from fastapi import APIRouter
from app.controllers.user import UserController
from app.models.user import User, UserUpdate

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
def update_user(user_id: str, user: UserUpdate):
    return user_controller.update_user(user_id, user.email, user.password)


# @router.delete("/user/delete")
# def delete_user(user: str):
#     return user_controller.delete_user(user)