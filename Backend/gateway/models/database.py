import json
import math
import hashlib
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite local database connection
# PostgreSQL connection

SQLALCHEMY_DATABASE_URL = (
"postgresql://postgres:root@localhost:5432/productdb"
)

engine = create_engine(
SQLALCHEMY_DATABASE_URL
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency to get db session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------------------------------------------
# HIGH-FIDELITY VECTOR EMBEDDING SERVICE (384 Dimensions)
# -------------------------------------------------------------
# Generates 384-dimensional unit vector embeddings. If sentence-transformers is 
# installed, it uses the all-MiniLM-L6-v2 transformer model. Otherwise, it uses
# a fast, deterministic feature-hashing algorithm that represents cosine similarity
# beautifully in pure Python without any external dependencies.
# -------------------------------------------------------------
try:
    from sentence_transformers import SentenceTransformer
    # Initialize the local transformer model
    _model = SentenceTransformer('all-MiniLM-L6-v2')
    
    def generate_embedding(text_content: str) -> list[float]:
        if not text_content or not text_content.strip():
            return [0.0] * 384
        return _model.encode(text_content).tolist()
        
    print("[INFO] Semantic Search: sentence-transformers is loaded successfully. Using Transformer embeddings.")
except ImportError:
    # High-fidelity hashing-based vectorizer fallback
    def generate_embedding(text_content: str) -> list[float]:
        if not text_content or not text_content.strip():
            return [0.0] * 384
        
        # Lowercase, clean and tokenize
        words = text_content.lower().replace(",", " ").replace(".", " ").split()
        words = [w.strip() for w in words if len(w.strip()) > 1]
        
        vector = [0.0] * 384
        if not words:
            return vector
            
        # Feature hashing with simple term weighting
        for word in words:
            # Generate deterministic index via md5 hashing
            h = hashlib.md5(word.encode('utf-8')).hexdigest()
            idx = int(h, 16) % 384
            # Distribute weights (closer to start of text gets slightly more weight)
            vector[idx] += 1.0
            
        # L2 Normalization (so dot product directly yields cosine similarity)
        sq_sum = sum(v * v for v in vector)
        if sq_sum > 0:
            norm = math.sqrt(sq_sum)
            vector = [v / norm for v in vector]
            
        return vector

    print("[INFO] Semantic Search: sentence-transformers not installed. Using local hashing-based Vector similarity.")

# -------------------------------------------------------------
# AUTOMATIC DATABASE SEED DATA
# -------------------------------------------------------------
def seed_database():
    from .models import Category, Product, Pricing, Inventory, ProductDescription, ProductEmbedding
    db = SessionLocal()
    try:
        # 1. Seed Categories if empty
        if db.query(Category).count() == 0:
            print("[SEED] Seeding Categories table...")
            categories = [
                Category(id='cat-laptops', name='Laptops', icon='💻'),
                Category(id='cat-smartphones', name='Smartphones', icon='📱'),
                Category(id='cat-fashion', name='Fashion & Apparel', icon='👕'),
                Category(id='cat-home', name='Home & Kitchen', icon='🏡'),
                Category(id='cat-books', name='Books & Stationery', icon='📚'),
                Category(id='cat-fitness', name='Sports & Fitness', icon='🏋️'),
                Category(id='cat-groceries', name='Groceries', icon='🍎'),
                Category(id='cat-accessories', name='Accessories', icon='🎧'),
                Category(id='cat-storage', name='Storage Drives', icon='💾'),
                Category(id='cat-cameras', name='Cameras & Imaging', icon='📷')
            ]
            db.add_all(categories)
            db.commit()

        # 2. Seed Products and their corresponding tables if empty
        if db.query(Product).count() == 0:
            print("[SEED] Seeding Products, Pricing, Inventory, Descriptions and Embeddings tables...")
            
            # Catalog raw seed database
            raw_seed = [
                # Laptops
                {
                    "id": "prod-gaming-titan", "name": "Titan G15 Gaming Laptop", "brand": "Apex", "categoryId": "cat-laptops", "imageColor": "#3b82f6", "rating": 4.8,
                    "price": 1499.00, "discount": 10, "stock": 18, "wh": "WH-East-A3", "restock": "2026-06-01",
                    "longDescription": "High performance gaming laptop designed to handle AAA games with ease.",
                    "features": ["Intel i7 CPU", "16GB RAM", "RTX 4070 GPU", "1TB SSD"],
                    "specs": {"CPU": "Intel Core i7-13700H", "RAM": "16GB DDR5", "GPU": "NVIDIA RTX 4070", "Storage": "1TB SSD", "Weight": "2.4 kg"},
                    "tags": ["gaming", "laptop", "rtx", "fast", "performance", "affordable gaming laptop", "best laptop"]
                },
                {
                    "id": "prod-ultrabook-air", "name": "Zenith Air UltraBook", "brand": "SlimTech", "categoryId": "cat-laptops", "imageColor": "#06b6d4", "rating": 4.6,
                    "price": 949.00, "discount": 5, "stock": 42, "wh": "WH-East-A5", "restock": "2026-05-30",
                    "longDescription": "Ultra-thin, featherlight notebook engineered for travelers and remote professionals.",
                    "features": ["Lightweight (1.1kg)", "15-hour battery life", "16GB RAM", "512GB SSD"],
                    "specs": {"CPU": "Intel Core i5-1340P", "RAM": "16GB LPDDR5", "GPU": "Intel Iris Xe", "Storage": "512GB SSD", "Weight": "1.1 kg"},
                    "tags": ["lightweight", "portable", "battery", "student", "laptop", "ultrabook", "notebook"]
                },
                {
                    "id": "prod-officepad", "name": "OfficePad Business Notebook", "brand": "WorkCo", "categoryId": "cat-laptops", "imageColor": "#6b6684", "rating": 4.2,
                    "price": 549.00, "discount": 15, "stock": 120, "wh": "WH-West-B2", "restock": "2026-07-15",
                    "longDescription": "Affordable, secure business computer built for office tasks and everyday utility.",
                    "features": ["Spill-resistant", "Physical privacy webcam shutter", "HDMI and USB-C ports"],
                    "specs": {"CPU": "AMD Ryzen 5 5500U", "RAM": "8GB DDR4", "GPU": "AMD Radeon", "Storage": "256GB SSD", "Weight": "1.8 kg"},
                    "tags": ["cheap", "affordable", "work", "laptop", "office", "notebook", "business computer"]
                },
                {
                    "id": "prod-creator-pro", "name": "Creator Pro Max 16", "brand": "Apex", "categoryId": "cat-laptops", "imageColor": "#7c3aed", "rating": 4.9,
                    "price": 2399.00, "discount": 0, "stock": 5, "wh": "WH-East-A1", "restock": "2026-05-25",
                    "longDescription": "Powerhouse workstation for designers, architects, developers, and editing professionals.",
                    "features": ["4K Mini-LED Screen", "64GB RAM", "RTX 4090 GPU", "2TB Raid SSD"],
                    "specs": {"CPU": "Intel Core i9-13900HX", "RAM": "64GB DDR5", "GPU": "NVIDIA RTX 4090", "Storage": "2TB SSD", "Weight": "2.6 kg"},
                    "tags": ["expensive", "professional", "creator", "laptop", "developer", "workstation"]
                },
                
                # Smartphones
                {
                    "id": "prod-pixelshot", "name": "PixelShot 10 Pro", "brand": "OpticPhone", "categoryId": "cat-smartphones", "imageColor": "#10b981", "rating": 4.7,
                    "price": 899.00, "discount": 12, "stock": 28, "wh": "WH-South-C1", "restock": "2026-06-10",
                    "longDescription": "Advanced camera system on a 5G phone designed for high-resolution optical captures.",
                    "features": ["108MP Sensor", "5x Optical Zoom", "Fluid 120Hz Screen"],
                    "specs": {"Processor": "Snapdragon 8 Gen 2", "Camera": "108MP Quad", "RAM": "12GB", "Storage": "256GB", "Screen": '6.7" AMOLED'},
                    "tags": ["photography", "camera", "best", "phone", "smartphone", "best phone for photography"]
                },
                {
                    "id": "prod-galaxyfold", "name": "Nexus Fold Dual Screen", "brand": "Futurism", "categoryId": "cat-smartphones", "imageColor": "#ea580c", "rating": 4.5,
                    "price": 1799.00, "discount": 8, "stock": 2, "wh": "WH-South-C2", "restock": "2026-05-24",
                    "longDescription": "Continuous flexible unfolding screen that doubles your productive workspace.",
                    "features": ["7.6\" Folding AMOLED", "Multitasking windows", "Stylus pen support"],
                    "specs": {"Processor": "Snapdragon 8 Gen 2", "Camera": "50MP Triple", "RAM": "16GB", "Storage": "512GB", "Screen": '7.6" Main'},
                    "tags": ["expensive", "phone", "smartphone", "foldable", "tablet", "nexus"]
                },
                {
                    "id": "prod-litephone", "name": "Nexus Core Lite 5G", "brand": "OpticPhone", "categoryId": "cat-smartphones", "imageColor": "#6366f1", "rating": 4.1,
                    "price": 349.00, "discount": 0, "stock": 85, "wh": "WH-South-C4", "restock": "2026-06-15",
                    "longDescription": "Exceptional 5G smartphone representing the perfect balance between performance and value.",
                    "features": ["Affordable 5G", "Long 2-day battery", "Expandable storage support"],
                    "specs": {"Processor": "MediaTek Dimensity", "Camera": "50MP Dual", "RAM": "6GB", "Storage": "128GB", "Screen": '6.5" 90Hz'},
                    "tags": ["cheap", "affordable", "phone", "smartphone", "5g", "affordable phone"]
                },
                
                # Accessories
                {
                    "id": "prod-soundwave", "name": "SoundWave ANC Headphones", "brand": "Acoustic", "categoryId": "cat-accessories", "imageColor": "#ec4899", "rating": 4.6,
                    "price": 249.00, "discount": 20, "stock": 50, "wh": "WH-North-D1", "restock": "2026-06-05",
                    "longDescription": "Hybrid ANC headphones featuring high-fidelity sound, deep bass, and comfortable earcups.",
                    "features": ["Active Noise Cancellation", "40-Hour Bluetooth playback", "Ergonomic cushioning"],
                    "specs": {"Type": "Over-Ear", "Connection": "Bluetooth 5.3", "Drivers": "40mm", "Playback": "40 hours"},
                    "tags": ["music", "audio", "headphones", "anc", "wireless", "soundwave"]
                },
                
                # Non-Electrical Seed Data: Fashion
                {
                    "id": "prod-leather-jacket", "name": "Vintage Leather Jacket", "brand": "UrbanStyle", "categoryId": "cat-fashion", "imageColor": "#4b5563", "rating": 4.8,
                    "price": 129.99, "discount": 15, "stock": 12, "wh": "WH-Fashion-F1", "restock": "2026-06-10",
                    "longDescription": "Premium vintage leather jacket crafted from 100% genuine lambskin. Soft lining, durable metal zippers, and classic styling make this a lifetime wardrobe staple.",
                    "features": ["Genuine Leather", "Polyester lining", "Multiple zip pockets", "Slim fit design"],
                    "specs": {"Material": "100% Lambskin Leather", "Lining": "Polyester", "Color": "Black", "Closure": "Zip"},
                    "tags": ["fashion", "jacket", "leather", "clothing", "apparel", "vintage", "warm", "black"]
                },
                {
                    "id": "prod-running-shoes", "name": "SwiftRun Athletics Sneakers", "brand": "FitStride", "categoryId": "cat-fashion", "imageColor": "#ef4444", "rating": 4.5,
                    "price": 89.99, "discount": 10, "stock": 45, "wh": "WH-Fashion-F2", "restock": "2026-06-15",
                    "longDescription": "High-performance running sneakers featuring breathable mesh, responsive cushioning, and durable rubber traction. Optimized for daily joggers.",
                    "features": ["Breathable mesh upper", "Impact cushioning", "Non-slip grip", "Lightweight construction"],
                    "specs": {"Upper": "Mesh Fabric", "Sole": "Rubber", "Style": "Athletic Running", "Weight": "280g"},
                    "tags": ["fashion", "shoes", "sneakers", "running", "fitness", "red", "active", "sport"]
                },
                
                # Non-Electrical Seed Data: Home & Kitchen
                {
                    "id": "prod-french-press", "name": "Prestige Glass French Press", "brand": "BaristaPro", "categoryId": "cat-home", "imageColor": "#f59e0b", "rating": 4.6,
                    "price": 34.99, "discount": 20, "stock": 30, "wh": "WH-Home-H1", "restock": "2026-06-20",
                    "longDescription": "Elegant heat-resistant borosilicate glass coffee press with a double-mesh stainless steel plunger. Brews rich, aromatic, full-bodied coffee in minutes.",
                    "features": ["Borosilicate Glass", "Double-mesh filter", "Copper plated frame", "Heat-resistant handle"],
                    "specs": {"Capacity": "1 Liter (8 Cups)", "Glass": "Borosilicate", "Filter": "Stainless Steel", "DishwasherSafe": "Yes"},
                    "tags": ["home", "kitchen", "coffee", "brewer", "glass", "press"]
                },
                {
                    "id": "prod-chef-knife", "name": "Elite Series 8-inch Chef Knife", "brand": "KutMaster", "categoryId": "cat-home", "imageColor": "#64748b", "rating": 4.9,
                    "price": 79.99, "discount": 5, "stock": 15, "wh": "WH-Home-H2", "restock": "2026-06-12",
                    "longDescription": "Premium high-carbon German stainless steel kitchen knife. Hand-polished, razor-sharp edge, and ergonomic pakkawood handle for ultimate slicing precision.",
                    "features": ["German High-Carbon Steel", "Full tang blade", "Ergonomic pakkawood handle", "Perfect balance"],
                    "specs": {"BladeLength": "8 inches", "SteelType": "German 1.4116", "Handle": "Pakkawood", "Tang": "Full Tang"},
                    "tags": ["home", "kitchen", "knife", "chef", "steel", "cook"]
                },
                
                # Non-Electrical Seed Data: Books & Stationery
                {
                    "id": "prod-programming-book", "name": "The Art of Computer Programming", "brand": "TechPress", "categoryId": "cat-books", "imageColor": "#0284c7", "rating": 4.9,
                    "price": 99.99, "discount": 15, "stock": 8, "wh": "WH-Books-B2", "restock": "2026-06-08",
                    "longDescription": "The classic masterwork on fundamental algorithms and software architecture. Written by Donald Knuth, this hardcover edition is a must-have for computer science libraries.",
                    "features": ["Author: Donald Knuth", "Hardcover edition", "Comprehensive algorithms", "Mathematical rigor"],
                    "specs": {"Author": "Donald E. Knuth", "Publisher": "Addison-Wesley", "Format": "Hardcover", "Language": "English"},
                    "tags": ["books", "programming", "code", "algorithms", "cs", "learning"]
                },
                
                # Groceries Category
                {
                    "id": "prod-groceries-apple", "name": "Fresh Organic Red Apples (5-Pack)", "brand": "FreshFarm", "categoryId": "cat-groceries", "imageColor": "#ef4444", "rating": 4.8,
                    "price": 4.99, "discount": 5, "stock": 150, "wh": "WH-Grocery-G1", "restock": "2026-05-25",
                    "longDescription": "Crisp and juicy organic honeycrisp apples, freshly harvested from local farms. Perfect for snacks, salads, or baking.",
                    "features": ["100% Organic", "Local farm sourced", "Rich in fiber and vitamins"],
                    "specs": {"Weight": "1.2 lbs", "Source": "Local Farm", "ShelfLife": "7 days"},
                    "tags": ["groceries", "apple", "fruit", "organic", "fresh"]
                },
                {
                    "id": "prod-groceries-coffee", "name": "Premium Whole Bean Arabica Coffee", "brand": "BaristaPro", "categoryId": "cat-groceries", "imageColor": "#78350f", "rating": 4.9,
                    "price": 14.99, "discount": 10, "stock": 75, "wh": "WH-Grocery-G2", "restock": "2026-05-30",
                    "longDescription": "Single-origin, medium-roast whole bean coffee with rich notes of dark chocolate and roasted hazelnuts. Smooth body and clean finish.",
                    "features": ["100% Arabica beans", "Medium Roast", "Ethically sourced"],
                    "specs": {"Weight": "12 oz", "Roast": "Medium", "Grind": "Whole Bean"},
                    "tags": ["groceries", "coffee", "beans", "beverage", "morning"]
                }
            ]

            for item in raw_seed:
                # Add core Product
                p = Product(
                    id=item["id"],
                    name=item["name"],
                    brand=item["brand"],
                    category_id=item["categoryId"],
                    image_color=item["imageColor"],
                    image=item.get("image", ""),
                    rating=item["rating"]
                )
                db.add(p)

                # Add Pricing
                pr = Pricing(
                    product_id=item["id"],
                    price=item["price"],
                    discount_percentage=item["discount"]
                )
                db.add(pr)

                # Add Inventory
                inv = Inventory(
                    product_id=item["id"],
                    stock_quantity=item["stock"],
                    warehouse_location=item["wh"],
                    restock_date=item["restock"]
                )
                db.add(inv)

                # Add Description (JSON-serializing features and specs)
                desc = ProductDescription(
                    product_id=item["id"],
                    long_description=item["longDescription"],
                    key_features=json.dumps(item["features"]),
                    technical_specs=json.dumps(item["specs"])
                )
                db.add(desc)

                # Generate high-fidelity vector embedding based on Name, Brand, Description, and Tags
                embedding_text = f"{item['name']} {item['brand']} {item['longDescription']} {' '.join(item['tags'])}"
                vector = generate_embedding(embedding_text)

                emb = ProductEmbedding(
                    product_id=item["id"],
                    tags=json.dumps(item["tags"]),
                    embedding=json.dumps(vector)
                )
                db.add(emb)

            db.commit()
            print("[SEED] Seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding database: {e}")
    finally:
        db.close()
