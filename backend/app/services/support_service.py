import os
import uuid

from groq import Groq
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import settings
from app.models.product import Product
from app.models.review import Review
from app.models.category import Category

SYSTEM_PROMPT = """You are StopShop AI Assistant — a virtual customer support agent for the StopShop online store.

CRITICAL LANGUAGE RULE:
- Detect the language of the customer's message.
- If the customer writes in English, your ENTIRE response MUST be in English.
- If the customer writes in Serbian, your ENTIRE response MUST be in Serbian.
- When writing in Serbian, translate category names (e.g. "Electronics" → "Elektronika", "Books" → "Knjige", "Clothing" → "Odeća", "Home & Garden" → "Kuća i bašta", "Sports" → "Sport", "Toys" → "Igračke").
- When writing in English, keep category and product names in English.

STRICT RULES:
1. Answer ONLY based on the KNOWLEDGE BASE and PRODUCT CATALOG provided in the context.
2. NEVER use your internal knowledge about products, brands, prices, or anything outside the given context.
3. If you cannot find the answer in the given context, say you don't have that information and suggest contacting support@stopshop.com.
4. NEVER make up products, prices, availability, or policies not listed in the context.
5. When recommending products, use ONLY products from the PRODUCT CATALOG.
6. If the customer asks something unrelated to StopShop (e.g. general questions, weather, politics, sports), politely decline and redirect to store-related topics.

COMMUNICATION STYLE:
- Be friendly, concise, and professional.
- Use formatting for readability (lists, bold for product names).
- If the customer asks for a recommendation, suggest 2-3 products from the catalog with a brief explanation.

STORE INFORMATION:
- Name: StopShop
- Type: Online store with personalized recommendations
- Payment: Stripe (Visa, Mastercard, American Express)
- Delivery: 3-5 business days, free delivery for orders over 5000 RSD
- Returns: 14 days from receipt, unused product in original packaging
- Support: support@stopshop.com"""

def _load_knowledge_base() -> str:
    """Učitaj bazu znanja iz data/chatbot_knowledge.md fajla."""
    kb_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "data",
        "chatbot_knowledge.md",
    )
    try:
        with open(kb_path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return ""

_KNOWLEDGE_BASE = _load_knowledge_base()

def _search_products(query: str, db: Session, limit: int = 10) -> list[Product]:
    """Search products by name or description using ILIKE."""
    return (
        db.query(Product)
        .filter(
            Product.is_active == True,
            (Product.name.ilike(f"%{query}%") | Product.description.ilike(f"%{query}%")),
        )
        .limit(limit)
        .all()
    )

def _build_product_context(products: list[Product], db: Session) -> str:
    """Build a text context from product data for the LLM."""
    if not products:
        return "No matching products found in the catalog."

    lines = []
    for p in products:
        avg_rating = (
            db.query(func.avg(Review.rating))
            .filter(Review.product_id == p.id)
            .scalar()
        )
        rating_str = f"{float(avg_rating):.1f}/5" if avg_rating else "No ratings yet"
        tags = ", ".join(t.name for t in p.tags) if p.tags else "None"

        lines.append(
            f"- {p.name} | Price: ${float(p.price):.2f} | Category: {p.category.name} | "
            f"Rating: {rating_str} | Tags: {tags} | Stock: {p.stock_quantity} | "
            f"Description: {p.description[:200]}"
        )

    return "\n".join(lines)

async def answer_question(message: str, db: Session, product_id: uuid.UUID | None = None) -> dict:
    """Answer a customer question using RAG over product catalog + knowledge base."""
    all_products = (
        db.query(Product)
        .filter(Product.is_active == True)
        .order_by(Product.name)
        .all()
    )

    products = []
    if product_id:
        specific_product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
        if specific_product:
            products.append(specific_product)

    existing_ids = {p.id for p in products}
    for p in all_products:
        if p.id not in existing_ids:
            products.append(p)

    product_context = _build_product_context(products, db)

    all_categories = db.query(Category).all()
    category_list = ", ".join(c.name for c in all_categories)

    full_context = ""
    if _KNOWLEDGE_BASE:
        full_context += f"=== BAZA ZNANJA PRODAVNICE ===\n{_KNOWLEDGE_BASE}\n\n"
    full_context += f"=== KATEGORIJE PROIZVODA ===\n{category_list}\n\n"
    full_context += f"=== KATALOG PROIZVODA ===\n{product_context}"

    client = Groq(api_key=settings.LLM_API_KEY)
    try:
        response = client.chat.completions.create(
            model=settings.LLM_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"{full_context}\n\nCustomer message: {message}\n\nIMPORTANT INSTRUCTION: Detect the language of the customer message above. If it is in English, you MUST reply ENTIRELY in English. If it is in Serbian, reply in Serbian."},
            ],
            max_tokens=500,
            temperature=0.3,
        )
        reply = response.choices[0].message.content
    except Exception as e:
        error_msg = str(e).lower()
        if "rate_limit" in error_msg or "429" in error_msg or "rate limit" in error_msg:
            reply = (
                "⏳ Chatbot je trenutno preopterećen zbog velikog broja zahteva. "
                "Molimo pokušajte ponovo za 1-2 minuta. "
                "U međuvremenu, možete nas kontaktirati na support@stopshop.com."
            )
        else:
            raise

    referenced = [
        {"id": str(p.id), "name": p.name, "price": float(p.price)}
        for p in products[:5]
    ]

    return {"reply": reply, "referenced_products": referenced}
