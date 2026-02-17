from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, func, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pydantic import BaseModel

from ...config.database import Base
from ..user.user_model import UserEntity


class Session(Base):
    __tablename__ = "sessions"

    id_session: Mapped[int] = mapped_column(primary_key=True)

    id_user: Mapped[int] = mapped_column(
        ForeignKey("users.id_user", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user: Mapped["UserEntity"] = relationship(backref="sessions")

    session_token_hash: Mapped[str] = mapped_column(
        String(64),  # SHA-256 hex length
        nullable=False,
        unique=True,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        index=True,
    )

    __table_args__ = (
        Index("idx_sessions_user_expires", "id_user", "expires_at"),
    )

    def __repr__(self) -> str:
        return (
            f"Session(id_session={self.id_session!r}, "
            f"id_user={self.id_user!r}, "
            f"expires_at={self.expires_at!r})"
        )


class SessionRead(BaseModel):
    id_session: int
    id_user: int
    created_at: datetime
    expires_at: datetime

    model_config = {"from_attributes": True}
