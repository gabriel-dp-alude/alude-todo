from .user.user_route import bp as user_bp
from .auth.auth_route import bp as auth_bp
from .task.task_route import bp as task_bp

ROUTE_BLUEPRINTS = [
    user_bp,
    auth_bp,
    task_bp,
]
