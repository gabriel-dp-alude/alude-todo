from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from pydantic import BaseModel, EmailStr

from ...config.database import Base


class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(150), nullable=False, unique=True)

    def __repr__(self) -> str:
        return f"User(id={self.id!r}, email={self.email!r})"
    


class UserCreate(BaseModel):
    name: str
    email: EmailStr


class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None

class UserRead(BaseModel):
    id: int
    name: str
    email: EmailStr

    model_config = {"from_attributes": True}
