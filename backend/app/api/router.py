from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.products import router as products_router
from app.api.categories import router as categories_router
from app.api.admin import router as admin_router
from app.api.reviews import router as reviews_router
from app.api.wishlist import router as wishlist_router
from app.api.cart import router as cart_router
from app.api.orders import router as orders_router
from app.api.payments import router as payments_router
from app.api.recommendations import router as recommendations_router
from app.api.support import router as support_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(products_router)
api_router.include_router(categories_router)
api_router.include_router(admin_router)
api_router.include_router(reviews_router)
api_router.include_router(wishlist_router)
api_router.include_router(cart_router)
api_router.include_router(orders_router)
api_router.include_router(payments_router)
api_router.include_router(recommendations_router)
api_router.include_router(support_router)
