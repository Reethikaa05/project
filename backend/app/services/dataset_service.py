import io
import os
import pandas as pd
from typing import Tuple, List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.db.models import Dataset, DatasetRow, User
from app.schemas.dataset import ColumnMetadata

def infer_column_type(series: pd.Series) -> str:
    # Drop NAs to check non-null data type
    valid_series = series.dropna()
    if valid_series.empty:
        return "text"
    
    # Check numeric
    if pd.api.types.is_numeric_dtype(series):
        return "numeric"
    
    # Try converting to numeric if it's object dtype
    try:
        pd.to_numeric(valid_series)
        return "numeric"
    except (ValueError, TypeError):
        pass
    
    # Check boolean
    if pd.api.types.is_bool_dtype(series):
        return "categorical"
    
    # Unique ratio check for categorical vs text
    unique_count = valid_series.nunique()
    if unique_count <= max(10, len(valid_series) * 0.2):
        return "categorical"
        
    return "text"


class DatasetService:

    @staticmethod
    def parse_csv_and_save(db: Session, user_id: int, file_content: bytes, filename: str, dataset_name: str) -> Dataset:
        # Try reading CSV with various delimiters
        try:
            df = pd.read_csv(io.BytesIO(file_content))
        except Exception:
            try:
                df = pd.read_csv(io.BytesIO(file_content), sep=";")
            except Exception:
                df = pd.read_csv(io.BytesIO(file_content), sep="\t")
        
        # Clean column names (strip whitespace)
        df.columns = [str(col).strip() for col in df.columns]
        
        row_count, column_count = df.shape
        
        columns_meta = []
        for col in df.columns:
            series = df[col]
            dtype_str = infer_column_type(series)
            null_cnt = int(series.isna().sum())
            sample_vals = series.dropna().head(3).tolist()
            # Ensure JSON serializable sample values
            cleaned_samples = []
            for val in sample_vals:
                if isinstance(val, (int, float, str, bool)):
                    cleaned_samples.append(val)
                else:
                    cleaned_samples.append(str(val))

            columns_meta.append({
                "name": col,
                "data_type": dtype_str,
                "null_count": null_cnt,
                "sample_values": cleaned_samples
            })
            
        # Create Dataset record
        dataset = Dataset(
            user_id=user_id,
            name=dataset_name,
            original_filename=filename,
            row_count=row_count,
            column_count=column_count,
            columns_metadata=columns_meta
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        
        # Bulk save rows
        # Convert df to dictionary records (replace NaN with None for valid JSON)
        records = df.where(pd.notnull(df), None).to_dict(orient="records")
        
        dataset_rows = []
        for idx, record in enumerate(records):
            dataset_rows.append(
                DatasetRow(
                    dataset_id=dataset.id,
                    row_index=idx,
                    row_data=record
                )
            )
        
        db.bulk_save_objects(dataset_rows)
        db.commit()
        
        return dataset

    @staticmethod
    def get_paginated_datasets(db: Session, user_id: int, page: int = 1, limit: int = 10, search: Optional[str] = None) -> Tuple[List[Dataset], int, int]:
        query = db.query(Dataset).filter(Dataset.user_id == user_id)
        
        if search:
            query = query.filter(Dataset.name.ilike(f"%{search}%"))
            
        total = query.count()
        total_pages = max(1, (total + limit - 1) // limit)
        
        offset = (page - 1) * limit
        datasets = query.order_by(Dataset.created_at.desc()).offset(offset).limit(limit).all()
        
        return datasets, total, total_pages

    @staticmethod
    def get_dataset_by_id(db: Session, dataset_id: int, user_id: int) -> Optional[Dataset]:
        return db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == user_id).first()

    @staticmethod
    def get_dataset_preview(db: Session, dataset_id: int, user_id: int, limit: int = 25, offset: int = 0) -> Optional[Dict[str, Any]]:
        dataset = DatasetService.get_dataset_by_id(db, dataset_id, user_id)
        if not dataset:
            return None
            
        rows_query = db.query(DatasetRow).filter(DatasetRow.dataset_id == dataset_id)\
                        .order_by(DatasetRow.row_index.asc()).offset(offset).limit(limit).all()
                        
        row_datas = [r.row_data for r in rows_query]
        
        return {
            "id": dataset.id,
            "name": dataset.name,
            "columns_metadata": dataset.columns_metadata,
            "total_rows": dataset.row_count,
            "returned_rows": len(row_datas),
            "rows": row_datas
        }

    @staticmethod
    def delete_dataset(db: Session, dataset_id: int, user_id: int) -> bool:
        dataset = DatasetService.get_dataset_by_id(db, dataset_id, user_id)
        if not dataset:
            return False
            
        db.delete(dataset)
        db.commit()
        return True
