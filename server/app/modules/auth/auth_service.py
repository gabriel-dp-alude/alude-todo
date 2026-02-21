from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.auth import (
    Unauthorized,
    generate_access_token,
    generate_refresh_token,
    hash_token,
    verify_password,
)
from app.utils.exceptions import APIException
from app.modules.user import user_service as UserService
from . import auth_model as AuthModel


class InvalidCredentials(APIException):
    status_code = 403
    error_code = "invalid_credentials"

    def __init__(self):
        super().__init__("Invalid Credentials, check Username or Password")


async def get_refresh_token(session, refresh_token) -> AuthModel.Session:
    result = await session.execute(
        select(AuthModel.Session).where(
            AuthModel.Session.session_token_hash == hash_token(refresh_token)
        )
    )
    return result.scalar_one_or_none()


async def delete_refresh_token(session: AsyncSession, refresh_token: str):
    token = await get_refresh_token(session, refresh_token)
    await session.delete(token)
    await session.commit()


async def login(session: AsyncSession, username: str, password: str):
    try:
        user = await UserService.get_user_by_username(session, username)
    except UserService.UserNotFound:
        raise InvalidCredentials()

    if not verify_password(password, user.password_hash):
        raise InvalidCredentials()

    access_token = generate_access_token(user.id_user)
    refresh_token = generate_refresh_token()

    auth_session = AuthModel.Session(
        id_user=user.id_user,
        session_token_hash=hash_token(refresh_token),
        expires_at=datetime.utcnow() + timedelta(days=7),
    )
    session.add(auth_session)
    await session.commit()

    return access_token, refresh_token, user


async def refresh(session, raw_refresh_token: str):
    stored = await get_refresh_token(session, raw_refresh_token)

    if not stored or stored.expires_at < datetime.utcnow():
        raise Unauthorized()

    user = await UserService.get_user(session, stored.id_user)
    # await delete_refresh_token(session, raw_refresh_token)

    new_access_token = generate_access_token(user.id_user)
    # #new_refresh_token = generate_refresh_token()

    # auth_session = AuthModel.Session(
    #     id_user=user.id_user,
    #     session_token_hash=hash_token(new_refresh_token),
    #     expires_at=datetime.utcnow() + timedelta(days=7),
    # )
    # session.add(auth_session)
    # await session.commit()

    return new_access_token, raw_refresh_token
