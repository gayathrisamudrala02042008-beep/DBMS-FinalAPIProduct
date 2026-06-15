from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.database import engine, Base, seed_database
from controllers.init import api_router

# Initialize FastAPI application
app = FastAPI(
    title="ClickCart API Gateway",
    description="High-performance backend API gateway for the PS-03 Product Catalog System, built with FastAPI and SQLite.",
    version="1.0.0"
)

# Enable CORS Middleware to allow requests from the React Frontend (usually running on localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development, allows all origins. Change to specific domains in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Lifespan hook
@app.on_event("startup")
def startup_event():
    print("[STARTUP] Starting ClickCart API Gateway...")
    print("[STARTUP] Creating SQL tables if they do not exist...")
    Base.metadata.create_all(bind=engine)
    
    print("[STARTUP] Populating database seed data...")
    seed_database()
    print("[STARTUP] System Startup Sequence Completed Successfully!")

# Root health-check endpoint
@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "ClickCart API Gateway",
        "description": "API-Driven Product Catalog & Semantic Discovery Hub",
        "documentation": "/docs"
    }

# Include all aggregated API endpoints under "/api" prefix
app.include_router(api_router, prefix="/api")
