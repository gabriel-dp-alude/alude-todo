from quart import Blueprint, request, jsonify, make_response
from quart_schema import tag, validate_request, validate_response

from ...config.database import AsyncSessionLocal
from ...utils.auth import login_required, hash_token
from . import auth_service as AuthService
from . import auth_model as AuthModel


bp = Blueprint("auth", __name__, url_prefix="/auth")
AUTH_TAG = ["Auth"]


@bp.post("/login")
@validate_request(AuthModel.Login)
@tag(AUTH_TAG)
async def login_route():
    data = await request.get_json()
    payload = AuthModel.Login(**data)

    async with AsyncSessionLocal() as session:
        try:
            token, user = await AuthService.login(
                session, payload.username, payload.password
            )
        except AuthService.InvalidCredentials:
            return jsonify({"error": "Invalid credentials"}), 401

        response = await make_response(jsonify({"message": "Logged in"}))

        response.set_cookie(
            "session",
            token,
            httponly=True,
            secure=True,
            samesite="Strict",
            max_age=7 * 24 * 60 * 60,
        )

        return response


@bp.post("/logout")
@tag(AUTH_TAG)
@login_required
async def logout():
    token = request.cookies.get("session")
    token_hash = hash_token(token)

    async with AsyncSessionLocal() as session:
        await AuthService.logout(session, token_hash)

    response = await make_response(jsonify({"message": "Logged out"}))
    response.delete_cookie("session")
    return response
