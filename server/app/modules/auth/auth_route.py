from quart import Blueprint, g, request, jsonify, make_response
from quart_schema import tag_blueprint, validate_request

from app.utils.database import AsyncSessionLocal
from app.utils.middlewares import login_required
from app.modules.user import user_model as UserModel
from . import auth_service as AuthService
from . import auth_model as AuthModel


bp = Blueprint("auth", __name__, url_prefix="/auth")
tag_blueprint(bp, ["Auth"])


@bp.post("/login")
@validate_request(AuthModel.Login)
async def login_route(data: AuthModel.Login):
    async with AsyncSessionLocal() as session:
        access_token, refresh_token, user = await AuthService.login(
            session, data.username, data.password
        )

        response = await make_response(
            {
                "access_token": access_token,
                "user": UserModel.UserRead.model_validate(user).model_dump(),
            }
        )

        response.set_cookie(
            "refresh_token",
            refresh_token,
            httponly=True,
            secure=True,
            samesite="Strict",
            max_age=7 * 24 * 60 * 60,
        )
        return response


@bp.post("/logout")
@login_required
async def logout():
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        async with AsyncSessionLocal() as session:
            await AuthService.delete_refresh_token(session, refresh_token)

    response = await make_response(jsonify({"message": "Logged out"}))
    response.delete_cookie("refresh_token")
    return response


@bp.post("/refresh")
async def refresh_route():
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise AuthService.Unauthorized()

    async with AsyncSessionLocal() as session:
        new_access_token, new_refresh_token = await AuthService.refresh(
            session, refresh_token
        )

        response = await make_response({"access_token": new_access_token})

        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token,
            httponly=True,
            secure=True,
            samesite="Strict",
            max_age=7 * 24 * 60 * 60,
        )

        return response


@bp.get("/me")
@login_required
async def me_route():
    user = g.current_user
    return UserModel.UserRead.model_validate(user).model_dump()
