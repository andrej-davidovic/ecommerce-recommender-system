import numpy as np
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.product import Product
from app.models.review import Review
from app.models.wishlist import WishlistItem
from app.models.order import Order, OrderItem
from app.core.constants import (
    SIGNAL_WEIGHT_WISHLIST,
    SIGNAL_WEIGHT_REVIEW_MULTIPLIER,
    SIGNAL_WEIGHT_PURCHASE,
)

def build_interaction_matrix(db: Session) -> tuple[np.ndarray, dict, dict]:
    users = db.query(User).filter(User.is_active == True, User.is_approved == True).all()
    products = db.query(Product).filter(Product.is_active == True).all()

    if not users or not products:
        return np.zeros((0, 0)), {}, {}

    user_index = {str(u.id): i for i, u in enumerate(users)}
    product_index = {str(p.id): i for i, p in enumerate(products)}

    n_users = len(users)
    n_products = len(products)
    matrix = np.zeros((n_users, n_products), dtype=np.float64)

    wishlist_items = db.query(WishlistItem).all()
    for item in wishlist_items:
        uid = str(item.user_id)
        pid = str(item.product_id)
        if uid in user_index and pid in product_index:
            matrix[user_index[uid], product_index[pid]] += SIGNAL_WEIGHT_WISHLIST

    reviews = db.query(Review).all()
    for review in reviews:
        uid = str(review.user_id)
        pid = str(review.product_id)
        if uid in user_index and pid in product_index:
            centered_rating = (review.rating - 3) / 2.0
            matrix[user_index[uid], product_index[pid]] += centered_rating * SIGNAL_WEIGHT_REVIEW_MULTIPLIER

    order_items = (
        db.query(OrderItem)
        .join(Order)
        .filter(Order.status.in_(["paid", "shipped", "delivered"]))
        .all()
    )
    order_user_map = {}
    orders = db.query(Order).filter(Order.status.in_(["paid", "shipped", "delivered"])).all()
    for order in orders:
        order_user_map[str(order.id)] = str(order.user_id)

    for oi in order_items:
        uid = order_user_map.get(str(oi.order_id))
        pid = str(oi.product_id)
        if uid and uid in user_index and pid in product_index:
            matrix[user_index[uid], product_index[pid]] += SIGNAL_WEIGHT_PURCHASE

    return matrix, user_index, product_index
