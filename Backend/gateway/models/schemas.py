from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

# -------------------------------------------------------------
# AUTHENTICATION SCHEMAS
# -------------------------------------------------------------
class UserLogin(BaseModel):
    username_or_email: str = Field(..., alias="usernameOrEmail")
    password: str

    class Config:
        populate_by_name = True


class UserSignup(BaseModel):
    username: str
    email: str
    password: str
    role: str = "user"


class UserChangePassword(BaseModel):
    username: str
    new_password: str = Field(..., alias="newPassword")

    class Config:
        populate_by_name = True


class UserUpdateProfile(BaseModel):
    username: str
    new_email: str = Field(..., alias="newEmail")

    class Config:
        populate_by_name = True


class UserResponse(
BaseModel):

    username:str

    email:str

    role:str

    token:str|None=None

    registeredAt:str

# -------------------------------------------------------------
# CATEGORY SCHEMAS
# -------------------------------------------------------------
class CategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = "📦"


class CategoryResponse(BaseModel):
    id: str
    name: str
    icon: Optional[str] = "📦"

    class Config:
        from_attributes = True


# -------------------------------------------------------------
# PRODUCT SCHEMAS
# -------------------------------------------------------------
class ProductResponse(BaseModel):
    id: str
    name: str
    brand: str
    categoryId: str
    categoryName: str
    imageColor: Optional[str] = "#3b82f6"
    image: Optional[str] = ""
    rating: float
    price: float                # Final computed discounted price
    originalPrice: float        # Raw base price
    discountPercentage: float
    stock: int
    warehouse: str
    restockDate: Optional[str] = None
    longDescription: Optional[str] = None
    keyFeatures: List[str] = []
    technicalSpecs: Dict[str, str] = {}
    tags: List[str] = []

    class Config:
        from_attributes = True
        populate_by_name = True


class ProductCreate(BaseModel):
    name: str
    brand: str
    categoryId: str
    price: float
    discountPercentage: float = 0.0
    stockQuantity: int = 10
    warehouseLocation: str = "WH-General-A1"
    imageColor: Optional[str] = "#3b82f6"
    image: Optional[str] = ""
    rating: float = 5.0
    longDescription: Optional[str] = "No description provided."
    keyFeatures: List[str] = []
    technicalSpecs: Dict[str, str] = {}
    tags: List[str] = []


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    categoryId: Optional[str] = None
    price: Optional[float] = None
    discountPercentage: Optional[float] = None
    stockQuantity: Optional[int] = None
    warehouseLocation: Optional[str] = None
    imageColor: Optional[str] = None
    image: Optional[str] = None
    rating: Optional[float] = None
    longDescription: Optional[str] = None
    keyFeatures: Optional[List[str]] = None
    technicalSpecs: Optional[Dict[str, str]] = None
    tags: Optional[List[str]] = None


# -------------------------------------------------------------
# SEMANTIC SEARCH SCHEMAS
# -------------------------------------------------------------
class SemanticSearchRequest(BaseModel):
    query: str
    username: Optional[str] = "guest_user"


class SemanticSearchResponse(BaseModel):
    results: List[ProductResponse]
    resultsCount: int = Field(..., alias="resultsCount")

    class Config:
        populate_by_name = True


# -------------------------------------------------------------
# SEARCH LOGS & STATS SCHEMAS
# -------------------------------------------------------------
class SearchLogResponse(BaseModel):
    id: int
    username: str
    query: str
    timestamp: str
    results_count: int

    class Config:
        from_attributes = True
