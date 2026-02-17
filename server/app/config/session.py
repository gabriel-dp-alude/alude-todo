from quart import g, request
from sqlalchemy import select
from datetime import datetime

from .database import AsyncSessionLocal
from ..utils.auth import hash_token
from ..modules.user.user_model import UserEntity
from ..modules.auth.auth_model import Session


def configure_session_middleware(app):
    @app.before_request
    async def load_user():
        token = request.cookies.get("session")

        if not token:
            g.current_user = None
            return

        token_hash = hash_token(token)

        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(Session, UserEntity)
                .join(UserEntity)
                .where(Session.session_token_hash == token_hash)
                .where(Session.expires_at > datetime.utcnow())
            )

            row = result.first()

            if not row:
                g.current_user = None
                return

            g.current_user = row.UserEntity
