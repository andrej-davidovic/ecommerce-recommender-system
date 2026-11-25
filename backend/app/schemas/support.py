import uuid

from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    product_id: uuid.UUID | None = None

class ChatResponse(BaseModel):
    reply: str
    referenced_products: list[dict] = []
