from quart import g
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from . import task_model as TaskModel


class TaskNotFound(Exception):
    pass


async def create_task(
    session: AsyncSession, payload: TaskModel.TaskCreate
) -> TaskModel.TaskEntity:
    current_id_user = g.current_user.id_user

    task = TaskModel.TaskEntity(title=payload.title, id_user=current_id_user)

    session.add(task)
    await session.commit()
    await session.refresh(task)

    return task


async def list_user_tasks(session: AsyncSession) -> list[TaskModel.TaskEntity]:
    current_id_user = g.current_user.id_user

    result = await session.execute(
        select(TaskModel.TaskEntity).where(
            TaskModel.TaskEntity.id_user == current_id_user
        )
    )
    return result.scalars().all()


async def get_task(session: AsyncSession, task_id: int) -> TaskModel.TaskEntity:
    current_id_user = g.current_user.id_user

    result = await session.execute(
        select(TaskModel.TaskEntity).where(
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
    payload: TaskModel.TaskUpdate,
) -> TaskModel.TaskEntity:
    task = await get_task(session, task_id)

    if payload.title is not None:
        task.title = payload.title

    if payload.done is not None:
        task.done = payload.done

    await session.commit()
    await session.refresh(task)

    return task


async def delete_task(session: AsyncSession, task_id: int) -> None:
    task = await get_task(session, task_id)

    await session.delete(task)
    await session.commit()
