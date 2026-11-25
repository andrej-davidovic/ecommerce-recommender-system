import uuid

from pydantic import BaseModel

class RecommendationItem(BaseModel):
    product_id: uuid.UUID
    score: float
    source: str

class RecommendationResponse(BaseModel):
    recommendations: list[RecommendationItem]

class RetrainResponse(BaseModel):
    status: str
    num_users: int | None = None
    num_products: int | None = None
    trained_at: str | None = None
    message: str | None = None

class AlgorithmStatusResponse(BaseModel):
    status: str
    algorithm: str | None = None
    num_users: int | None = None
    num_products: int | None = None
    trained_at: str | None = None
    total_recommendations: int | None = None
    click_through_rate: float | None = None
    message: str | None = None
