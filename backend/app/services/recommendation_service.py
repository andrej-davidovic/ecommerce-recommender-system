import logging
import threading
import uuid

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import settings
from app.models.review import Review
from app.models.wishlist import WishlistItem
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.recommendation import RecommendationLog, SimilarityMatrix
from app.core.constants import RecommendationSource
from app.ml.engine import CollaborativeFilteringEngine
from app.ml.signals import build_interaction_matrix
from app.ml.cold_start import cold_start_recommend, _popular_products
from app.ml.storage import save_trained_model, load_active_model

logger = logging.getLogger(__name__)

_retrain_lock = threading.Lock()

def _count_user_interactions(user_id: str, db: Session) -> int:
    reviews = db.query(func.count(Review.id)).filter(Review.user_id == user_id).scalar()
    wishlists = db.query(func.count(WishlistItem.id)).filter(WishlistItem.user_id == user_id).scalar()
    purchases = (
        db.query(func.count(OrderItem.id))
        .join(Order)
        .filter(Order.user_id == user_id, Order.status.in_(["paid", "shipped", "delivered"]))
        .scalar()
    )
    return (reviews or 0) + (wishlists or 0) + (purchases or 0)

def _count_new_interactions_since_last_train(db: Session) -> int:
    """Count interactions created after the last model training."""
    record = db.query(SimilarityMatrix).filter(SimilarityMatrix.is_active == True).first()
    trained_at = record.trained_at if record else None

    filters_review = [Review.created_at > trained_at] if trained_at else []
    filters_wishlist = [WishlistItem.added_at > trained_at] if trained_at else []
    filters_order = [Order.created_at > trained_at] if trained_at else []

    new_reviews = db.query(func.count(Review.id)).filter(*filters_review).scalar() or 0
    new_wishlists = db.query(func.count(WishlistItem.id)).filter(*filters_wishlist).scalar() or 0
    new_orders = (
        db.query(func.count(OrderItem.id))
        .join(Order)
        .filter(Order.status.in_(["paid", "shipped", "delivered"]), *filters_order)
        .scalar() or 0
    )
    return new_reviews + new_wishlists + new_orders

def _background_retrain():
    """Run model retraining in a background thread."""
    from app.db.session import SessionLocal
    db = SessionLocal()
    try:
        result = retrain_model(db)
        logger.info("Auto-retrain completed: %s", result)
    except Exception:
        logger.exception("Auto-retrain failed")
    finally:
        db.close()
        _retrain_lock.release()

def maybe_auto_retrain(db: Session):
    """Trigger background retrain if enough new interactions have accumulated."""
    if settings.AUTO_RETRAIN_THRESHOLD <= 0:
        return
    new_count = _count_new_interactions_since_last_train(db)
    if new_count >= settings.AUTO_RETRAIN_THRESHOLD:
        if _retrain_lock.acquire(blocking=False):
            try:
                thread = threading.Thread(target=_background_retrain, daemon=True)
                thread.start()
                logger.info("Auto-retrain triggered (%d new interactions)", new_count)
            except Exception:
                _retrain_lock.release()
                raise
        else:
            logger.debug("Auto-retrain already in progress, skipping")

def get_recommendations(user_id: str, db: Session, n: int | None = None) -> list[dict]:
    if n is None:
        n = settings.RECOMMENDATION_COUNT

    maybe_auto_retrain(db)

    interaction_count = _count_user_interactions(user_id, db)

    if interaction_count < settings.COLD_START_THRESHOLD:
        recommendations = cold_start_recommend(user_id, db, n)
        _log_recommendations(user_id, recommendations, db)
        return recommendations

    model_data = load_active_model(db)
    if not model_data:
        recommendations = cold_start_recommend(user_id, db, n)
        _log_recommendations(user_id, recommendations, db)
        return recommendations

    engine, user_index, product_index = model_data

    if user_id not in user_index:
        recommendations = cold_start_recommend(user_id, db, n)
        _log_recommendations(user_id, recommendations, db)
        return recommendations

    user_idx = user_index[user_id]
    results = engine.recommend_for_user(user_idx, n)

    idx_to_product = {v: k for k, v in product_index.items()}

    recommendations = []
    for prod_idx, score in results:
        product_id = idx_to_product.get(prod_idx)
        if product_id:
            recommendations.append({
                "product_id": product_id,
                "score": score,
                "source": "collaborative",
            })

    if len(recommendations) < n:
        existing_ids = {r["product_id"] for r in recommendations}
        cold = cold_start_recommend(user_id, db, n - len(recommendations))
        for item in cold:
            if item["product_id"] not in existing_ids:
                recommendations.append(item)

    recommendations = recommendations[:n]
    _log_recommendations(user_id, recommendations, db)
    return recommendations

def get_similar_products(product_id: str, db: Session, n: int = 10) -> list[dict]:
    """Get similar products using item-item similarity."""
    model_data = load_active_model(db)
    if not model_data:
        return _popular_products(db, n)

    engine, user_index, product_index = model_data

    if product_id not in product_index:
        return _popular_products(db, n)

    item_idx = product_index[product_id]
    results = engine.get_similar_items(item_idx, n)

    idx_to_product = {v: k for k, v in product_index.items()}

    return [
        {"product_id": idx_to_product[idx], "score": score, "source": "collaborative"}
        for idx, score in results
        if idx in idx_to_product
    ]

def retrain_model(db: Session) -> dict:
    """Rebuild interaction matrix and retrain the model."""
    matrix, user_index, product_index = build_interaction_matrix(db)

    if matrix.size == 0:
        return {"status": "error", "message": "Not enough data to train"}

    engine = CollaborativeFilteringEngine()
    engine.train(matrix)

    record = save_trained_model(engine, matrix, user_index, product_index, db)

    return {
        "status": "success",
        "num_users": record.num_users,
        "num_products": record.num_products,
        "trained_at": str(record.trained_at),
    }

def get_algorithm_status(db: Session) -> dict:
    """Get current model status and metrics."""
    record = db.query(SimilarityMatrix).filter(SimilarityMatrix.is_active == True).first()
    if not record:
        return {"status": "no_model", "message": "No trained model found"}

    total_logs = db.query(func.count(RecommendationLog.id)).scalar()
    clicked_logs = db.query(func.count(RecommendationLog.id)).filter(RecommendationLog.was_clicked == True).scalar()
    ctr = round(clicked_logs / total_logs * 100, 2) if total_logs > 0 else 0.0

    return {
        "status": "active",
        "algorithm": record.algorithm,
        "num_users": record.num_users,
        "num_products": record.num_products,
        "trained_at": str(record.trained_at),
        "total_recommendations": total_logs,
        "click_through_rate": ctr,
    }

def _log_recommendations(user_id: str, recommendations: list[dict], db: Session):
    """Log recommendations for evaluation."""
    for rec in recommendations:
        source_map = {
            "collaborative": RecommendationSource.COLLABORATIVE,
            "cold_start": RecommendationSource.COLD_START,
            "popular": RecommendationSource.POPULAR,
        }
        log = RecommendationLog(
            user_id=user_id,
            product_id=rec["product_id"],
            score=rec.get("score", 0.0),
            source=source_map.get(rec.get("source", "popular"), RecommendationSource.POPULAR),
        )
        db.add(log)
    db.commit()
