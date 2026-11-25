import pickle

import numpy as np
from sqlalchemy.orm import Session

from app.models.recommendation import SimilarityMatrix
from app.ml.engine import CollaborativeFilteringEngine

def save_trained_model(
    engine: CollaborativeFilteringEngine,
    interaction_matrix: np.ndarray,
    user_index: dict,
    product_index: dict,
    db: Session,
) -> SimilarityMatrix:
    """Save a trained model to the database."""
    db.query(SimilarityMatrix).filter(SimilarityMatrix.is_active == True).update({"is_active": False})

    model_data = pickle.dumps({
        "interaction_matrix": interaction_matrix,
        "user_similarity": engine.user_similarity,
        "item_similarity": engine.item_similarity,
    })

    record = SimilarityMatrix(
        matrix_data=model_data,
        user_index_map=user_index,
        product_index_map=product_index,
        algorithm="collaborative_filtering",
        num_users=len(user_index),
        num_products=len(product_index),
        is_active=True,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def load_active_model(db: Session) -> tuple[CollaborativeFilteringEngine, dict, dict] | None:
    """Load the currently active model from the database."""
    record = db.query(SimilarityMatrix).filter(SimilarityMatrix.is_active == True).first()
    if not record:
        return None

    model_data = pickle.loads(record.matrix_data)

    engine = CollaborativeFilteringEngine()
    engine.interaction_matrix = model_data["interaction_matrix"]
    engine.user_similarity = model_data["user_similarity"]
    engine.item_similarity = model_data["item_similarity"]

    return engine, record.user_index_map, record.product_index_map
