from os import getenv
from quart import Quart
from quart_cors import cors


def configure_cors(app: Quart):
    cors(
        app,
        allow_origin=getenv("CORS_ORIGIN", "").split(","),
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        allow_credentials=True,
    )
