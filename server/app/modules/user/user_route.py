from quart import Blueprint, request
from quart_schema import validate_request, validate_response, tag_blueprint

from app.utils.database import AsyncSessionLocal
from . import user_service as UserService
from . import user_model as UserModel


bp = Blueprint("users", __name__, url_prefix="/users")
tag_blueprint(bp, ["Users"])


@bp.post("/")
@validate_request(UserModel.UserCreate)
# @validate_response(UserModel.UserRead, 201)
async def create_user(data: UserModel.UserCreate):
    async with AsyncSessionLocal() as session:
        user = await UserService.create_user(session, data)
        return UserModel.UserRead.model_validate(user).model_dump(), 400


@bp.get("/")
@validate_response(list[UserModel.UserRead], 200)
async def list_users():
    async with AsyncSessionLocal() as session:
        users = await UserService.list_users(session)
        return [
            UserModel.UserRead.model_validate(u).model_dump() for u in users
        ]


@bp.get("/<int:user_id>")
@validate_response(UserModel.UserRead, 200)
async def get_user(user_id: int):
    async with AsyncSessionLocal() as session:
        user = await UserService.get_user(session, user_id)
        return UserModel.UserRead.model_validate(user).model_dump()


@bp.patch("/<int:user_id>")
@validate_request(UserModel.UserUpdate)
@validate_response(UserModel.UserRead, 200)
async def update_user(user_id: int, data: UserModel.UserUpdate):
    async with AsyncSessionLocal() as session:
        user = await UserService.update_user(session, user_id, data)
        return UserModel.UserRead.model_validate(user).model_dump()


@bp.delete("/<int:user_id>")
async def delete_user(user_id: int):
    async with AsyncSessionLocal() as session:
        await UserService.delete_user(session, user_id)
        return "", 204
