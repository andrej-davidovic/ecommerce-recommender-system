import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_admin
from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from app.schemas.user import UserResponse
from app.schemas.recommendation import RetrainResponse, AlgorithmStatusResponse
from app.services.recommendation_service import retrain_model, get_algorithm_status

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/users", response_model=list[UserResponse])
def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return (
        db.query(User)
        .order_by(User.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

@router.patch("/users/{user_id}/approve", response_model=UserResponse)
def approve_user(
    user_id: uuid.UUID,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_approved = True
    db.commit()
    db.refresh(user)
    return user

@router.patch("/users/{user_id}/deactivate", response_model=UserResponse)
def deactivate_user(
    user_id: uuid.UUID,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user

@router.patch("/users/{user_id}/activate", response_model=UserResponse)
def activate_user(
    user_id: uuid.UUID,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user

@router.post("/recommendations/retrain", response_model=RetrainResponse)
def retrain(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    return retrain_model(db)

@router.get("/recommendations/status", response_model=AlgorithmStatusResponse)
def algorithm_status(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    return get_algorithm_status(db)

@router.get("/analytics/overview")
def analytics_overview(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).scalar()
    total_products = db.query(func.count(Product.id)).filter(Product.is_active == True).scalar()
    total_orders = db.query(func.count(Order.id)).scalar()
    pending_approvals = db.query(func.count(User.id)).filter(User.is_approved == False).scalar()
    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "pending_approvals": pending_approvals,
    }
