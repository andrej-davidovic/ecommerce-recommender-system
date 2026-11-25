import uuid
from datetime import datetime

from pydantic import BaseModel, Field

class CartItemAdd(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(1, ge=1)

class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)

class CartItemResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    product_name: str | None = None
    product_name_sr: str | None = None
    product_price: float | None = None
    product_image_url: str | None = None
    quantity: int
    added_at: datetime

    model_config = {"from_attributes": True}

class CartResponse(BaseModel):
    items: list[CartItemResponse]
    total: float
