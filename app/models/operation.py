import uuid
import enum
from sqlalchemy import Column, String, DateTime, func, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class OperationType(str, enum.Enum):
    receipt = "receipt"
    delivery = "delivery"
    internal = "internal"
    adjustment = "adjustment"


class OperationStatus(str, enum.Enum):
    draft = "draft"
    done = "done"
    synced = "synced"


class Operation(Base):
    __tablename__ = "operations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reference_code = Column(String(100), nullable=True, index=True)
    type = Column(SQLEnum(OperationType), nullable=False)
    status = Column(SQLEnum(OperationStatus), default=OperationStatus.draft)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
