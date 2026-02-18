from quart import Blueprint
from quart_schema import tag, validate_request, validate_response, tag_blueprint

from app.utils.database import AsyncSessionLocal
from app.utils.auth import require_auth
from . import task_model as TaskModel
from . import task_service as TaskService


bp = Blueprint("tasks", __name__, url_prefix="/tasks")
bp.before_request(require_auth)
tag_blueprint(bp, ["Tasks"])


@bp.post("/")
@validate_request(TaskModel.TaskCreate)
@validate_response(TaskModel.TaskRead, 201)
async def create_task(data: TaskModel.TaskCreate):
    async with AsyncSessionLocal() as session:
        task = await TaskService.create_task(session, data)
        return task, 201


@bp.get("/")
@validate_response(list[TaskModel.TaskRead], 200)
async def list_user_tasks():
    async with AsyncSessionLocal() as session:
        tasks = await TaskService.list_user_tasks(session)
        return [
            TaskModel.TaskRead.model_validate(t).model_dump() for t in tasks
        ]


@bp.get("/<int:task_id>")
@validate_response(TaskModel.TaskRead, 200)
async def get_task(task_id: int):
    async with AsyncSessionLocal() as session:
        task = await TaskService.get_task(session, task_id)
        return TaskModel.TaskRead.model_validate(task).model_dump()


@bp.patch("/<int:task_id>")
@validate_request(TaskModel.TaskUpdate)
@validate_response(TaskModel.TaskRead, 200)
async def update_task(task_id: int, data: TaskModel.TaskUpdate):
    async with AsyncSessionLocal() as session:
        task = await TaskService.update_task(session, task_id, data)
        return TaskModel.TaskRead.model_validate(task).model_dump()


@bp.delete("/<int:task_id>")
async def delete_task(task_id: int):
    async with AsyncSessionLocal() as session:
        await TaskService.delete_task(session, task_id)
        return "", 204
