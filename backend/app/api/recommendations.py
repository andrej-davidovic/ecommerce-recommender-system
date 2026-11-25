import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user, get_current_admin
from app.models.user import User
from app.models.recommendation import RecommendationLog
from app.schemas.recommendation import RecommendationResponse, RetrainResponse, AlgorithmStatusResponse
from app.services.recommendation_service import (
    get_recommendations, get_similar_products, retrain_model, get_algorithm_status,
)
from app.ml.cold_start import _popular_products

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("/", response_model=RecommendationResponse)
def get_personalized(
    n: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    results = get_recommendations(str(current_user.id), db, n)
    return {"recommendations": results}

@router.get("/similar/{product_id}", response_model=RecommendationResponse)
def get_similar(
    product_id: uuid.UUID,
    n: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    results = get_similar_products(str(product_id), db, n)
    return {"recommendations": results}

@router.get("/popular", response_model=RecommendationResponse)
def get_popular(
    n: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    results = _popular_products(db, n)
    return {"recommendations": results}

@router.post("/track-click")
def track_click(
    product_id: uuid.UUID = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark the most recent recommendation log for this user+product as clicked."""
    log = (
        db.query(RecommendationLog)
        .filter(
            RecommendationLog.user_id == current_user.id,
            RecommendationLog.product_id == product_id,
        )
        .order_by(RecommendationLog.created_at.desc())
        .first()
    )
    if log:
        log.was_clicked = True
        db.commit()
    return {"status": "ok"}
