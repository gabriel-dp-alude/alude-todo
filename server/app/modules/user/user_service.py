from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from . import user_model as UserModel
from ...utils.auth import generate_password_hash


class UserAlreadyExists(Exception):
    pass


class UserNotFound(Exception):
    pass


async def create_user(
    session: AsyncSession, payload: UserModel.UserCreate
) -> UserModel.UserEntity:
    user = UserModel.UserEntity(
        username=payload.username,
        password_hash=generate_password_hash(payload.password),
    )

    session.add(user)

    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise UserAlreadyExists()

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
    session: AsyncSession, user_id: int, payload: UserModel.UserUpdate
) -> UserModel.UserEntity:
    user = await get_user(session, user_id)

    if payload.username is not None:
        user.username = payload.username
    if payload.password is not None:
        user.password_hash = generate_password_hash(payload.password)
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise UserAlreadyExists()

    await session.refresh(user)
    return user


async def delete_user(session: AsyncSession, user_id: int) -> None:
    user = await get_user(session, user_id)
    await session.delete(user)
    await session.commit()
