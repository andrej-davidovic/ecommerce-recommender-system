from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.category import Category
from app.schemas.user import UserResponse, UserUpdateRequest, UserPreferencesRequest

router = APIRouter(prefix="/users", tags=["Users"])

@router.put("/me", response_model=UserResponse)
def update_profile(data: UserUpdateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.email is not None:
        existing = db.query(User).filter(User.email == data.email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")
        current_user.email = data.email
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/preferences", response_model=UserResponse)
def update_preferences(data: UserPreferencesRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    categories = db.query(Category).filter(Category.id.in_(data.category_ids)).all()
    current_user.preferred_categories = categories
    db.commit()
    db.refresh(current_user)
    return current_user
