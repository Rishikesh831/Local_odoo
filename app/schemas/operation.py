from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from app.models.operation import OperationType, OperationStatus


class OperationBase(BaseModel):
    type: OperationType
    reference_code: str | None = None


class OperationCreate(OperationBase):
    created_by: UUID | None = None


class OperationUpdate(BaseModel):
    type: OperationType | None = None
    status: OperationStatus | None = None
    reference_code: str | None = None


class OperationResponse(OperationBase):
    id: UUID
    status: OperationStatus
    created_by: UUID | None
    created_at: datetime
    last_updated: datetime

    model_config = ConfigDict(from_attributes=True)
