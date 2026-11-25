import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class RecommendationSource(str, enum.Enum):
    COLLABORATIVE = "collaborative"
    COLD_START = "cold_start"
    POPULAR = "popular"

SIGNAL_WEIGHT_WISHLIST = 3.0
SIGNAL_WEIGHT_REVIEW_MULTIPLIER = 1.0
SIGNAL_WEIGHT_PURCHASE = 5.0

SIGNAL_WEIGHT_CATEGORY_PREFERENCE = 1.0
SIGNAL_WEIGHT_TAG_MATCH = 0.5
