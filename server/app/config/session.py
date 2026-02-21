from quart import Quart, g, request

from app.utils.database import AsyncSessionLocal
from app.utils.auth import Unauthorized, decode_access_token
from app.modules.user import user_model as UserModel


def get_bearer_token():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise Unauthorized("Missing or invalid Authorization header")

    return auth_header.split(" ")[1]


async def get_current_user(session, token):
    payload = decode_access_token(token)
    id_user = payload["sub"]

    user = await session.get(UserModel.UserEntity, int(id_user))
    if not user:
        raise Unauthorized("User not found")

    return user


def configure_session_middleware(app: Quart):
    @app.before_request
    async def attach_current_user():
        g.current_user = None
        async with AsyncSessionLocal() as session:
            try:
                token = get_bearer_token()
                g.current_user = await get_current_user(session, token)
            except Unauthorized:
                # Having a session is not required for all routes
                return
