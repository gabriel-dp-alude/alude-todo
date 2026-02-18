from quart import Blueprint, request, jsonify
from quart_schema import tag, validate_request, validate_response

from ...config.database import AsyncSessionLocal
from . import user_service as UserService
from . import user_model as UserModel


bp = Blueprint("users", __name__, url_prefix="/users")
USERS_TAG = ["Users"]


@bp.post("/")
@validate_request(UserModel.UserCreate)
@validate_response(UserModel.UserRead, 201)
@tag(USERS_TAG)
async def create_user():
    data = await request.get_json()
    payload = UserModel.UserCreate(**data)

    async with AsyncSessionLocal() as session:
        try:
            user = await UserService.create_user(session, payload)
        except UserService.UserAlreadyExists:
            return jsonify({"error": "Username already exists"}), 400

        return (
            jsonify(UserModel.UserRead.model_validate(user).model_dump()),
            201,
        )


@bp.get("/")
@validate_response(list[UserModel.UserRead], 200)
@tag(USERS_TAG)
async def list_users():
    async with AsyncSessionLocal() as session:
        users = await UserService.list_users(session)
        return jsonify(
            [UserModel.UserRead.model_validate(u).model_dump() for u in users]
        )


@bp.get("/<int:user_id>")
@validate_response(UserModel.UserRead, 200)
@tag(USERS_TAG)
async def get_user(user_id: int):
    async with AsyncSessionLocal() as session:
        try:
            user = await UserService.get_user(session, user_id)
        except UserService.UserNotFound:
            return jsonify({"error": "User not found"}), 404

        return jsonify(UserModel.UserRead.model_validate(user).model_dump())


@bp.patch("/<int:user_id>")
@validate_request(UserModel.UserUpdate)
@validate_response(UserModel.UserRead, 200)
@tag(USERS_TAG)
async def update_user(user_id: int):
    data = await request.get_json()
    payload = UserModel.UserUpdate(**data)

    async with AsyncSessionLocal() as session:
        try:
            user = await UserService.update_user(session, user_id, payload)
        except UserService.UserNotFound:
            return jsonify({"error": "User not found"}), 404
        except UserService.UserAlreadyExists:
            return jsonify({"error": "Username already exists"}), 400

        return jsonify(UserModel.UserRead.model_validate(user).model_dump())


@bp.delete("/<int:user_id>")
@validate_response(UserModel.UserDelete, 204)
@tag(USERS_TAG)
async def delete_user(user_id: int):
    async with AsyncSessionLocal() as session:
        try:
            await UserService.delete_user(session, user_id)
        except UserService.UserNotFound:
            return jsonify({"error": "User not found"}), 404

        return "", 204
