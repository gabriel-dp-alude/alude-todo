import jwt
import bcrypt
import secrets
import hashlib
from os import getenv
from datetime import datetime, timedelta

from app.utils.exceptions import APIException


class Unauthorized(APIException):
    status_code = 401
    error_code = "unauthorized"

    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message)


# PASSWORD management
def generate_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, stored_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), stored_hash.encode())


# REFRESH TOKEN management
def generate_refresh_token() -> str:
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


# ACCESS TOKEN management
def generate_access_token(user_id: int):
    payload = {
        "sub": str(user_id),
        "exp": datetime.utcnow() + timedelta(minutes=15),
        "type": "access",
    }
    return jwt.encode(payload, getenv("SECRET_KEY"), algorithm="HS256")


def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, getenv("SECRET_KEY"), algorithms=["HS256"])

        if payload.get("type") != "access":
            raise Unauthorized("Invalid token type")

        return payload
    except jwt.ExpiredSignatureError:
        raise Unauthorized("Token expired")
    except jwt.InvalidTokenError:
        raise Unauthorized("Invalid token")
