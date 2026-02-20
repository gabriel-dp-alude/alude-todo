from quart import Blueprint, request, jsonify, make_response
from quart_schema import tag, tag_blueprint, validate_request, validate_response

from app.utils.database import AsyncSessionLocal
from app.utils.auth import login_required, hash_token
from app.modules.user import user_model as UserModel
from . import auth_service as AuthService
from . import auth_model as AuthModel


bp = Blueprint("auth", __name__, url_prefix="/auth")
tag_blueprint(bp, ["Auth"])


@bp.post("/login")
@validate_request(AuthModel.Login)
async def login_route(data: AuthModel.Login):
    async with AsyncSessionLocal() as session:
        token, user = await AuthService.login(
            session, data.username, data.password
        )

        response = await make_response(
            UserModel.UserRead.model_validate(user).model_dump()
        )
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
