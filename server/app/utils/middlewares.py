from quart import g
from functools import wraps

from app.utils.auth import Unauthorized


def require_auth():
    if not getattr(g, "current_user", None):
        raise Unauthorized()


def login_required(fn):
    @wraps(fn)
    async def wrapper(*args, **kwargs):
        require_auth()
        return await fn(*args, **kwargs)

    return wrapper
