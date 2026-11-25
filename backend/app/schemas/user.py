import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.core.constants import UserRole

class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    role: UserRole
    is_approved: bool
    is_active: bool
    created_at: datetime
    category_ids: list[int] = []

    model_config = {"from_attributes": True}

class UserUpdateRequest(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None

class UserPreferencesRequest(BaseModel):
    category_ids: list[int]
