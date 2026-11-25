import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.product import ProductResponse

class WishlistItemResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    added_at: datetime

    model_config = {"from_attributes": True}
