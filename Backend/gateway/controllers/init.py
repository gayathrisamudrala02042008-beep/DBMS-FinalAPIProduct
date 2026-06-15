from fastapi import APIRouter
from controllers.authenticationController import router as auth_router
from controllers.productController import router as product_router

# Core API router aggregation
api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(product_router)
