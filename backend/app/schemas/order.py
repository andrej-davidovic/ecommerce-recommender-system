import uuid
from datetime import datetime

from pydantic import BaseModel

from app.core.constants import OrderStatus

class OrderItemResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    product_name: str | None = None
    product_name_sr: str | None = None
    quantity: int
    unit_price: float

    model_config = {"from_attributes": True}

class OrderResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    total_amount: float
    status: OrderStatus
    stripe_payment_intent_id: str | None = None
    items: list[OrderItemResponse] = []
    created_at: datetime

    model_config = {"from_attributes": True}

class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    total: int

class PaymentIntentResponse(BaseModel):
    client_secret: str
    order_id: uuid.UUID
