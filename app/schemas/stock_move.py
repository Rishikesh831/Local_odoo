from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime


class StockMoveBase(BaseModel):
    operation_id: UUID
    product_id: UUID
    quantity: int
    location_source: str = "partner"
    location_dest: str = "warehouse"


class StockMoveCreate(StockMoveBase):
    pass


class StockMoveUpdate(BaseModel):
    quantity: int | None = None
    location_source: str | None = None
    location_dest: str | None = None


class StockMoveResponse(StockMoveBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
