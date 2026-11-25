import uuid
from datetime import datetime

from pydantic import BaseModel, Field

class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = None

class ReviewUpdate(BaseModel):
    rating: int | None = Field(None, ge=1, le=5)
    comment: str | None = None

class ReviewResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    product_id: uuid.UUID
    rating: int
    comment: str | None = None
    created_at: datetime
    user_name: str | None = None

    model_config = {"from_attributes": True}
