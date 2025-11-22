from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class ProductBase(BaseModel):
    name: str
    sku: str
    category: str | None = None
    min_stock_level: int = 0


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    sku: str | None = None
    category: str | None = None
    min_stock_level: int | None = None
    current_stock: int | None = None


class ProductResponse(ProductBase):
    id: UUID
    current_stock: int
    last_updated: datetime
    is_deleted: bool

    class Config:
        from_attributes = True
