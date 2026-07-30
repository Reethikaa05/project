import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.api.auth import get_current_user
from app.schemas.dataset import (
    DatasetResponse, 
    PaginatedDatasetResponse, 
    DatasetPreviewResponse
)
from app.services.dataset_service import DatasetService

router = APIRouter(prefix="/datasets", tags=["Datasets"])

@router.post("/upload", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
async def upload_dataset(
    file: UploadFile = File(...),
    name: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(('.csv', '.txt')):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only CSV files are supported")
        
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")
        
    dataset = DatasetService.parse_csv_and_save(
        db=db,
        user_id=current_user.id,
        file_content=content,
        filename=file.filename,
        dataset_name=name
    )
    return dataset

@router.get("", response_model=PaginatedDatasetResponse)
def list_datasets(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search dataset name"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    datasets, total, total_pages = DatasetService.get_paginated_datasets(
        db=db,
        user_id=current_user.id,
        page=page,
        limit=limit,
        search=search
    )
    return {
        "items": datasets,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }

@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = DatasetService.get_dataset_by_id(db, dataset_id, current_user.id)
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset

@router.get("/{dataset_id}/preview", response_model=DatasetPreviewResponse)
def preview_dataset(
    dataset_id: int,
    limit: int = Query(25, ge=1, le=500, description="Rows to preview"),
    offset: int = Query(0, ge=0, description="Row offset"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    preview = DatasetService.get_dataset_preview(db, dataset_id, current_user.id, limit=limit, offset=offset)
    if not preview:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return preview

@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dataset(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = DatasetService.delete_dataset(db, dataset_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return None

@router.post("/load-sample/{sample_name}", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
def load_sample_dataset(
    sample_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Mapping of sample names to files
    sample_files = {
        "sales": ("tech_sales_2025.csv", "Tech Sales 2025 (Sample)"),
        "demographics": ("global_demographics.csv", "Global Demographics (Sample)"),
        "stocks": ("stock_market_prices.csv", "Stock Market Prices (Sample)")
    }
    
    if sample_name not in sample_files:
        raise HTTPException(status_code=400, detail="Invalid sample dataset name. Choose from 'sales', 'demographics', 'stocks'")
        
    filename, display_name = sample_files[sample_name]
    
    # Path relative to workspace
    possible_paths = [
        os.path.join(os.getcwd(), "samples", filename),
        os.path.join(os.getcwd(), "..", "samples", filename),
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "samples", filename)
    ]
    
    sample_path = None
    for p in possible_paths:
        if os.path.exists(p):
            sample_path = p
            break
            
    if not sample_path or not os.path.exists(sample_path):
        raise HTTPException(status_code=404, detail=f"Sample file {filename} not found on server")
        
    with open(sample_path, "rb") as f:
        content = f.read()
        
    dataset = DatasetService.parse_csv_and_save(
        db=db,
        user_id=current_user.id,
        file_content=content,
        filename=filename,
        dataset_name=display_name
    )
    return dataset
