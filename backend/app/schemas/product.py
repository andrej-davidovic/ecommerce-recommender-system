import uuid
from datetime import datetime

from pydantic import BaseModel

class CategoryResponse(BaseModel):
    id: int
    name: str
    name_sr: str | None = None
    description: str | None = None
    description_sr: str | None = None
    parent_id: int | None = None

    model_config = {"from_attributes": True}

class CategoryCreate(BaseModel):
    name: str
    name_sr: str | None = None
    description: str | None = None
    description_sr: str | None = None
    parent_id: int | None = None

class TagResponse(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}

class ProductCreate(BaseModel):
    name: str
    name_sr: str | None = None
    description: str
    description_sr: str | None = None
    price: float
    image_url: str | None = None
    category_id: int
    stock_quantity: int = 0
    tag_names: list[str] = []

class ProductUpdate(BaseModel):
    name: str | None = None
    name_sr: str | None = None
    description: str | None = None
    description_sr: str | None = None
    price: float | None = None
    image_url: str | None = None
    category_id: int | None = None
    stock_quantity: int | None = None
    tag_names: list[str] | None = None

class ProductResponse(BaseModel):
    id: uuid.UUID
    name: str
    name_sr: str | None = None
    description: str
    description_sr: str | None = None
    price: float
    image_url: str | None = None
    category: CategoryResponse
    tags: list[TagResponse] = []
    stock_quantity: int
    is_active: bool
    average_rating: float | None = None
    review_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}

class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int
