from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.database import get_db
from app.models.product import Product
from app.models.operation import Operation
from app.models.stock_move import StockMove
from app.schemas.product import ProductResponse
from app.schemas.operation import OperationResponse
from app.schemas.stock_move import StockMoveResponse

router = APIRouter(prefix="/sync", tags=["sync"])


class SyncPushPayload(BaseModel):
    """Payload for pushing offline-generated data to server."""
    products: Optional[list[dict]] = None
    operations: Optional[list[dict]] = None
    stock_moves: Optional[list[dict]] = None


class SyncPullResponse(BaseModel):
    """Response containing synced data."""
    products: list[ProductResponse] = []
    operations: list[OperationResponse] = []
    stock_moves: list[StockMoveResponse] = []


@router.post("/push")
def sync_push(payload: SyncPushPayload, db: Session = Depends(get_db)):
    """
    Push offline-generated data to server.
    Frontend sends UUID objects that were created offline.
    """
    synced_ids = {
        "products": [],
        "operations": [],
        "stock_moves": [],
    }

    # Handle products
    if payload.products:
        for product_data in payload.products:
            product_id = product_data.get("id")
            existing = db.query(Product).filter(Product.id == product_id).first()
            if not existing:
                product = Product(**product_data)
                db.add(product)
                synced_ids["products"].append(str(product_id))

    # Handle operations
    if payload.operations:
        for operation_data in payload.operations:
            operation_id = operation_data.get("id")
            existing = db.query(Operation).filter(Operation.id == operation_id).first()
            if not existing:
                operation = Operation(**operation_data)
                db.add(operation)
                synced_ids["operations"].append(str(operation_id))

    # Handle stock moves
    if payload.stock_moves:
        for stock_move_data in payload.stock_moves:
            stock_move_id = stock_move_data.get("id")
            existing = db.query(StockMove).filter(StockMove.id == stock_move_id).first()
            if not existing:
                stock_move = StockMove(**stock_move_data)
                db.add(stock_move)
                synced_ids["stock_moves"].append(str(stock_move_id))

    db.commit()
    return {
        "status": "success",
        "synced": synced_ids,
    }


@router.get("/pull", response_model=SyncPullResponse)
def sync_pull(since: Optional[datetime] = None, db: Session = Depends(get_db)):
    """
    Pull updated rows from server.
    Returns all rows updated since the provided timestamp (or all if no timestamp).
    """
    response = SyncPullResponse()

    if since:
        response.products = db.query(Product).filter(
            and_(Product.last_updated >= since, Product.is_deleted == False)
        ).all()
        response.operations = db.query(Operation).filter(Operation.last_updated >= since).all()
        response.stock_moves = db.query(StockMove).filter(StockMove.created_at >= since).all()
    else:
        response.products = db.query(Product).filter(Product.is_deleted == False).all()
        response.operations = db.query(Operation).all()
        response.stock_moves = db.query(StockMove).all()

    return response
