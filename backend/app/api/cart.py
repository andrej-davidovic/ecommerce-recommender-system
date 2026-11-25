import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.cart import CartItem
from app.schemas.cart import CartItemAdd, CartItemUpdate, CartItemResponse, CartResponse

router = APIRouter(prefix="/cart", tags=["Cart"])

def _build_cart_response(items: list[CartItem]) -> CartResponse:
    cart_items = []
    total = 0.0
    for item in items:
        price = float(item.product.price)
        cart_items.append(CartItemResponse(
            id=item.id,
            product_id=item.product_id,
            product_name=item.product.name,
            product_name_sr=item.product.name_sr,
            product_price=price,
            product_image_url=item.product.image_url,
            quantity=item.quantity,
            added_at=item.added_at,
        ))
        total += price * item.quantity
    return CartResponse(items=cart_items, total=round(total, 2))

@router.get("/", response_model=CartResponse)
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.user_id == current_user.id)
        .order_by(CartItem.added_at.desc())
        .all()
    )
    return _build_cart_response(items)

@router.post("/items", response_model=CartResponse, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    data: CartItemAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == data.product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    existing = db.query(CartItem).filter(
        CartItem.user_id == current_user.id, CartItem.product_id == data.product_id
    ).first()

    if existing:
        existing.quantity += data.quantity
    else:
        item = CartItem(user_id=current_user.id, product_id=data.product_id, quantity=data.quantity)
        db.add(item)

    db.commit()

    items = (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.user_id == current_user.id)
        .all()
    )
    return _build_cart_response(items)

@router.put("/items/{product_id}", response_model=CartResponse)
def update_cart_item(
    product_id: uuid.UUID,
    data: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id, CartItem.product_id == product_id
    ).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not in cart")

    item.quantity = data.quantity
    db.commit()

    items = (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.user_id == current_user.id)
        .all()
    )
    return _build_cart_response(items)

@router.delete("/items/{product_id}", response_model=CartResponse)
def remove_from_cart(
    product_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id, CartItem.product_id == product_id
    ).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not in cart")

    db.delete(item)
    db.commit()

    items = (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.user_id == current_user.id)
        .all()
    )
    return _build_cart_response(items)

@router.delete("/", response_model=CartResponse)
def clear_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    return CartResponse(items=[], total=0.0)
