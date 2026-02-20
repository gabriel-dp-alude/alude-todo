from quart import g
from sqlalchemy import desc, select, delete
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.exceptions import APIException
from app.modules.subtask import subtask_model as SubtaskModel
from . import task_model as TaskModel


class TaskNotFound(APIException):
    status_code = 404
    error_code = "subtask_not_found"

    def __init__(self):
        super().__init__("Subtask not found")


async def create_task(
    session: AsyncSession, data: TaskModel.TaskCreate
) -> TaskModel.TaskEntity:
    current_id_user = g.current_user.id_user

    task = TaskModel.TaskEntity(title=data.title, id_user=current_id_user)

    session.add(task)
    await session.commit()

    new_task = await get_task(session, task.id_task)
    return new_task


async def list_user_tasks(session: AsyncSession) -> list[TaskModel.TaskEntity]:
    current_id_user = g.current_user.id_user

    result = await session.execute(
        select(TaskModel.TaskEntity)
        .options(selectinload(TaskModel.TaskEntity.subtasks))
        .where(TaskModel.TaskEntity.id_user == current_id_user)
        .order_by(desc(TaskModel.TaskEntity.created_at))
    )
    return result.scalars().all()


async def get_task(session: AsyncSession, task_id: int) -> TaskModel.TaskEntity:
    current_id_user = g.current_user.id_user

    result = await session.execute(
        select(TaskModel.TaskEntity)
        .options(selectinload(TaskModel.TaskEntity.subtasks))
        .where(
            TaskModel.TaskEntity.id_task == task_id,
            TaskModel.TaskEntity.id_user == current_id_user,
        )
    )
    task = result.scalar_one_or_none()

    if not task:
        raise TaskNotFound()

    return task


async def update_task(
    session: AsyncSession,
    task_id: int,
    data: TaskModel.TaskUpdate,
) -> TaskModel.TaskEntity:
    task = await get_task(session, task_id)

    if data.title is not None:
        task.title = data.title
    if data.done is not None:
        task.done = data.done

    await session.commit()
    await session.refresh(task)

    return task


async def delete_task(session: AsyncSession, task_id: int) -> None:
    await session.execute(
        delete(SubtaskModel.SubtaskEntity).where(
            SubtaskModel.SubtaskEntity.id_task == task_id
        )
    )
    await session.execute(
        delete(TaskModel.TaskEntity).where(
            TaskModel.TaskEntity.id_task == task_id
        )
    )
    await session.commit()
