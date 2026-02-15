import os
from quart import Quart, jsonify
from dotenv import load_dotenv

from .config.logs import configure_logs
from .modules.user.user_route import bp as users_bp

load_dotenv()


def create_app():
    app = Quart(__name__)

    app.config["ENV"] = os.getenv("ENV", "development")
    app.config["DEBUG"] = os.getenv("DEBUG", "false").lower() == "true"
    configure_logs(app)

    # Register blueprints
    app.register_blueprint(users_bp)

    @app.route("/")
    async def health():
        return jsonify({"status": "ok"})

    return app
