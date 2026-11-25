import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.review import Review
from app.models.product import Product
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse

router = APIRouter(tags=["Reviews"])

@router.get("/products/{product_id}/reviews", response_model=list[ReviewResponse])
def get_product_reviews(
    product_id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    reviews = (
        db.query(Review)
        .join(User)
        .filter(Review.product_id == product_id)
        .order_by(Review.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    result = []
    for review in reviews:
        data = ReviewResponse.model_validate(review).model_dump()
        data["user_name"] = review.user.full_name
        result.append(data)
    return result

@router.post("/products/{product_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    product_id: uuid.UUID,
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    existing = db.query(Review).filter(Review.user_id == current_user.id, Review.product_id == product_id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You already reviewed this product")

    review = Review(user_id=current_user.id, product_id=product_id, rating=data.rating, comment=data.comment)
    db.add(review)
    db.commit()
    db.refresh(review)
    result = ReviewResponse.model_validate(review).model_dump()
    result["user_name"] = current_user.full_name
    return result

@router.put("/reviews/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: uuid.UUID,
    data: ReviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    review = db.query(Review).filter(Review.id == review_id, Review.user_id == current_user.id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    if data.rating is not None:
        review.rating = data.rating
    if data.comment is not None:
        review.comment = data.comment
    db.commit()
    db.refresh(review)
    result = ReviewResponse.model_validate(review).model_dump()
    result["user_name"] = current_user.full_name
    return result

@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    review = db.query(Review).filter(Review.id == review_id, Review.user_id == current_user.id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    db.delete(review)
    db.commit()
