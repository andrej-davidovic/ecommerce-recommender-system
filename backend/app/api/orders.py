import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.order import OrderResponse, OrderListResponse
from app.services.order_service import create_order_from_cart, get_user_orders, get_order_detail

router = APIRouter(prefix="/orders", tags=["Orders"])

def _enrich_order(order) -> dict:
    data = OrderResponse.model_validate(order).model_dump()
    for i, item in enumerate(order.items):
        if item.product:
            data["items"][i]["product_name"] = item.product.name
            data["items"][i]["product_name_sr"] = item.product.name_sr
    return data

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        order = create_order_from_cart(current_user.id, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    if not order:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")
    return _enrich_order(order)

@router.get("/", response_model=OrderListResponse)
def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    orders, total = get_user_orders(current_user.id, db, page, page_size)
    return {"items": [_enrich_order(o) for o in orders], "total": total}

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = get_order_detail(order_id, current_user.id, db)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return _enrich_order(order)
