import os
import sys
import json

# Ensure we can import modules from the local folder
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.database import engine, Base, seed_database, generate_embedding
from models.models import Category, Product, Pricing, Inventory, ProductDescription, ProductEmbedding, UserSearchLog
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

def run_tests():
    print("[TEST] Initializing SQLite Database and running verification...")
    
    # 1. Initialize Tables
    print("[TEST] Creating SQL tables in clickcart.db...")
    Base.metadata.create_all(bind=engine)
    
    # 2. Seed Database
    print("[TEST] Running database seeding...")
    seed_database()
    
    # 3. Verify Seeding Counts
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        categories_count = db.query(Category).count()
        products_count = db.query(Product).count()
        pricing_count = db.query(Pricing).count()
        inventory_count = db.query(Inventory).count()
        description_count = db.query(ProductDescription).count()
        embedding_count = db.query(ProductEmbedding).count()
        
        print(f"\n[STATS] --- DATABASE STATS ---")
        print(f"[STATS] Categories: {categories_count} (Expected: 10)")
        print(f"[STATS] Products: {products_count} (Expected: 15+)")
        print(f"[STATS] Pricing Records: {pricing_count} (Expected: 15+)")
        print(f"[STATS] Inventory Records: {inventory_count} (Expected: 15+)")
        print(f"[STATS] Descriptions: {description_count} (Expected: 15+)")
        print(f"[STATS] Embeddings: {embedding_count} (Expected: 15+)")
        
        assert categories_count >= 10, "Categories count mismatch!"
        assert products_count >= 15, "Products count mismatch!"
        assert pricing_count == products_count, "Pricing count mismatch!"
        print("[SUCCESS] Seeding validation: PASSED!\n")
        
        # 4. Verify Semantic Vector Search logic
        print("[TEST] --- VERIFYING SEMANTIC VECTOR SEARCH ---")
        
        # Test Query 1
        query_text_1 = "Affordable gaming laptop"
        print(f"Query: '{query_text_1}'")
        
        query_vector = generate_embedding(query_text_1)
        all_embeddings = db.query(ProductEmbedding).all()
        
        scored_products = []
        for item in all_embeddings:
            p = db.query(Product).filter(Product.id == item.product_id).first()
            if not p:
                continue
            prod_vector = json.loads(item.embedding)
            
            # Unit vector dot product = Cosine Similarity
            similarity_score = sum(q * p for q, p in zip(query_vector, prod_vector))
            
            # Text overlaps boost (imitating controller logic)
            query_words = set(query_text_1.lower().split())
            prod_tags = set(json.loads(item.tags) if item.tags else [])
            overlap = query_words.intersection(prod_tags)
            if overlap:
                similarity_score += 0.2 * len(overlap)
                
            name_words = set(p.name.lower().split())
            title_overlap = query_words.intersection(name_words)
            if title_overlap:
                similarity_score += 0.3 * len(title_overlap)
                
            scored_products.append((p.name, similarity_score))
            
        scored_products.sort(key=lambda x: x[1], reverse=True)
        
        print("Top 3 Search Results:")
        for idx, (name, score) in enumerate(scored_products[:3]):
            print(f"  {idx+1}. {name} (Similarity Score: {score:.4f})")
            
        # Basic sanity check
        best_match = scored_products[0][0]
        assert "laptop" in best_match.lower() or "gaming" in best_match.lower(), "Best match is not gaming laptop!"
        print("[SUCCESS] Semantic Search validation for Laptop: PASSED!\n")
        
        # Test Query 2
        query_text_2 = "Best phone for photography"
        print(f"Query: '{query_text_2}'")
        
        query_vector_2 = generate_embedding(query_text_2)
        scored_products_2 = []
        for item in all_embeddings:
            p = db.query(Product).filter(Product.id == item.product_id).first()
            if not p:
                continue
            prod_vector = json.loads(item.embedding)
            
            similarity_score = sum(q * p for q, p in zip(query_vector_2, prod_vector))
            
            query_words = set(query_text_2.lower().split())
            prod_tags = set(json.loads(item.tags) if item.tags else [])
            overlap = query_words.intersection(prod_tags)
            if overlap:
                similarity_score += 0.2 * len(overlap)
                
            name_words = set(p.name.lower().split())
            title_overlap = query_words.intersection(name_words)
            if title_overlap:
                similarity_score += 0.3 * len(title_overlap)
                
            scored_products_2.append((p.name, similarity_score))
            
        scored_products_2.sort(key=lambda x: x[1], reverse=True)
        
        print("Top 3 Search Results:")
        for idx, (name, score) in enumerate(scored_products_2[:3]):
            print(f"  {idx+1}. {name} (Similarity Score: {score:.4f})")
            
        best_match_2 = scored_products_2[0][0]
        assert "pixelshot" in best_match_2.lower() or "phone" in best_match_2.lower(), "Best match is not a camera/phone!"
        print("[SUCCESS] Semantic Search validation for Camera Phone: PASSED!\n")
        
        print("[SUCCESS] All validation checks passed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
