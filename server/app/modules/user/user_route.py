from quart import Blueprint, request, jsonify
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from ...config.database import AsyncSessionLocal
from .user_model import User, UserCreate, UserRead, UserUpdate

bp = Blueprint("users", __name__, url_prefix="/users")


@bp.post("/")
async def create_user():
    data = await request.get_json()
    payload = UserCreate(**data)

    async with AsyncSessionLocal() as session:
        user = User(
            name=payload.name,
            email=payload.email,
        )
        session.add(user)

        try:
            await session.commit()
        except IntegrityError:
            await session.rollback()
            return jsonify({"error": "Email already exists"}), 400

        await session.refresh(user)

        return jsonify(UserRead.model_validate(user).model_dump()), 201


@bp.get("/")
async def list_users():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User))
        users = result.scalars().all()

        return jsonify([UserRead.model_validate(u).model_dump() for u in users])


@bp.get("/<int:user_id>")
async def get_user(user_id: int):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify(UserRead.model_validate(user).model_dump())


@bp.patch("/<int:user_id>")
async def update_user(user_id: int):
    data = await request.get_json()
    payload = UserUpdate(**data)

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            return jsonify({"error": "User not found"}), 404

        if payload.name is not None:
            user.name = payload.name

        if payload.email is not None:
            user.email = payload.email

        try:
            await session.commit()
        except IntegrityError:
            await session.rollback()
            return jsonify({"error": "Email already exists"}), 400

        await session.refresh(user)

        return jsonify(UserRead.model_validate(user).model_dump())


@bp.delete("/<int:user_id>")
async def delete_user(user_id: int):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            return jsonify({"error": "User not found"}), 404

        await session.delete(user)
        await session.commit()

        return "", 204
