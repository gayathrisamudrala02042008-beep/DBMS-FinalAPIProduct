from sqlalchemy import Column, String, Float, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, index=True)  # e.g., 'cat-laptops'
    name = Column(String, nullable=False)
    icon = Column(String, nullable=True)

    products = relationship("Product", back_populates="category", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, index=True)  # e.g., 'prod-gaming-titan'
    name = Column(String, nullable=False, index=True)
    brand = Column(String, nullable=False, index=True)
    category_id = Column(String, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    image_color = Column(String, nullable=True)
    image = Column(String, nullable=True)
    rating = Column(Float, default=5.0)

    # Relationships
    category = relationship("Category", back_populates="products")
    pricing = relationship("Pricing", back_populates="product", uselist=False, cascade="all, delete-orphan")
    inventory = relationship("Inventory", back_populates="product", uselist=False, cascade="all, delete-orphan")
    description = relationship("ProductDescription", back_populates="product", uselist=False, cascade="all, delete-orphan")
    embedding = relationship("ProductEmbedding", back_populates="product", uselist=False, cascade="all, delete-orphan")


class Pricing(Base):
    __tablename__ = "pricing"

    product_id = Column(String, ForeignKey("products.id", ondelete="CASCADE"), primary_key=True)
    price = Column(Float, nullable=False)
    discount_percentage = Column(Float, default=0.0)

    product = relationship("Product", back_populates="pricing")


class Inventory(Base):
    __tablename__ = "inventory"

    product_id = Column(String, ForeignKey("products.id", ondelete="CASCADE"), primary_key=True)
    stock_quantity = Column(Integer, default=0)
    warehouse_location = Column(String, nullable=True)
    restock_date = Column(String, nullable=True)

    product = relationship("Product", back_populates="inventory")


# Migrated from MongoDB product_descriptions
class ProductDescription(Base):
    __tablename__ = "product_descriptions"

    product_id = Column(String, ForeignKey("products.id", ondelete="CASCADE"), primary_key=True)
    long_description = Column(Text, nullable=True)
    key_features = Column(Text, nullable=True)       # Store as JSON-serialized list of strings
    technical_specs = Column(Text, nullable=True)     # Store as JSON-serialized dict

    product = relationship("Product", back_populates="description")


# Migrated from MongoDB product_embeddings
class ProductEmbedding(Base):
    __tablename__ = "product_embeddings"

    product_id = Column(String, ForeignKey("products.id", ondelete="CASCADE"), primary_key=True)
    tags = Column(Text, nullable=True)                # Store as JSON-serialized list of strings
    embedding = Column(Text, nullable=True)           # Store as JSON-serialized list of floats (vector)

    product = relationship("Product", back_populates="embedding")


# Migrated from MongoDB user_search_logs
class UserSearchLog(Base):
    __tablename__ = "user_search_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, nullable=False, index=True)
    query = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)
    results_count = Column(Integer, default=0)
