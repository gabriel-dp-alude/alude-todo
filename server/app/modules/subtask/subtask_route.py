from quart import Blueprint
from quart_schema import validate_request, validate_response, tag_blueprint


from app.utils.database import AsyncSessionLocal
from app.utils.middlewares import require_auth
from . import subtask_model as SubtaskModel
from . import subtask_service as SubtaskService


bp = Blueprint("subtasks", __name__, url_prefix="/tasks/<int:id_task>/subtasks")
bp.before_request(require_auth)
tag_blueprint(bp, ["Subtasks"])


@bp.post("/")
@validate_request(SubtaskModel.SubtaskCreate)
@validate_response(SubtaskModel.SubtaskRead, 201)
async def create_subtask(id_task: int, data: SubtaskModel.SubtaskCreate):
    async with AsyncSessionLocal() as session:
        subtask = await SubtaskService.create_subtask(session, id_task, data)
        return subtask, 201


@bp.get("/")
@validate_response(list[SubtaskModel.SubtaskRead], 200)
async def list_task_subtasks(id_task: int):
    async with AsyncSessionLocal() as session:
        subtasks = await SubtaskService.list_task_subtasks(session, id_task)
        return [
            SubtaskModel.SubtaskRead.model_validate(t).model_dump()
            for t in subtasks
        ]


@bp.get("/<int:id_subtask>")
@validate_response(SubtaskModel.SubtaskRead, 200)
async def get_subtask(id_task: int, id_subtask: int):
    async with AsyncSessionLocal() as session:
        subtask = await SubtaskService.get_subtask(session, id_task, id_subtask)
        return SubtaskModel.SubtaskRead.model_validate(subtask).model_dump()


@bp.patch("/<int:id_subtask>")
@validate_request(SubtaskModel.SubtaskUpdate)
@validate_response(SubtaskModel.SubtaskRead, 200)
async def update_subtask(
    id_task: int, id_subtask: int, data: SubtaskModel.SubtaskUpdate
):
    async with AsyncSessionLocal() as session:
        subtask = await SubtaskService.update_subtask(
            session, id_subtask, id_task, data
        )
        return SubtaskModel.SubtaskRead.model_validate(subtask).model_dump()


@bp.delete("/<int:id_subtask>")
async def delete_subtask(id_task: int, id_subtask: int):
    async with AsyncSessionLocal() as session:
        await SubtaskService.delete_subtask(session, id_subtask, id_task)
        return "", 204
