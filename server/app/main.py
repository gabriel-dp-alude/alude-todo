import os
from quart import Quart, jsonify
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Quart(__name__)

    app.config["ENV"] = os.getenv("ENV", "development")
    app.config["DEBUG"] = os.getenv("DEBUG", "false").lower() == "true"

    @app.route("/")
    async def health():
        return jsonify({"status": "ok"})

    return app