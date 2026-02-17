from datetime import datetime
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from pydantic import BaseModel, Field

from ...config.database import Base


class UserEntity(Base):
    __tablename__ = "users"

    id_user: Mapped[int] = mapped_column(primary_key=True)

    username: Mapped[str] = mapped_column(
        String(100), nullable=False, unique=True, index=True
    )

    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"User(id_user={self.id_user!r}, username={self.username!r})"


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    username: str | None = Field(None, min_length=3, max_length=100)
    password: str | None = Field(None, min_length=8)


class UserRead(BaseModel):
    id_user: int
    username: str
    password_hash: str

    model_config = {"from_attributes": True}
