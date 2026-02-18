class APIException(Exception):
    status_code = 400
    error_code = "api_error"

    def __init__(self, message: str | None = None):
        self.message = message or "An error occurred"
        super().__init__(self.message)
