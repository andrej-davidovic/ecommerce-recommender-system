import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.order import Order
from app.schemas.order import PaymentIntentResponse, OrderResponse
from app.services.payment_service import create_payment_intent, confirm_payment

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/create-intent", response_model=PaymentIntentResponse)
def create_intent(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    result = create_payment_intent(order)
    order.stripe_payment_intent_id = result["payment_intent_id"]
    db.commit()

    return {"client_secret": result["client_secret"], "order_id": order.id}

@router.post("/confirm", response_model=OrderResponse)
def confirm_order_payment(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    try:
        order = confirm_payment(order, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return order
