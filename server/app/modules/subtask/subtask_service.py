from quart import g
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.exceptions import APIException
from app.modules.task import task_service as TaskService
from app.modules.task import task_model as TaskModel
from . import subtask_model as SubtaskModel


class SubtaskNotFound(APIException):
    status_code = 404
    error_code = "subtask_not_found"

    def __init__(self):
        super().__init__("Subtask not found")


async def create_subtask(
    session: AsyncSession,
    id_task: int,
    data: SubtaskModel.SubtaskCreate,
) -> SubtaskModel.SubtaskEntity:
    task = await TaskService.get_task(session, id_task)

    # Retrive the next id due composite PK issue in session refresh
    result = await session.execute(
        select(
            func.coalesce(func.max(SubtaskModel.SubtaskEntity.id_subtask), 0)
        ).where(SubtaskModel.SubtaskEntity.id_task == id_task)
    )
    max_id = result.scalar_one()
    next_subtask_id = max_id + 1

    subtask = SubtaskModel.SubtaskEntity(
        id_task=task.id_task, title=data.title, id_subtask=next_subtask_id
    )

    session.add(subtask)
    await session.commit()
    await session.refresh(subtask)

    return subtask


async def list_task_subtasks(
    session: AsyncSession, id_task: int
) -> list[SubtaskModel.SubtaskRead]:
    current_id_user = g.current_user.id_user

    result = await session.execute(
        select(SubtaskModel.SubtaskEntity)
        .join(TaskModel.TaskEntity)
        .where(
            SubtaskModel.SubtaskEntity.id_task == id_task,
            TaskModel.TaskEntity.id_user == current_id_user,
        )
    )
    return result.scalars().all()


async def get_subtask(
    session: AsyncSession, id_task: int, id_subtask: int
) -> SubtaskModel.SubtaskEntity | None:
    current_id_user = g.current_user.id_user

    result = await session.execute(
        select(SubtaskModel.SubtaskEntity)
        .join(TaskModel.TaskEntity)
        .where(
            SubtaskModel.SubtaskEntity.id_task == id_task,
            SubtaskModel.SubtaskEntity.id_subtask == id_subtask,
            TaskModel.TaskEntity.id_user == current_id_user,
        )
    )
    subtask = result.scalar_one_or_none()

    if not subtask:
        raise SubtaskNotFound()

    return subtask


async def update_subtask(
    session: AsyncSession,
    id_subtask: int,
    id_task: int,
    data: SubtaskModel.SubtaskUpdate,
) -> SubtaskModel.SubtaskEntity:
    subtask = await get_subtask(session, id_task, id_subtask)

    if data.title is not None:
        subtask.title = data.title
    if data.done is not None:
        subtask.done = data.done

    await session.commit()
    await session.refresh(subtask)

    return subtask


async def delete_subtask(
    session: AsyncSession,
    id_subtask: int,
    id_task: int,
) -> None:
    subtask = await get_subtask(session, id_task, id_subtask)

    await session.delete(subtask)
    await session.commit()
