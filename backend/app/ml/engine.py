import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class CollaborativeFilteringEngine:
    """User-item collaborative filtering using cosine similarity."""

    def __init__(self):
        self.user_similarity: np.ndarray | None = None
        self.item_similarity: np.ndarray | None = None
        self.interaction_matrix: np.ndarray | None = None

    def train(self, interaction_matrix: np.ndarray):
        """Compute user-user and item-item similarity matrices."""
        self.interaction_matrix = interaction_matrix

        if interaction_matrix.shape[0] < 2:
            self.user_similarity = np.zeros((interaction_matrix.shape[0], interaction_matrix.shape[0]))
        else:
            self.user_similarity = cosine_similarity(interaction_matrix)

        if interaction_matrix.shape[1] < 2:
            self.item_similarity = np.zeros((interaction_matrix.shape[1], interaction_matrix.shape[1]))
        else:
            self.item_similarity = cosine_similarity(interaction_matrix.T)

    def predict_user_scores(self, user_idx: int) -> np.ndarray:
        if self.user_similarity is None or self.interaction_matrix is None:
            return np.array([])

        sim_scores = self.user_similarity[user_idx].copy()
        sim_scores[user_idx] = 0

        denominator = np.abs(sim_scores).sum()
        if denominator < 1e-9:
            return np.zeros(self.interaction_matrix.shape[1])

        numerator = sim_scores @ self.interaction_matrix
        return numerator / denominator

    def recommend_for_user(self, user_idx: int, n: int = 10, exclude_interacted: bool = True) -> list[tuple[int, float]]:
        scores = self.predict_user_scores(user_idx)
        if len(scores) == 0:
            return []

        if exclude_interacted and self.interaction_matrix is not None:
            already_interacted = self.interaction_matrix[user_idx] != 0
            scores[already_interacted] = -np.inf

        top_indices = np.argsort(scores)[::-1][:n]
        return [(int(idx), float(scores[idx])) for idx in top_indices if scores[idx] > 0]

    def get_similar_items(self, item_idx: int, n: int = 10) -> list[tuple[int, float]]:
        if self.item_similarity is None:
            return []

        sim_scores = self.item_similarity[item_idx].copy()
        sim_scores[item_idx] = -1

        top_indices = np.argsort(sim_scores)[::-1][:n]
        return [(int(idx), float(sim_scores[idx])) for idx in top_indices if sim_scores[idx] > 0]
