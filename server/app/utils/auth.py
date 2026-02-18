import bcrypt
import secrets
import hashlib
from functools import wraps
from quart import jsonify, g

from app.utils.exceptions import APIException


# PASSWORD management
def generate_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, stored_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), stored_hash.encode())


# SESSION management
def generate_session_token() -> str:
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


# LOGIN AUTH management
class AuthRequired(APIException):
    status_code = 401
    error_code = "authentication_required"

    def __init__(self):
        super().__init__("Authentication required")


async def require_auth():
    if not getattr(g, "current_user", None):
        raise AuthRequired()


def login_required(fn):
    @wraps(fn)
    async def wrapper(*args, **kwargs):
        result = await require_auth()
        if result:
            return result
        return await fn(*args, **kwargs)

    return wrapper
