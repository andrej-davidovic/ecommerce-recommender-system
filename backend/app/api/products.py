import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_admin
from app.models.user import User
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse, ProductListResponse,
)
from app.services.product_service import (
    create_product, update_product, get_product, list_products,
    get_product_rating_stats, soft_delete_product,
)

router = APIRouter(prefix="/products", tags=["Products"])

def _enrich_product_response(product, db: Session) -> dict:
    avg_rating, review_count = get_product_rating_stats(str(product.id), db)
    data = ProductResponse.model_validate(product).model_dump()
    data["average_rating"] = avg_rating
    data["review_count"] = review_count
    return data

@router.get("/", response_model=ProductListResponse)
def get_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    category_id: int | None = None,
    tag: str | None = None,
    sort_by: str = Query("created_at", pattern="^(created_at|price|name)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    products, total = list_products(db, page, page_size, search, category_id, tag, sort_by, sort_order)
    items = [_enrich_product_response(p, db) for p in products]
    return {"items": items, "total": total, "page": page, "page_size": page_size}

@router.get("/{product_id}", response_model=ProductResponse)
def get_product_detail(product_id: uuid.UUID, db: Session = Depends(get_db)):
    product = get_product(str(product_id), db)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return _enrich_product_response(product, db)

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_new_product(
    data: ProductCreate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    product = create_product(data.model_dump(), db)
    return _enrich_product_response(product, db)

@router.put("/{product_id}", response_model=ProductResponse)
def update_existing_product(
    product_id: uuid.UUID,
    data: ProductUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    product = update_product(str(product_id), data.model_dump(exclude_unset=True), db)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return _enrich_product_response(product, db)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: uuid.UUID,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    if not soft_delete_product(str(product_id), db):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
