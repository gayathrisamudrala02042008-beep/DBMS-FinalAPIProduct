import json
import requests
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.sql import text

from models.database import get_db, generate_embedding
from models.models import Category, Product, Pricing, Inventory, ProductDescription, ProductEmbedding, UserSearchLog
from models.schemas import (
    CategoryResponse, CategoryCreate, ProductResponse, ProductCreate, ProductUpdate,
    SemanticSearchRequest, SemanticSearchResponse, SearchLogResponse
)

# Router instantiation
router = APIRouter(prefix="/products", tags=["Product Catalog"])

NODE_API_URL = "http://localhost:8080"

def map_mongo_product_to_response(mp: dict) -> ProductResponse:
    # Handle optional fields and provide standard defaults matching ProductResponse
    postgres_id = mp.get("postgresId")
    prod_id = postgres_id if postgres_id else str(mp.get("_id"))
    
    cat_name = mp.get("category", "Uncategorized")
    cat_id = "cat-" + cat_name.lower().replace(" ", "-").replace("&", "and")
    
    price = float(mp.get("price", 0.0))
    stock = int(mp.get("stock", 0))
    long_desc = mp.get("description", "No description provided.")
    
    return ProductResponse(
        id=prod_id,
        name=mp.get("productName", "Unnamed Product"),
        brand=mp.get("brand", "Unknown Brand"),
        categoryId=cat_id,
        categoryName=cat_name,
        imageColor="#3b82f6",
        image="",
        rating=5.0,
        price=price,
        originalPrice=price,
        discountPercentage=0.0,
        stock=stock,
        warehouse="WH-General",
        restockDate=None,
        longDescription=long_desc,
        keyFeatures=[],
        technicalSpecs={},
        tags=[]
    )

# Helper function to assemble unified product details
def assemble_product_details(p: Product, db: Session) -> ProductResponse:
    # 1. Base details
    category_name = p.category.name if p.category else "Uncategorized"
    
    # 2. Price and discount percentage
    price_info = p.pricing
    original_price = price_info.price if price_info else 0.0
    discount_pct = price_info.discount_percentage if price_info else 0.0
    final_price = round(original_price * (1 - discount_pct / 100.0), 2)
    
    # 3. Stock and Warehouse
    inv_info = p.inventory
    stock = inv_info.stock_quantity if inv_info else 0
    wh = inv_info.warehouse_location if inv_info else "WH-General"
    restock_date = inv_info.restock_date if inv_info else None
    
    # 4. Descriptions, Key Features, and Tech Specs
    desc_info = p.description
    long_desc = desc_info.long_description if desc_info else "No description provided."
    
    key_features = []
    if desc_info and desc_info.key_features:
        try:
            key_features = json.loads(desc_info.key_features)
        except Exception:
            key_features = [desc_info.key_features]
            
    tech_specs = {}
    if desc_info and desc_info.technical_specs:
        try:
            tech_specs = json.loads(desc_info.technical_specs)
        except Exception:
            pass
            
    # 5. Search tags
    tags = []
    emb_info = p.embedding
    if emb_info and emb_info.tags:
        try:
            tags = json.loads(emb_info.tags)
        except Exception:
            tags = emb_info.tags.split(",")
            
    return ProductResponse(
        id=p.id,
        name=p.name,
        brand=p.brand,
        categoryId=p.category_id,
        categoryName=category_name,
        imageColor=p.image_color,
        image=p.image,
        rating=p.rating,
        price=final_price,
        originalPrice=original_price,
        discountPercentage=discount_pct,
        stock=stock,
        warehouse=wh,
        restockDate=restock_date,
        longDescription=long_desc,
        keyFeatures=key_features,
        technicalSpecs=tech_specs,
        tags=tags
    )

# --- CATEGORIES ENDPOINTS ---

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(cat: CategoryCreate, db: Session = Depends(get_db)):
    cat_id = "cat-" + cat.name.lower().replace(" ", "-").replace("&", "and")
    # Avoid duplicates
    existing = db.query(Category).filter(Category.id == cat_id).first()
    if existing:
        return existing
        
    new_cat = Category(id=cat_id, name=cat.name, icon=cat.icon)
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    return new_cat

# --- PRODUCTS LISTING & FILTERING ---

@router.get("", response_model=List[ProductResponse])
def get_products(
    categoryId: Optional[str] = None,
    maxPrice: Optional[float] = None,
    inStockOnly: Optional[bool] = False,
    brands: Optional[str] = None,
    sortBy: Optional[str] = "relevance",
    db: Session = Depends(get_db)
):
    # 1. Fetch all SQL products
    all_sql = db.query(Product).all()
    sql_products = [assemble_product_details(p, db) for p in all_sql]
    
    # 2. Fetch MongoDB products
    mongo_products = []
    try:
        response = requests.get(f"{NODE_API_URL}/products", timeout=5.0)
        if response.status_code == 200:
            mongo_products = response.json()
    except Exception as e:
        print(f"⚠️ Warning: Failed to fetch products from MongoDB: {e}")
        
    # 3. Merge products
    products_map = {p.id: p for p in sql_products}
    for mp in mongo_products:
        mapped = map_mongo_product_to_response(mp)
        if mapped.id in products_map:
            existing = products_map[mapped.id]
            existing.name = mapped.name
            existing.brand = mapped.brand
            existing.categoryName = mapped.categoryName
            existing.categoryId = mapped.categoryId
            existing.price = mapped.price
            existing.originalPrice = mapped.originalPrice
            existing.stock = mapped.stock
            if mp.get("description"):
                existing.longDescription = mp.get("description")
        else:
            products_map[mapped.id] = mapped
            
    merged_list = list(products_map.values())
    
    # 4. Filter the merged list
    results = []
    for p in merged_list:
        # Category Filter
        if categoryId and categoryId != "all":
            if p.categoryId != categoryId:
                continue
                
        # Brand Filter
        if brands:
            brand_list = [b.strip().lower() for b in brands.split(",") if b.strip()]
            if brand_list and p.brand.lower() not in brand_list:
                continue
                
        # Max Price Filter
        if maxPrice is not None and p.price > maxPrice:
            continue
            
        # Stock Filter
        if inStockOnly and p.stock <= 0:
            continue
            
        results.append(p)
        
    # 5. Sorting
    if sortBy == "price-asc":
        results.sort(key=lambda x: x.price)
    elif sortBy == "price-desc":
        results.sort(key=lambda x: x.price, reverse=True)
    elif sortBy == "rating":
        results.sort(key=lambda x: x.rating, reverse=True)
    elif sortBy == "popular":
        results.sort(key=lambda x: x.name)

    return results

# --- VIEW DETAILED PRODUCT INFORMATION ---

@router.get("/{id}", response_model=ProductResponse)
def get_product_by_id(id: str, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == id).first()
    if not p:
        # Fallback to MongoDB
        try:
            response = requests.get(f"{NODE_API_URL}/products/{id}", timeout=5.0)
            if response.status_code == 200:
                mp = response.json()
                return map_mongo_product_to_response(mp)
        except Exception as e:
            print(f"⚠️ Warning: Failed to fetch product from MongoDB: {e}")
        raise HTTPException(status_code=404, detail=f"Product with ID {id} not found.")
        
    sql_prod = assemble_product_details(p, db)
    
    # Try fetching from MongoDB to overlay updated fields
    try:
        response = requests.get(f"{NODE_API_URL}/products/{id}", timeout=2.0)
        if response.status_code == 200:
            mp = response.json()
            sql_prod.name = mp.get("productName", sql_prod.name)
            sql_prod.brand = mp.get("brand", sql_prod.brand)
            sql_prod.price = float(mp.get("price", sql_prod.price))
            sql_prod.originalPrice = sql_prod.price
            sql_prod.stock = int(mp.get("stock", sql_prod.stock))
            if mp.get("description"):
                sql_prod.longDescription = mp.get("description")
    except Exception as e:
        print(f"⚠️ Warning: Failed to fetch matching product from MongoDB: {e}")
        
    return sql_prod

# --- PRODUCT CRUD OPERATIONS ---

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(p_data: ProductCreate, request: Request, db: Session = Depends(get_db)):
    # Create unique string ID
    prod_id = "prod-" + p_data.name.lower().replace(" ", "-").replace("&", "and")
    
    # Check if duplicate ID exists
    existing = db.query(Product).filter(Product.id == prod_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Product with name '{p_data.name}' already exists.")
        
    # Verify Category exists
    cat = db.query(Category).filter(Category.id == p_data.categoryId).first()
    if not cat:
        raise HTTPException(status_code=400, detail=f"Category with ID {p_data.categoryId} does not exist.")
        
    auth_header = request.headers.get("authorization")
    
    try:
        # 1. Base Product
        new_prod = Product(
            id=prod_id,
            name=p_data.name,
            brand=p_data.brand,
            category_id=p_data.categoryId,
            image_color=p_data.imageColor,
            image=p_data.image,
            rating=p_data.rating
        )
        db.add(new_prod)
        
        # 2. Pricing
        pricing = Pricing(
            product_id=prod_id,
            price=p_data.price,
            discount_percentage=p_data.discountPercentage
        )
        db.add(pricing)
        
        # 3. Inventory
        inventory = Inventory(
            product_id=prod_id,
            stock_quantity=p_data.stockQuantity,
            warehouse_location=p_data.warehouseLocation,
            restock_date=datetime.utcnow().isoformat().split('T')[0]
        )
        db.add(inventory)
        
        # 4. Description
        desc = ProductDescription(
            product_id=prod_id,
            long_description=p_data.longDescription,
            key_features=json.dumps(p_data.keyFeatures),
            technical_specs=json.dumps(p_data.technicalSpecs)
        )
        db.add(desc)
        
        # 5. Semantic Embedding Vector Generation
        embedding_text = f"{p_data.name} {p_data.brand} {p_data.longDescription} {' '.join(p_data.tags)}"
        vector = generate_embedding(embedding_text)
        
        emb = ProductEmbedding(
            product_id=prod_id,
            tags=json.dumps(p_data.tags),
            embedding=json.dumps(vector)
        )
        db.add(emb)
        
        # Propagate to MongoDB
        mongo_payload = {
            "postgresId": prod_id,
            "productName": p_data.name,
            "brand": p_data.brand,
            "category": cat.name,
            "description": p_data.longDescription,
            "price": p_data.price,
            "stock": p_data.stockQuantity
        }
        
        headers = {}
        if auth_header:
            headers["Authorization"] = auth_header
            
        mongo_resp = requests.post(f"{NODE_API_URL}/products", json=mongo_payload, headers=headers, timeout=5.0)
        if mongo_resp.status_code not in (200, 201):
            raise Exception(f"MongoDB save failed with status {mongo_resp.status_code}: {mongo_resp.text}")
            
        db.commit()
        db.refresh(new_prod)
        
        return assemble_product_details(new_prod, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error inserting product: {str(e)}")

@router.put("/{id}", response_model=ProductResponse)
def update_product(id: str, p_data: ProductUpdate, request: Request, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == id).first()
    auth_header = request.headers.get("authorization")
    
    if not p:
        # Fallback to updating MongoDB directly (MongoDB-only product)
        mongo_payload = {}
        if p_data.name is not None: mongo_payload["productName"] = p_data.name
        if p_data.brand is not None: mongo_payload["brand"] = p_data.brand
        if p_data.categoryId is not None:
            cat = db.query(Category).filter(Category.id == p_data.categoryId).first()
            if cat: mongo_payload["category"] = cat.name
        if p_data.price is not None: mongo_payload["price"] = p_data.price
        if p_data.stockQuantity is not None: mongo_payload["stock"] = p_data.stockQuantity
        if p_data.longDescription is not None: mongo_payload["description"] = p_data.longDescription
        
        headers = {}
        if auth_header:
            headers["Authorization"] = auth_header
            
        try:
            mongo_resp = requests.put(f"{NODE_API_URL}/products/{id}", json=mongo_payload, headers=headers, timeout=5.0)
            if mongo_resp.status_code == 200:
                mp = mongo_resp.json().get("data")
                return map_mongo_product_to_response(mp)
        except Exception as mongo_err:
            print(f"⚠️ Warning: Failed to update MongoDB-only product: {mongo_err}")
            
        raise HTTPException(status_code=404, detail=f"Product with ID {id} not found.")
        
    try:
        # Update Product core fields
        if p_data.name is not None: p.name = p_data.name
        if p_data.brand is not None: p.brand = p_data.brand
        if p_data.categoryId is not None: p.category_id = p_data.categoryId
        if p_data.imageColor is not None: p.image_color = p_data.imageColor
        if p_data.image is not None: p.image = p_data.image
        if p_data.rating is not None: p.rating = p_data.rating
        
        # Update Pricing
        if p.pricing:
            if p_data.price is not None: p.pricing.price = p_data.price
            if p_data.discountPercentage is not None: p.pricing.discount_percentage = p_data.discountPercentage
            
        # Update Inventory
        if p.inventory:
            if p_data.stockQuantity is not None: p.inventory.stock_quantity = p_data.stockQuantity
            if p_data.warehouseLocation is not None: p.inventory.warehouse_location = p_data.warehouseLocation
            
        # Update Description
        if p.description:
            if p_data.longDescription is not None: p.description.long_description = p_data.longDescription
            if p_data.keyFeatures is not None: p.description.key_features = json.dumps(p_data.keyFeatures)
            if p_data.technicalSpecs is not None: p.description.technical_specs = json.dumps(p_data.technicalSpecs)
            
        # Update Embeddings & Recalculate Vector if relevant fields changed
        if p.embedding:
            tags_to_save = json.loads(p.embedding.tags) if p.embedding.tags else []
            if p_data.tags is not None:
                tags_to_save = p_data.tags
                p.embedding.tags = json.dumps(p_data.tags)
                
            # If name, longDescription, or tags updated, regenerate vector embedding
            if p_data.name is not None or p_data.longDescription is not None or p_data.tags is not None:
                long_desc = p_data.longDescription if p_data.longDescription is not None else (p.description.long_description if p.description else "")
                name_val = p_data.name if p_data.name is not None else p.name
                brand_val = p_data.brand if p_data.brand is not None else p.brand
                
                embedding_text = f"{name_val} {brand_val} {long_desc} {' '.join(tags_to_save)}"
                p.embedding.embedding = json.dumps(generate_embedding(embedding_text))
                
        # Propagate update to MongoDB
        mongo_payload = {}
        if p_data.name is not None: mongo_payload["productName"] = p_data.name
        if p_data.brand is not None: mongo_payload["brand"] = p_data.brand
        if p_data.categoryId is not None:
            cat = db.query(Category).filter(Category.id == p_data.categoryId).first()
            if cat: mongo_payload["category"] = cat.name
        if p_data.price is not None: mongo_payload["price"] = p_data.price
        if p_data.stockQuantity is not None: mongo_payload["stock"] = p_data.stockQuantity
        if p_data.longDescription is not None: mongo_payload["description"] = p_data.longDescription
        
        if mongo_payload:
            headers = {}
            if auth_header:
                headers["Authorization"] = auth_header
            mongo_resp = requests.put(f"{NODE_API_URL}/products/{id}", json=mongo_payload, headers=headers, timeout=5.0)
            if mongo_resp.status_code not in (200, 201):
                raise Exception(f"MongoDB update failed with status {mongo_resp.status_code}: {mongo_resp.text}")
                
        db.commit()
        db.refresh(p)
        return assemble_product_details(p, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating product: {str(e)}")

@router.delete("/{id}")
def delete_product(id: str, request: Request, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == id).first()
    auth_header = request.headers.get("authorization")
    headers = {}
    if auth_header:
        headers["Authorization"] = auth_header
        
    if not p:
        # Check if it exists in MongoDB and delete it (MongoDB-only product)
        try:
            mongo_resp = requests.delete(f"{NODE_API_URL}/products/{id}", headers=headers, timeout=5.0)
            if mongo_resp.status_code == 200:
                return {"success": True, "message": f"Product with ID {id} has been deleted successfully from MongoDB."}
        except Exception as mongo_err:
            print(f"⚠️ Warning: Failed to delete MongoDB-only product: {mongo_err}")
        raise HTTPException(status_code=404, detail=f"Product with ID {id} not found.")
        
    try:
        # Call Node.js DELETE first to maintain consistency
        try:
            mongo_resp = requests.delete(f"{NODE_API_URL}/products/{id}", headers=headers, timeout=5.0)
            # If MongoDB doesn't have it (returned 404), we can proceed to delete from SQL anyway
            if mongo_resp.status_code not in (200, 404):
                raise Exception(f"MongoDB delete failed with status {mongo_resp.status_code}: {mongo_resp.text}")
        except Exception as mongo_err:
            raise Exception(f"Failed to propagate delete to MongoDB: {str(mongo_err)}")
            
        db.delete(p)
        db.commit()
        return {"success": True, "message": f"Product with ID {id} has been deleted successfully."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting product: {str(e)}")

# --- SEMANTIC PRODUCT SEARCH WITH PERSISTENT LOGGING ---

@router.post("/search/semantic", response_model=SemanticSearchResponse)
def semantic_search(request: SemanticSearchRequest, db: Session = Depends(get_db)):
    query = request.query.strip()
    username = request.username.strip() if request.username else "guest_user"
    
    if not query:
        # Fallback to returning all products
        products = db.query(Product).all()
        results = [assemble_product_details(p, db) for p in products]
        return SemanticSearchResponse(results=results, resultsCount=len(results))
        
    # 1. Generate query vector embedding using our high-fidelity service
    query_vector = generate_embedding(query)
    
    # 2. Fetch all product embeddings
    all_embeddings = db.query(ProductEmbedding).all()
    
    scored_products = []
    
    for item in all_embeddings:
        p = db.query(Product).filter(Product.id == item.product_id).first()
        if not p:
            continue
            
        # Parse product vector
        try:
            prod_vector = json.loads(item.embedding)
        except Exception:
            continue
            
        # Calculate Cosine Similarity:
        # Since our generate_embedding normalizes vectors, they are unit vectors.
        # Thus, Cosine Similarity is simply the Dot Product!
        if len(query_vector) == len(prod_vector) and len(query_vector) > 0:
            similarity_score = sum(q * p for q, p in zip(query_vector, prod_vector))
        else:
            similarity_score = 0.0
            
        # Synonyms and keyword boost for perfect matching in natural language queries
        # (e.g. matching "cheap", "gaming", "laptop", "photography", "camera")
        query_words = set(query.lower().replace(",", " ").replace(".", " ").split())
        prod_tags = set(json.loads(item.tags) if item.tags else [])
        
        # Word overlap boost
        overlap = query_words.intersection(prod_tags)
        if overlap:
            similarity_score += 0.2 * len(overlap)
            
        # Exact title word overlap boost
        name_words = set(p.name.lower().split())
        title_overlap = query_words.intersection(name_words)
        if title_overlap:
            similarity_score += 0.3 * len(title_overlap)
            
        # Affordable/price logic boost
        prod_details = assemble_product_details(p, db)
        if "affordable" in query_words or "cheap" in query_words:
            if prod_details.price < 500:
                similarity_score += 0.35
            elif prod_details.price < 100:
                similarity_score += 0.5
        if "expensive" in query_words or "best" in query_words:
            if prod_details.price > 1000:
                similarity_score += 0.25
            if p.rating >= 4.7:
                similarity_score += 0.3
                
        scored_products.append((prod_details, similarity_score))
        
    # 3. Filter products with similarity score > threshold and sort them
    # Sorting by similarity score descending
    scored_products.sort(key=lambda x: x[1], reverse=True)
    
    # Keep top 12 ranked matches
    top_matches = [item[0] for item in scored_products if item[1] > 0.05][:12]
    
    # 4. PERSIST SEARCH QUERY TO SQL USER SEARCH LOGS (Migrated from MongoDB)
    try:
        now = datetime.utcnow().isoformat()
        log = UserSearchLog(
            username=username,
            query=query,
            timestamp=now,
            results_count=len(top_matches)
        )
        db.add(log)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"⚠️ Warning: Failed to write user search logs: {e}")
        
    return SemanticSearchResponse(
        results=top_matches,
        resultsCount=len(top_matches)
    )

# --- RECENT SEARCH LOGS ---

@router.get("/logs/search", response_model=List[SearchLogResponse])
def get_search_logs(db: Session = Depends(get_db)):
    return db.query(UserSearchLog).order_by(UserSearchLog.id.desc()).limit(20).all()
