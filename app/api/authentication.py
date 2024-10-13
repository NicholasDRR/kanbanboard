from jose import jwt
from datetime import datetime, timedelta
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import APIRouter, Depends, HTTPException, status

from app.controllers.user import UserController

router = APIRouter(
    prefix="/auth",
    tags=[
        "auth"
    ]
)

user_controller = UserController()


@router.post("/login")
def login(user: OAuth2PasswordRequestForm = Depends()):   
    token = user_controller.login(user)
    return JSONResponse(status_code=status.HTTP_200_OK, content={'access_token': token})

        
@router.post("/logout")
def logout(token: str = Depends(user_controller.return_token)):
    revoked_token = user_controller.logout(token)
    if revoked_token:
        return JSONResponse(status_code=status.HTTP_200_OK, content={"msg": f"The token has been revoked! {revoked_token}"})
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail={"msg": "The token has not been revoked!"}) 


@router.post('/token_health')
def token_health_check(payload: dict = Depends(user_controller.verify_token_health)):
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail={"msg": "User or passwords incorrects!"}
        )

    return JSONResponse(
        content={'msg': 'token is valid', 'token': payload},
        status_code=status.HTTP_200_OK
        )