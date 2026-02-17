from quart import Blueprint, request, jsonify, make_response

from ...config.database import AsyncSessionLocal
from ...utils.auth import login_required, hash_token
from . import auth_service as AuthService

bp = Blueprint("auth", __name__, url_prefix="/auth")


@bp.post("/login")
async def login_route():
    data = await request.get_json()

    async with AsyncSessionLocal() as session:
        try:
            token, user = await AuthService.login(
                session, data["username"], data["password"]
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
@login_required
async def logout():
    token = request.cookies.get("session")
    token_hash = hash_token(token)

    async with AsyncSessionLocal() as session:
        await AuthService.logout(session, token_hash)

    response = await make_response(jsonify({"message": "Logged out"}))
    response.delete_cookie("session")
    return response
