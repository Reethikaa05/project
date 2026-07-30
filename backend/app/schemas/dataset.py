import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class ColumnMetadata(BaseModel):
    name: str
    data_type: str # 'numeric', 'categorical', 'datetime', 'text'
    null_count: int
    sample_values: List[Any]

class DatasetBase(BaseModel):
    name: str

class DatasetCreate(DatasetBase):
    pass

class DatasetResponse(DatasetBase):
    id: int
    user_id: int
    original_filename: str
    row_count: int
    column_count: int
    columns_metadata: List[ColumnMetadata]
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class PaginatedDatasetResponse(BaseModel):
    items: List[DatasetResponse]
    total: int
    page: int
    limit: int
    total_pages: int

class DatasetPreviewResponse(BaseModel):
    id: int
    name: str
    columns_metadata: List[ColumnMetadata]
    total_rows: int
    returned_rows: int
    rows: List[Dict[str, Any]]
