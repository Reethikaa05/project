from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.api.auth import get_current_user
from app.schemas.analytics import (
    ComputeRequest, 
    ComputeResponse, 
    ChartRequest, 
    ChartResponse, 
    CorrelationResponse,
    DatasetSummaryInsights
)
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.post("/compute", response_model=ComputeResponse)
def compute_column_statistic(
    req: ComputeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = AnalyticsService.compute_statistic(
        db=db,
        dataset_id=req.dataset_id,
        user_id=current_user.id,
        column_name=req.column_name,
        stat_type=req.stat_type
    )
    return result

@router.post("/chart-data", response_model=ChartResponse)
def get_chart_visualization(
    req: ChartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = AnalyticsService.generate_chart_data(
        db=db,
        dataset_id=req.dataset_id,
        user_id=current_user.id,
        x_column=req.x_column,
        y_column=req.y_column,
        chart_type=req.chart_type
    )
    return result

@router.get("/{dataset_id}/correlation", response_model=CorrelationResponse)
def get_correlation_matrix(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = AnalyticsService.get_correlation_matrix(
        db=db,
        dataset_id=dataset_id,
        user_id=current_user.id
    )
    return result

@router.get("/{dataset_id}/insights", response_model=DatasetSummaryInsights)
def get_dataset_insights(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = AnalyticsService.get_dataset_summary_insights(
        db=db,
        dataset_id=dataset_id,
        user_id=current_user.id
    )
    return result
