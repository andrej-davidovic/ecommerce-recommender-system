import uuid

from sqlalchemy.orm import Session, joinedload

from app.models.cart import CartItem
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.core.constants import OrderStatus

def create_order_from_cart(user_id: uuid.UUID, db: Session) -> Order | None:
    _cancel_pending_orders(user_id, db)

    cart_items = (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.user_id == user_id)
        .all()
    )

    if not cart_items:
        return None

    for cart_item in cart_items:
        if cart_item.quantity > cart_item.product.stock_quantity:
            raise ValueError(
                f"Nedovoljno na stanju: {cart_item.product.name} "
                f"(dostupno: {cart_item.product.stock_quantity}, traženo: {cart_item.quantity})"
            )

    total = 0.0
    order_items = []
    for cart_item in cart_items:
        price = float(cart_item.product.price)
        order_items.append(OrderItem(
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            unit_price=price,
        ))
        total += price * cart_item.quantity

    order = Order(
        user_id=user_id,
        total_amount=round(total, 2),
        status=OrderStatus.PENDING,
    )
    order.items = order_items
    db.add(order)

    db.commit()
    db.refresh(order)
    return order

def _cancel_pending_orders(user_id: uuid.UUID, db: Session) -> None:
    """Cancel all pending (unpaid) orders for this user before creating a new one."""
    pending = (
        db.query(Order)
        .filter(
            Order.user_id == user_id,
            Order.status == OrderStatus.PENDING,
        )
        .all()
    )
    for order in pending:
        order.status = OrderStatus.CANCELLED
    if pending:
        db.commit()

def get_user_orders(user_id: uuid.UUID, db: Session, page: int = 1, page_size: int = 20) -> tuple[list[Order], int]:
    query = db.query(Order).filter(Order.user_id == user_id)
    total = query.count()
    orders = (
        query
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .order_by(Order.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return orders, total

def get_order_detail(order_id: uuid.UUID, user_id: uuid.UUID, db: Session) -> Order | None:
    return (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order_id, Order.user_id == user_id)
        .first()
    )
