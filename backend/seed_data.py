"""
Seed script to populate the database with demo data.
Run from backend/ folder: .venv/bin/python seed_data.py
"""

from app.db.session import SessionLocal
from app.db.base import Base
from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from app.models.tag import Tag
from app.core.security import hash_password
from app.core.constants import UserRole

db = SessionLocal()

admin = db.query(User).filter(User.email == "admin@store.com").first()
if not admin:
    admin = User(
        email="admin@store.com",
        hashed_password=hash_password("admin123"),
        full_name="Admin User",
        role=UserRole.ADMIN,
        is_approved=True,
    )
    db.add(admin)
    print("Created admin: admin@store.com / admin123")

category_data = [
    {"name": "Electronics", "name_sr": "Elektronika", "description": "Products in Electronics category", "description_sr": "Proizvodi iz kategorije Elektronika"},
    {"name": "Books", "name_sr": "Knjige", "description": "Products in Books category", "description_sr": "Proizvodi iz kategorije Knjige"},
    {"name": "Clothing", "name_sr": "Odjeća", "description": "Products in Clothing category", "description_sr": "Proizvodi iz kategorije Odjeća"},
    {"name": "Home & Garden", "name_sr": "Kuća i bašta", "description": "Products in Home & Garden category", "description_sr": "Proizvodi iz kategorije Kuća i bašta"},
    {"name": "Sports", "name_sr": "Sport", "description": "Products in Sports category", "description_sr": "Proizvodi iz kategorije Sport"},
    {"name": "Toys", "name_sr": "Igračke", "description": "Products in Toys category", "description_sr": "Proizvodi iz kategorije Igračke"},
]
categories = {}
for cdata in category_data:
    cat = db.query(Category).filter(Category.name == cdata["name"]).first()
    if not cat:
        cat = Category(**cdata)
        db.add(cat)
        db.flush()
    else:
        cat.name_sr = cdata["name_sr"]
        cat.description_sr = cdata["description_sr"]
    categories[cdata["name"]] = cat

tag_names = ["wireless", "bluetooth", "premium", "budget", "bestseller", "new",
             "fiction", "non-fiction", "programming", "cotton", "waterproof",
             "outdoor", "indoor", "kids", "smart", "portable"]
tags = {}
for name in tag_names:
    tag = db.query(Tag).filter(Tag.name == name).first()
    if not tag:
        tag = Tag(name=name)
        db.add(tag)
        db.flush()
    tags[name] = tag

products_data = [
    {"name": "Wireless Headphones Pro", "name_sr": "Bežične slušalice Pro", "description": "Premium wireless headphones with noise cancellation and 30-hour battery life.", "description_sr": "Premium bežične slušalice sa aktivnim poništavanjem buke i 30 sati autonomije baterije.", "price": 89.99, "category": "Electronics", "stock": 50, "tags": ["wireless", "bluetooth", "premium"], "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop"},
    {"name": "Bluetooth Speaker Mini", "name_sr": "Bluetooth zvučnik Mini", "description": "Compact portable speaker with powerful bass and waterproof design.", "description_sr": "Kompaktan prenosivi zvučnik sa snažnim basom i vodootpornim dizajnom.", "price": 39.99, "category": "Electronics", "stock": 100, "tags": ["bluetooth", "portable", "waterproof"], "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop"},
    {"name": "Smart Watch X200", "name_sr": "Pametni sat X200", "description": "Fitness tracker with heart rate monitor, GPS, and 7-day battery.", "description_sr": "Fitnes traker sa monitorom otkucaja srca, GPS-om i baterijom koja traje 7 dana.", "price": 199.99, "category": "Electronics", "stock": 30, "tags": ["smart", "wireless", "premium"], "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop"},
    {"name": "USB-C Hub 7-in-1", "name_sr": "USB-C hub 7-u-1", "description": "Multiport adapter with HDMI, USB 3.0, SD card reader, and PD charging.", "description_sr": "Višeportni adapter sa HDMI, USB 3.0, čitačem SD kartica i PD punjenjem.", "price": 29.99, "category": "Electronics", "stock": 200, "tags": ["portable", "budget"], "image_url": "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&h=600&fit=crop"},
    {"name": "Wireless Mouse Ergonomic", "name_sr": "Bežični ergonomski miš", "description": "Ergonomic vertical mouse reduces wrist strain, silent clicks.", "description_sr": "Ergonomski vertikalni miš smanjuje naprezanje zglobova, tihi klikovi.", "price": 24.99, "category": "Electronics", "stock": 150, "tags": ["wireless", "budget"], "image_url": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop"},
    {"name": "Clean Code", "name_sr": "Čist kod", "description": "A Handbook of Agile Software Craftsmanship by Robert C. Martin.", "description_sr": "Priručnik za agilni softverski zanat, autor Robert C. Martin.", "price": 34.99, "category": "Books", "stock": 80, "tags": ["programming", "bestseller"], "image_url": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=600&fit=crop"},
    {"name": "Python Crash Course", "name_sr": "Python ubrzani kurs", "description": "A hands-on, project-based introduction to programming with Python.", "description_sr": "Praktičan uvod u programiranje sa Python-om kroz projekte.", "price": 29.99, "category": "Books", "stock": 60, "tags": ["programming", "bestseller"], "image_url": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&h=600&fit=crop"},
    {"name": "The Great Gatsby", "name_sr": "Veliki Getsbi", "description": "F. Scott Fitzgerald's classic novel of the Jazz Age.", "description_sr": "Klasični roman F. Skota Ficdžeralda o dobu džeza.", "price": 12.99, "category": "Books", "stock": 120, "tags": ["fiction", "bestseller"], "image_url": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop"},
    {"name": "Thinking, Fast and Slow", "name_sr": "Misliti, brzo i sporo", "description": "Daniel Kahneman explores the two systems that drive how we think.", "description_sr": "Danijel Kaneman istražuje dva sistema koji upravljaju našim razmišljanjem.", "price": 16.99, "category": "Books", "stock": 90, "tags": ["non-fiction", "bestseller"], "image_url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=600&fit=crop"},
    {"name": "Cotton T-Shirt Basic", "name_sr": "Pamučna majica Basic", "description": "100% organic cotton t-shirt, comfortable everyday wear.", "description_sr": "100% organski pamuk, udobna za svakodnevno nošenje.", "price": 19.99, "category": "Clothing", "stock": 300, "tags": ["cotton", "budget"], "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop"},
    {"name": "Winter Jacket Waterproof", "name_sr": "Zimska vodootporna jakna", "description": "Insulated waterproof jacket for cold weather and outdoor activities.", "description_sr": "Izolirana vodootporna jakna za hladne dane i aktivnosti na otvorenom.", "price": 129.99, "category": "Clothing", "stock": 40, "tags": ["waterproof", "outdoor", "premium"], "image_url": "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&h=600&fit=crop"},
    {"name": "Running Shoes Pro", "name_sr": "Patike za trčanje Pro", "description": "Lightweight running shoes with responsive cushioning.", "description_sr": "Lagane patike za trčanje sa responsive amortizacijom.", "price": 89.99, "category": "Sports", "stock": 70, "tags": ["outdoor", "premium"], "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop"},
    {"name": "Yoga Mat Premium", "name_sr": "Prostirka za jogu Premium", "description": "Non-slip yoga mat with alignment lines, 6mm thickness.", "description_sr": "Neklizajuća prostirka za jogu sa linijama za poravnanje, debljina 6mm.", "price": 34.99, "category": "Sports", "stock": 100, "tags": ["indoor", "premium"], "image_url": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop"},
    {"name": "Garden Tool Set", "name_sr": "Set baštovanskog alata", "description": "5-piece garden tool set with ergonomic handles.", "description_sr": "Set od 5 baštovanskih alatki sa ergonomskim ručkama.", "price": 49.99, "category": "Home & Garden", "stock": 60, "tags": ["outdoor", "budget"], "image_url": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop"},
    {"name": "Smart LED Bulb Pack", "name_sr": "Paket pametnih LED sijalica", "description": "WiFi-enabled color-changing LED bulbs, pack of 4.", "description_sr": "LED sijalice sa WiFi-jem i promjenom boja, pakovanje od 4 komada.", "price": 39.99, "category": "Home & Garden", "stock": 80, "tags": ["smart", "indoor"], "image_url": "https://images.unsplash.com/photo-1550985543-49bee3167284?w=600&h=600&fit=crop"},
    {"name": "Building Blocks 500pc", "name_sr": "Kocke za slaganje 500 kom", "description": "Creative building blocks set for children ages 3+.", "description_sr": "Kreativni set kocki za slaganje za djecu uzrasta 3+.", "price": 24.99, "category": "Toys", "stock": 150, "tags": ["kids", "bestseller"], "image_url": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&h=600&fit=crop"},
    {"name": "Remote Control Car", "name_sr": "Auto na daljinsko upravljanje", "description": "High-speed RC car with rechargeable battery and LED lights.", "description_sr": "Brzi RC auto sa punjivom baterijom i LED svjetlima.", "price": 44.99, "category": "Toys", "stock": 60, "tags": ["kids", "new"], "image_url": "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600&h=600&fit=crop"},
    {"name": "Mechanical Keyboard RGB", "name_sr": "Mehanička tastatura RGB", "description": "Full-size mechanical keyboard with Cherry MX switches and RGB backlight.", "description_sr": "Mehanička tastatura pune veličine sa Cherry MX prekidačima i RGB pozadinskim osvjetljenjem.", "price": 79.99, "category": "Electronics", "stock": 45, "tags": ["premium", "new"], "image_url": "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&h=600&fit=crop"},
    {"name": "Camping Tent 4-Person", "name_sr": "Šator za kampovanje za 4 osobe", "description": "Easy-setup waterproof tent for 4 people with ventilation.", "description_sr": "Vodootporni šator za 4 osobe sa lakim postavljanjem i ventilacijom.", "price": 149.99, "category": "Sports", "stock": 25, "tags": ["outdoor", "waterproof"], "image_url": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=600&fit=crop"},
    {"name": "Desk Lamp LED", "name_sr": "LED stona lampa", "description": "Adjustable LED desk lamp with 5 brightness levels and USB charging port.", "description_sr": "Podesiva LED stona lampa sa 5 nivoa osvetljenja i USB portom za punjenje.", "price": 27.99, "category": "Home & Garden", "stock": 110, "tags": ["smart", "indoor", "budget"], "image_url": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=600&fit=crop"},
]

for pdata in products_data:
    existing = db.query(Product).filter(Product.name == pdata["name"]).first()
    if not existing:
        product = Product(
            name=pdata["name"],
            name_sr=pdata.get("name_sr"),
            description=pdata["description"],
            description_sr=pdata.get("description_sr"),
            price=pdata["price"],
            image_url=pdata.get("image_url"),
            category_id=categories[pdata["category"]].id,
            stock_quantity=pdata["stock"],
        )
        product.tags = [tags[t] for t in pdata["tags"]]
        db.add(product)
    else:
        if pdata.get("name_sr"):
            existing.name_sr = pdata["name_sr"]
        if pdata.get("description_sr"):
            existing.description_sr = pdata["description_sr"]
        if not existing.image_url and pdata.get("image_url"):
            existing.image_url = pdata["image_url"]

test_users = [
    {"email": "user1@test.com", "name": "Alice Johnson", "categories": ["Electronics", "Books"]},
    {"email": "user2@test.com", "name": "Bob Smith", "categories": ["Sports", "Clothing"]},
    {"email": "user3@test.com", "name": "Carol Davis", "categories": ["Home & Garden", "Toys"]},
]

for udata in test_users:
    existing = db.query(User).filter(User.email == udata["email"]).first()
    if not existing:
        user = User(
            email=udata["email"],
            hashed_password=hash_password("test123"),
            full_name=udata["name"],
            is_approved=True,
        )
        user.preferred_categories = [categories[c] for c in udata["categories"]]
        db.add(user)
        print(f"Created user: {udata['email']} / test123")

db.commit()
db.close()

print(f"\nSeed data complete!")
print(f"  Categories: {len(category_data)}")
print(f"  Tags: {len(tag_names)}")
print(f"  Products: {len(products_data)}")
print(f"  Test users: {len(test_users)} + 1 admin")
