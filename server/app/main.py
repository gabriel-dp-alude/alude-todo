from os import getenv
from quart import Quart
from quart_schema import QuartSchema
from dotenv import load_dotenv

from app.config.routes import configure_routes
from app.config.logs import configure_logs
from app.config.session import configure_session_middleware
from app.config.errors import configure_exception_handler

load_dotenv()


def create_app():
    app = Quart(__name__)

    # App config
    QuartSchema(app, info={"title": "API Docs", "version": "0.1.0"})
    app.config["ENV"] = getenv("ENV", "development")
    app.config["DEBUG"] = getenv("DEBUG", "false").lower() == "true"
    configure_logs(app)
    configure_session_middleware(app)
    configure_routes(app)
    configure_exception_handler(app)

    return app
