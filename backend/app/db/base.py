from app.db.base_class import Base

from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from app.models.tag import Tag, product_tags
from app.models.review import Review
from app.models.wishlist import WishlistItem
from app.models.cart import CartItem
from app.models.order import Order, OrderItem
from app.models.recommendation import SimilarityMatrix, RecommendationLog
