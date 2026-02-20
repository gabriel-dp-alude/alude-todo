from datetime import datetime
from sqlalchemy import (
    String,
    Boolean,
    DateTime,
    ForeignKey,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pydantic import BaseModel, Field

from app.utils.database import Base
from app.modules.task import task_model as TaskModel


class SubtaskEntity(Base):
    __tablename__ = "subtasks"

    id_subtask: Mapped[int] = mapped_column(primary_key=True)

    id_task: Mapped[int] = mapped_column(
        ForeignKey("tasks.id_task"),
        nullable=False,
        primary_key=True,
    )
    task: Mapped["TaskModel.TaskEntity"] = relationship(
        back_populates="subtasks"
    )

    title: Mapped[str] = mapped_column(String(100), nullable=False)

    done: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"Subtask(id_subtask={self.id_subtask!r}, id_task={self.id_task!r}, title={self.title!r})"


class SubtaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)


class SubtaskUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=100)
    done: bool | None = None


class SubtaskRead(BaseModel):
    id_subtask: int
    id_task: int
    title: str
    done: bool
    created_at: datetime

    model_config = {"from_attributes": True}
