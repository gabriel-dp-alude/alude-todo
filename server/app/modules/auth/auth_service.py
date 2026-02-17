from datetime import datetime, timedelta
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from ...utils.auth import generate_session_token, hash_token, verify_password
from ..user.user_model import UserEntity
from .auth_model import Session


class InvalidCredentials(Exception):
    pass


async def login(session: AsyncSession, username: str, password: str):
    result = await session.execute(
        select(UserEntity).where(UserEntity.username == username)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise InvalidCredentials()

    if not verify_password(password, user.password_hash):
        raise InvalidCredentials()

    raw_token = generate_session_token()
    token_hash = hash_token(raw_token)

    db_session = Session(
        id_user=user.id_user,
        session_token_hash=token_hash,
        expires_at=datetime.utcnow() + timedelta(days=7),
    )

    session.add(db_session)
    await session.commit()

    return raw_token, user


async def logout(session: AsyncSession, token_hash: str):
    await session.execute(
        delete(Session).where(Session.session_token_hash == token_hash)
    )
    await session.commit()
