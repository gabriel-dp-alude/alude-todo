import os
from quart import Quart, jsonify
from quart_schema import QuartSchema
from dotenv import load_dotenv

from .config.logs import configure_logs
from .config.session import configure_session_middleware
from .modules import ROUTE_BLUEPRINTS

load_dotenv()


def create_app():
    app = Quart(__name__)

    # App config
    QuartSchema(app, info={"title": "API Docs", "version": "0.1.0"})
    app.config["ENV"] = os.getenv("ENV", "development")
    app.config["DEBUG"] = os.getenv("DEBUG", "false").lower() == "true"
    configure_logs(app)
    configure_session_middleware(app)

    # Register blueprints
    for bp in ROUTE_BLUEPRINTS:
        app.register_blueprint(bp)

    # Simple health route
    @app.route("/")
    async def health():
        return jsonify({"status": "ok"})

    return app
