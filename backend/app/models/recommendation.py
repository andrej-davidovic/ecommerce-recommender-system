import uuid
from datetime import datetime

from sqlalchemy import Integer, Float, String, Boolean, DateTime, Enum, ForeignKey, LargeBinary, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base
from app.core.constants import RecommendationSource

class SimilarityMatrix(Base):
    __tablename__ = "similarity_matrices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    matrix_data: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    user_index_map: Mapped[dict] = mapped_column(JSONB, nullable=False)
    product_index_map: Mapped[dict] = mapped_column(JSONB, nullable=False)
    algorithm: Mapped[str] = mapped_column(String(50), nullable=False, default="cosine_similarity")
    trained_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    num_users: Mapped[int] = mapped_column(Integer, nullable=False)
    num_products: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

class RecommendationLog(Base):
    __tablename__ = "recommendation_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    source: Mapped[RecommendationSource] = mapped_column(Enum(RecommendationSource), nullable=False)
    was_clicked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
