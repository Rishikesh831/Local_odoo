from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.models.stock_move import StockMove
from app.schemas.stock_move import StockMoveCreate, StockMoveResponse, StockMoveUpdate
from app.utils.stock_update import update_stock_levels

router = APIRouter(prefix="/stock-moves", tags=["stock-moves"])


@router.post("/", response_model=StockMoveResponse, status_code=status.HTTP_201_CREATED)
def create_stock_move(stock_move: StockMoveCreate, db: Session = Depends(get_db)):
    """Create a new stock move and update product stock levels."""
    db_stock_move = StockMove(
        operation_id=stock_move.operation_id,
        product_id=stock_move.product_id,
        quantity=stock_move.quantity,
        location_source=stock_move.location_source,
        location_dest=stock_move.location_dest,
    )
    db.add(db_stock_move)
    db.flush()

    # Update stock levels
    update_stock_levels(db, stock_move.product_id, stock_move.quantity)
    
    db.commit()
    db.refresh(db_stock_move)
    return db_stock_move


@router.get("/{stock_move_id}", response_model=StockMoveResponse)
def get_stock_move(stock_move_id: UUID, db: Session = Depends(get_db)):
    """Get a stock move by ID."""
    stock_move = db.query(StockMove).filter(StockMove.id == stock_move_id).first()
    if not stock_move:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stock move not found")
    return stock_move


@router.get("/", response_model=list[StockMoveResponse])
def list_stock_moves(db: Session = Depends(get_db)):
    """List all stock moves."""
    return db.query(StockMove).all()


@router.put("/{stock_move_id}", response_model=StockMoveResponse)
def update_stock_move(stock_move_id: UUID, stock_move_update: StockMoveUpdate, db: Session = Depends(get_db)):
    """Update a stock move."""
    db_stock_move = db.query(StockMove).filter(StockMove.id == stock_move_id).first()
    if not db_stock_move:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stock move not found")

    update_data = stock_move_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_stock_move, field, value)

    db.commit()
    db.refresh(db_stock_move)
    return db_stock_move


@router.delete("/{stock_move_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stock_move(stock_move_id: UUID, db: Session = Depends(get_db)):
    """Delete a stock move."""
    db_stock_move = db.query(StockMove).filter(StockMove.id == stock_move_id).first()
    if not db_stock_move:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stock move not found")

    db.delete(db_stock_move)
    db.commit()
