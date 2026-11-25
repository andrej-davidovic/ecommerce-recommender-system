import stripe
from sqlalchemy.orm import Session, joinedload

from app.config import settings
from app.models.cart import CartItem
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.core.constants import OrderStatus

stripe.api_key = settings.STRIPE_SECRET_KEY

def create_payment_intent(order: Order) -> dict:
    intent = stripe.PaymentIntent.create(
        amount=int(float(order.total_amount) * 100),
        currency="usd",
        metadata={"order_id": str(order.id)},
    )
    return {
        "client_secret": intent.client_secret,
        "payment_intent_id": intent.id,
    }

def confirm_payment(order: Order, db: Session) -> Order:
    if not order.stripe_payment_intent_id:
        raise ValueError("No payment intent associated with this order")

    intent = stripe.PaymentIntent.retrieve(order.stripe_payment_intent_id)

    if intent.status == "succeeded":
        order.status = OrderStatus.PAID

        items = (
            db.query(OrderItem)
            .options(joinedload(OrderItem.product))
            .filter(OrderItem.order_id == order.id)
            .all()
        )
        for item in items:
            item.product.stock_quantity -= item.quantity

        db.query(CartItem).filter(CartItem.user_id == order.user_id).delete()

        db.commit()
        db.refresh(order)
        return order

    raise ValueError(f"Payment not completed. Stripe status: {intent.status}")
