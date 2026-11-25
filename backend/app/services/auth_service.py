from sqlalchemy.orm import Session

from app.models.user import User
from app.models.category import Category
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.constants import UserRole

def register_user(email: str, password: str, full_name: str, category_ids: list[int], db: Session) -> User:
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise ValueError("Email already registered")

    user = User(
        email=email,
        hashed_password=hash_password(password),
        full_name=full_name,
    )

    if category_ids:
        categories = db.query(Category).filter(Category.id.in_(category_ids)).all()
        user.preferred_categories = categories

    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(email: str, password: str, db: Session) -> User | None:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    if not user.is_active or not user.is_approved:
        return None
    return user

def create_tokens(user: User) -> dict:
    return {
        "access_token": create_access_token(str(user.id), user.role.value),
        "refresh_token": create_refresh_token(str(user.id)),
        "token_type": "bearer",
    }

def refresh_access_token(refresh_token: str, db: Session) -> dict | None:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        return None

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user or not user.is_active or not user.is_approved:
        return None

    return create_tokens(user)
