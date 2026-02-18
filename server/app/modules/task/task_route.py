from quart import Blueprint, request, jsonify
from quart_schema import tag, validate_request, validate_response

from ...config.database import AsyncSessionLocal
from ...utils.auth import require_auth
from . import task_model as TaskModel
from . import task_service as TaskService


bp = Blueprint("tasks", __name__, url_prefix="/tasks")
bp.before_request(require_auth)
TASKS_TAG = ["Tasks"]


@bp.post("/")
@validate_request(TaskModel.TaskCreate)
@validate_response(TaskModel.TaskRead, 201)
@tag(TASKS_TAG)
async def create_task():
    data = await request.get_json()
    payload = TaskModel.TaskCreate(**data)

    async with AsyncSessionLocal() as session:
        task = await TaskService.create_task(session, payload)

        return (
            jsonify(TaskModel.TaskRead.model_validate(task).model_dump()),
            201,
        )


@bp.get("/")
@validate_response(list[TaskModel.TaskRead], 200)
@tag(TASKS_TAG)
async def list_user_tasks():
    async with AsyncSessionLocal() as session:
        tasks = await TaskService.list_user_tasks(session)

        return jsonify(
            [TaskModel.TaskRead.model_validate(t).model_dump() for t in tasks]
        )


@bp.get("/<int:task_id>")
@validate_response(TaskModel.TaskRead, 200)
@tag(TASKS_TAG)
async def get_task(task_id: int):
    async with AsyncSessionLocal() as session:
        try:
            task = await TaskService.get_task(session, task_id)
        except TaskService.TaskNotFound:
            return jsonify({"error": "Task not found"}), 404

        return jsonify(TaskModel.TaskRead.model_validate(task).model_dump())


@bp.patch("/<int:task_id>")
@validate_request(TaskModel.TaskUpdate)
@validate_response(TaskModel.TaskRead, 200)
@tag(TASKS_TAG)
async def update_task(task_id: int):
    data = await request.get_json()
    payload = TaskModel.TaskUpdate(**data)

    async with AsyncSessionLocal() as session:
        try:
            task = await TaskService.update_task(session, task_id, payload)
        except TaskService.TaskNotFound:
            return jsonify({"error": "Task not found"}), 404

        return jsonify(TaskModel.TaskRead.model_validate(task).model_dump())


@bp.delete("/<int:task_id>")
@validate_response(TaskModel.TaskDelete, 204)
@tag(TASKS_TAG)
async def delete_task(task_id: int):
    async with AsyncSessionLocal() as session:
        try:
            await TaskService.delete_task(session, task_id)
        except TaskService.TaskNotFound:
            return jsonify({"error": "Task not found"}), 404

        return "", 204
