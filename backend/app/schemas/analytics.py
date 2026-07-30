from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel

class ComputeRequest(BaseModel):
    dataset_id: int
    column_name: str
    stat_type: str # 'min', 'max', 'sum', 'mean', 'median', 'std', 'count', 'null_count'

class ComputeResponse(BaseModel):
    dataset_id: int
    column_name: str
    stat_type: str
    value: Union[float, int, None]
    column_type: str
    total_rows: int
    valid_count: int

class ChartRequest(BaseModel):
    dataset_id: int
    x_column: str
    y_column: Optional[str] = None
    chart_type: str = "scatter" # 'scatter', 'line', 'bar', 'area', 'pie'

class ChartResponse(BaseModel):
    dataset_id: int
    x_column: str
    y_column: Optional[str]
    chart_type: str
    title: str
    series_data: List[Any]
    option: Dict[str, Any] # Full ECharts option object

class CorrelationResponse(BaseModel):
    dataset_id: int
    columns: List[str]
    matrix: List[List[Optional[float]]]

class DatasetSummaryInsights(BaseModel):
    dataset_id: int
    dataset_name: str
    quality_score: float # 0 to 100%
    numeric_columns: List[str]
    categorical_columns: List[str]
    insights: List[str]
