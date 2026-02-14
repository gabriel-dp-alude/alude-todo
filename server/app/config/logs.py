import logging
import time
from quart import request


def configure_logs(app):
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s.%(msecs)03d | %(levelname)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    logger = logging.getLogger("app")

    @app.before_request
    async def log_request():
        request.start_time = time.time()

    @app.after_request
    async def log_response(response):
        duration = (time.time() - request.start_time) * 1000

        logger.info(
            "%s %s | %s | %.2fms",
            request.method,
            request.path,
            response.status_code,
            duration,
        )

        return response
