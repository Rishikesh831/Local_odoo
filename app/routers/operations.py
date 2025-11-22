from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.models.operation import Operation
from app.schemas.operation import OperationCreate, OperationResponse, OperationUpdate

router = APIRouter(prefix="/operations", tags=["operations"])


@router.post("/", response_model=OperationResponse, status_code=status.HTTP_201_CREATED)
def create_operation(operation: OperationCreate, db: Session = Depends(get_db)):
    """Create a new operation."""
    db_operation = Operation(
        type=operation.type,
        reference_code=operation.reference_code,
        created_by=operation.created_by,
    )
    db.add(db_operation)
    db.commit()
    db.refresh(db_operation)
    return db_operation


@router.get("/{operation_id}", response_model=OperationResponse)
def get_operation(operation_id: UUID, db: Session = Depends(get_db)):
    """Get an operation by ID."""
    operation = db.query(Operation).filter(Operation.id == operation_id).first()
    if not operation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Operation not found")
    return operation


@router.get("/", response_model=list[OperationResponse])
def list_operations(db: Session = Depends(get_db)):
    """List all operations."""
    return db.query(Operation).all()


@router.put("/{operation_id}", response_model=OperationResponse)
def update_operation(operation_id: UUID, operation_update: OperationUpdate, db: Session = Depends(get_db)):
    """Update an operation."""
    db_operation = db.query(Operation).filter(Operation.id == operation_id).first()
    if not db_operation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Operation not found")

    update_data = operation_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_operation, field, value)

    db.commit()
    db.refresh(db_operation)
    return db_operation


@router.delete("/{operation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_operation(operation_id: UUID, db: Session = Depends(get_db)):
    """Delete an operation."""
    db_operation = db.query(Operation).filter(Operation.id == operation_id).first()
    if not db_operation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Operation not found")

    db.delete(db_operation)
    db.commit()
