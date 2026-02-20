from quart import Quart, jsonify, request

from app.modules import ROUTE_BLUEPRINTS


def configure_routes(app: Quart):
    for bp in ROUTE_BLUEPRINTS:
        app.register_blueprint(bp)

    # Simple health route
    @app.route("/")
    async def health():
        return jsonify({"status": "ok"})

    # Solve CORS problem with OPTIONS requests
    @app.before_request
    async def check_auth():
        if request.method == "OPTIONS":
            return "", 200
