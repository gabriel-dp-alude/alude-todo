from datetime import datetime
from typing import List
from sqlalchemy import String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pydantic import BaseModel, Field

from app.utils.database import Base
from app.modules.user import user_model as UserModel


class TaskEntity(Base):
    __tablename__ = "tasks"

    id_task: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str] = mapped_column(String(100), nullable=False)

    id_user: Mapped[int] = mapped_column(
        ForeignKey("users.id_user", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user: Mapped["UserModel.UserEntity"] = relationship(backref="tasks")

    done: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    subtasks = relationship(
        "SubtaskEntity",
        back_populates="task",
        order_by="SubtaskEntity.created_at",
    )

    def __repr__(self) -> str:
        return f"Task(id_task={self.id_task!r}, title={self.title!r}, user={self.id_user!r}), subtasks=(${len(self.subtasks)})"


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)


class TaskUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=100)
    done: bool | None = None


# Duplicated due importing issue, it generates a circular dependency
class SubtaskRead(BaseModel):
    id_subtask: int
    id_task: int
    title: str
    done: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TaskRead(BaseModel):
    id_task: int
    title: str
    done: bool
    created_at: datetime
    subtasks: List["SubtaskRead"] = []

    model_config = {"from_attributes": True}
