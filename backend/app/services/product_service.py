from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.models.product import Product
from app.models.category import Category
from app.models.tag import Tag
from app.models.review import Review

def get_or_create_tags(tag_names: list[str], db: Session) -> list[Tag]:
    tags = []
    for name in tag_names:
        name = name.strip().lower()
        tag = db.query(Tag).filter(Tag.name == name).first()
        if not tag:
            tag = Tag(name=name)
            db.add(tag)
        tags.append(tag)
    db.flush()
    return tags

def create_product(data: dict, db: Session) -> Product:
    tag_names = data.pop("tag_names", [])
    product = Product(**data)
    if tag_names:
        product.tags = get_or_create_tags(tag_names, db)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

def update_product(product_id: str, data: dict, db: Session) -> Product | None:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return None

    tag_names = data.pop("tag_names", None)
    for key, value in data.items():
        if value is not None:
            setattr(product, key, value)

    if tag_names is not None:
        product.tags = get_or_create_tags(tag_names, db)

    db.commit()
    db.refresh(product)
    return product

def get_product(product_id: str, db: Session) -> Product | None:
    return (
        db.query(Product)
        .options(joinedload(Product.category), joinedload(Product.tags))
        .filter(Product.id == product_id, Product.is_active == True)
        .first()
    )

def list_products(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    category_id: int | None = None,
    tag: str | None = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> tuple[list[Product], int]:
    query = (
        db.query(Product)
        .options(joinedload(Product.category), joinedload(Product.tags))
        .filter(Product.is_active == True)
    )

    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if tag:
        query = query.join(Product.tags).filter(Tag.name == tag.lower())

    total = query.count()

    sort_column = getattr(Product, sort_by, Product.created_at)
    if sort_order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    products = query.offset((page - 1) * page_size).limit(page_size).all()
    return products, total

def get_product_rating_stats(product_id: str, db: Session) -> tuple[float | None, int]:
    result = (
        db.query(func.avg(Review.rating), func.count(Review.id))
        .filter(Review.product_id == product_id)
        .first()
    )
    avg_rating = round(float(result[0]), 2) if result[0] else None
    count = result[1] or 0
    return avg_rating, count

def soft_delete_product(product_id: str, db: Session) -> bool:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return False
    product.is_active = False
    db.commit()
    return True
