import uuid

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.category import Category
from app.models.review import Review
from app.models.user import User
from app.models.wishlist import WishlistItem
from app.models.order import Order, OrderItem

def _user_interacted_product_ids(user_id: str, db: Session) -> set:
    """Products the user has already engaged with (purchased / wishlisted / reviewed)."""
    ids = set()
    ids.update(pid for (pid,) in db.query(WishlistItem.product_id).filter(WishlistItem.user_id == user_id))
    ids.update(pid for (pid,) in db.query(Review.product_id).filter(Review.user_id == user_id))
    ids.update(
        pid for (pid,) in (
            db.query(OrderItem.product_id)
            .join(Order)
            .filter(Order.user_id == user_id, Order.status.in_(["paid", "shipped", "delivered"]))
        )
    )
    return ids

def cold_start_recommend(user_id: str, db: Session, n: int = 10) -> list[dict]:
    """
    Fallback recommendations for users with insufficient interactions.

    Strategy:
    1. Products in user's preferred categories, ordered by avg rating
    2. Globally popular products (highest avg rating with minimum reviews)

    Products the user has already purchased / wishlisted / reviewed are excluded.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return _popular_products(db, n)

    interacted = _user_interacted_product_ids(user_id, db)
    preferred_cat_ids = [c.id for c in user.preferred_categories]

    results = []

    if preferred_cat_ids:
        rating_subq = (
            db.query(
                Review.product_id,
                func.avg(Review.rating).label("avg_rating"),
                func.count(Review.id).label("review_count"),
            )
            .group_by(Review.product_id)
            .subquery()
        )

        category_query = (
            db.query(Product, rating_subq.c.avg_rating, rating_subq.c.review_count)
            .outerjoin(rating_subq, Product.id == rating_subq.c.product_id)
            .filter(Product.category_id.in_(preferred_cat_ids), Product.is_active == True)
        )
        if interacted:
            category_query = category_query.filter(Product.id.notin_(interacted))
        category_products = (
            category_query
            .order_by(rating_subq.c.avg_rating.desc().nullslast())
            .limit(n)
            .all()
        )

        for product, avg_rating, review_count in category_products:
            results.append({
                "product_id": str(product.id),
                "score": float(avg_rating) if avg_rating else 0.0,
                "source": "cold_start",
            })

    if len(results) < n:
        existing_ids = {uuid.UUID(r["product_id"]) for r in results} | interacted
        popular = _popular_products(db, n - len(results), exclude_ids=existing_ids)
        results.extend(popular)

    return results[:n]

def _popular_products(db: Session, n: int = 10, exclude_ids: set | None = None) -> list[dict]:
    """Get globally popular products by average rating."""
    rating_subq = (
        db.query(
            Review.product_id,
            func.avg(Review.rating).label("avg_rating"),
            func.count(Review.id).label("review_count"),
        )
        .group_by(Review.product_id)
        .having(func.count(Review.id) >= 1)
        .subquery()
    )

    query = (
        db.query(Product, rating_subq.c.avg_rating)
        .join(rating_subq, Product.id == rating_subq.c.product_id)
        .filter(Product.is_active == True)
        .order_by(rating_subq.c.avg_rating.desc())
    )

    if exclude_ids:
        query = query.filter(Product.id.notin_(exclude_ids))

    products = query.limit(n).all()

    return [
        {
            "product_id": str(p.id),
            "score": float(avg_rating) if avg_rating else 0.0,
            "source": "popular",
        }
        for p, avg_rating in products
    ]
