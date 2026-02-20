from http.client import HTTPException
from quart import Quart, jsonify
from quart_schema.validation import RequestSchemaValidationError

from app.utils.exceptions import APIException


def configure_exception_handler(app: Quart):
    @app.errorhandler(APIException)
    async def handle_api_exception(error: APIException):
        response = {
            "error": error.error_code,
            "message": error.message,
        }
        return jsonify(response), error.status_code

    @app.errorhandler(RequestSchemaValidationError)
    async def handle_validation_error(error: RequestSchemaValidationError):
        response = {
            "error": "validation_error",
            "message": "Invalid request body",
            "details": error.validation_error.errors(),
        }
        return jsonify(response), 400

    @app.errorhandler(HTTPException)
    async def handle_http_error(error):
        response = {
            "error": error.name,
            "message": error.description,
        }
        return jsonify(response), error.code

    @app.errorhandler(Exception)
    async def handle_unexpected_error(error: Exception):
        response = {
            "error": "internal_server_error",
            "message": "Something went wrong",
            "details": str(error),
        }
        return jsonify(response), 500
