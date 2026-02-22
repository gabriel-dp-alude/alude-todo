from quart import g
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.auth import Forbidden, generate_password_hash
from app.utils.exceptions import APIException
from . import user_model as UserModel


class UsernameAlreadyExists(APIException):
    status_code = 409
    error_code = "username_already_exists"

    def __init__(self):
        super().__init__("Username already exists")


class UserNotFound(APIException):
    status_code = 404
    error_code = "user_not_found"

    def __init__(self):
        super().__init__("User not found")


async def create_user(
    session: AsyncSession, data: UserModel.UserCreate
) -> UserModel.UserEntity:
    user = UserModel.UserEntity(
        username=data.username,
        password_hash=generate_password_hash(data.password),
    )

    session.add(user)

    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise UsernameAlreadyExists()

    await session.refresh(user)
    return user


async def list_users(session: AsyncSession) -> list[UserModel.UserEntity]:
    result = await session.execute(select(UserModel.UserEntity))
    return result.scalars().all()


async def get_user(session: AsyncSession, user_id: int) -> UserModel.UserEntity:
    result = await session.execute(
        select(UserModel.UserEntity).where(
            UserModel.UserEntity.id_user == user_id
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        raise UserNotFound()

    return user


async def update_user(
    session: AsyncSession, user_id: int, data: UserModel.UserUpdate
) -> UserModel.UserEntity:
    current_id_user = g.current_user.id_user
    if current_id_user != user_id:
        raise Forbidden("You cannot modify data from other users")

    user = await get_user(session, user_id)

    if data.username is not None:
        user.username = data.username
    if data.password is not None:
        user.password_hash = generate_password_hash(data.password)

    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise UsernameAlreadyExists()

    await session.refresh(user)
    return user


async def delete_user(session: AsyncSession, user_id: int) -> None:
    current_id_user = g.current_user.id_user
    if current_id_user != user_id:
        raise Forbidden("You cannot delete other users")

    user = await get_user(session, user_id)
    await session.delete(user)
    await session.commit()


async def get_user_by_username(session: AsyncSession, username: str):
    result = await session.execute(
        select(UserModel.UserEntity).where(
            UserModel.UserEntity.username == username
        )
    )
    user = result.scalar_one_or_none()

    if not user:
        raise UserNotFound()

    return user
