import bcrypt
import secrets
import hashlib
from functools import wraps
from quart import jsonify, g


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
async def require_auth():
    if not getattr(g, "current_user", None):
        return jsonify({"error": "Authentication required"}), 401


def login_required(fn):
    @wraps(fn)
    async def wrapper(*args, **kwargs):
        result = await require_auth()
        if result:
            return result
        return await fn(*args, **kwargs)

    return wrapper
