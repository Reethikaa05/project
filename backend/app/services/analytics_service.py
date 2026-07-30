import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.db.models import Dataset, DatasetRow

class AnalyticsService:

    @staticmethod
    def get_dataset_dataframe(db: Session, dataset_id: int, user_id: int) -> Tuple[Dataset, pd.DataFrame]:
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == user_id).first()
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
            
        rows = db.query(DatasetRow).filter(DatasetRow.dataset_id == dataset_id)\
                 .order_by(DatasetRow.row_index.asc()).all()
                 
        if not rows:
            df = pd.DataFrame()
        else:
            row_list = [r.row_data for r in rows]
            df = pd.DataFrame(row_list)
            
        return dataset, df

    @staticmethod
    def compute_statistic(db: Session, dataset_id: int, user_id: int, column_name: str, stat_type: str) -> Dict[str, Any]:
        dataset, df = AnalyticsService.get_dataset_dataframe(db, dataset_id, user_id)
        
        # Edge Case 1: Empty dataset or column not found
        if df.empty:
            raise HTTPException(status_code=400, detail="Dataset contains no data rows")
            
        if column_name not in df.columns:
            raise HTTPException(status_code=400, detail=f"Column '{column_name}' does not exist in dataset")
            
        series = df[column_name]
        total_rows = len(series)
        null_count = int(series.isna().sum())
        valid_series = series.dropna()
        valid_count = len(valid_series)
        
        # Edge Case 2: Empty column or all nulls
        if valid_count == 0:
            if stat_type in ["null_count", "count"]:
                val = null_count if stat_type == "null_count" else 0
                return {
                    "dataset_id": dataset_id,
                    "column_name": column_name,
                    "stat_type": stat_type,
                    "value": val,
                    "column_type": "all_null",
                    "total_rows": total_rows,
                    "valid_count": 0
                }
            raise HTTPException(status_code=400, detail=f"Column '{column_name}' contains all null values and cannot compute '{stat_type}'")

        # Determine column data type
        is_numeric = pd.api.types.is_numeric_dtype(series)
        if not is_numeric:
            try:
                numeric_series = pd.to_numeric(valid_series)
                is_numeric = True
                valid_series = numeric_series
            except (ValueError, TypeError):
                is_numeric = False

        column_type = "numeric" if is_numeric else "text/categorical"

        # Edge Case 3: Non-numeric column requested for numeric operations
        numeric_stats = ["min", "max", "sum", "mean", "median", "std"]
        if not is_numeric and stat_type.lower() in numeric_stats:
            raise HTTPException(
                status_code=400, 
                detail=f"Column '{column_name}' is non-numeric ({column_type}) and cannot compute numeric statistic '{stat_type}'"
            )

        stat_lower = stat_type.lower()
        res_value = None

        if stat_lower == "min":
            res_value = float(valid_series.min()) if is_numeric else str(valid_series.min())
        elif stat_lower == "max":
            res_value = float(valid_series.max()) if is_numeric else str(valid_series.max())
        elif stat_lower == "sum":
            res_value = float(valid_series.sum())
        elif stat_lower == "mean":
            res_value = float(valid_series.mean())
        elif stat_lower == "median":
            res_value = float(valid_series.median())
        elif stat_lower == "std":
            res_value = float(valid_series.std()) if valid_count > 1 else 0.0
        elif stat_lower == "count":
            res_value = valid_count
        elif stat_lower == "null_count":
            res_value = null_count
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported statistic type '{stat_type}'")

        # Round floats for clean output
        if isinstance(res_value, float):
            res_value = round(res_value, 4)

        return {
            "dataset_id": dataset_id,
            "column_name": column_name,
            "stat_type": stat_type,
            "value": res_value,
            "column_type": column_type,
            "total_rows": total_rows,
            "valid_count": valid_count
        }

    @staticmethod
    def generate_chart_data(db: Session, dataset_id: int, user_id: int, x_column: str, y_column: Optional[str] = None, chart_type: str = "scatter") -> Dict[str, Any]:
        dataset, df = AnalyticsService.get_dataset_dataframe(db, dataset_id, user_id)
        
        if df.empty or x_column not in df.columns:
            raise HTTPException(status_code=400, detail="Invalid X column or empty dataset")

        chart_type = chart_type.lower()
        title = f"{dataset.name}: {x_column}" + (f" vs {y_column}" if y_column else "")

        # Handle Single Column Chart (Histogram / Pie / Frequency Bar)
        if not y_column or y_column == "" or chart_type == "pie":
            counts = df[x_column].value_counts().head(15)
            x_vals = [str(k) for k in counts.index]
            y_vals = [int(v) for v in counts.values]

            if chart_type == "pie":
                pie_data = [{"name": str(k), "value": int(v)} for k, v in zip(counts.index, counts.values)]
                option = {
                    "title": {"text": title, "left": "center"},
                    "tooltip": {"trigger": "item", "formatter": "{b}: {c} ({d}%)"},
                    "legend": {"orient": "vertical", "left": "left"},
                    "series": [{
                        "name": x_column,
                        "type": "pie",
                        "radius": "55%",
                        "center": ["50%", "60%"],
                        "data": pie_data,
                        "emphasis": {
                            "itemStyle": {
                                "shadowBlur": 10,
                                "shadowOffsetX": 0,
                                "shadowColor": "rgba(0, 0, 0, 0.5)"
                            }
                        }
                    }]
                }
                return {
                    "dataset_id": dataset_id,
                    "x_column": x_column,
                    "y_column": None,
                    "chart_type": "pie",
                    "title": title,
                    "series_data": pie_data,
                    "option": option
                }
            else: # Frequency bar chart for single column
                option = {
                    "title": {"text": f"Frequency Distribution: {x_column}", "left": "center"},
                    "tooltip": {"trigger": "axis"},
                    "xAxis": {"type": "category", "data": x_vals, "name": x_column, "axisLabel": {"rotate": 30}},
                    "yAxis": {"type": "value", "name": "Count"},
                    "series": [{"data": y_vals, "type": "bar", "itemStyle": {"borderRadius": [4, 4, 0, 0]}}]
                }
                return {
                    "dataset_id": dataset_id,
                    "x_column": x_column,
                    "y_column": None,
                    "chart_type": "bar",
                    "title": title,
                    "series_data": y_vals,
                    "option": option
                }

        # Handle Two Column Chart (Scatter, Line, Bar, Area)
        if y_column not in df.columns:
            raise HTTPException(status_code=400, detail=f"Column '{y_column}' does not exist in dataset")

        clean_df = df[[x_column, y_column]].dropna()
        
        # Try numeric conversion for Y if possible
        try:
            clean_df[y_column] = pd.to_numeric(clean_df[y_column])
        except (ValueError, TypeError):
            pass

        if chart_type == "scatter":
            # Form [[x1, y1], [x2, y2], ...]
            pts = []
            for _, r in clean_df.iterrows():
                try:
                    x_v = float(r[x_column]) if pd.api.types.is_numeric_dtype(clean_df[x_column]) else str(r[x_column])
                    y_v = float(r[y_column]) if pd.api.types.is_numeric_dtype(clean_df[y_column]) else str(r[y_column])
                    pts.append([x_v, y_v])
                except Exception:
                    continue

            option = {
                "title": {"text": title, "left": "center"},
                "tooltip": {"trigger": "item", "formatter": f"{x_column}: {{c}}[0]<br/>{y_column}: {{c}}[1]"},
                "xAxis": {"type": "value" if pd.api.types.is_numeric_dtype(clean_df[x_column]) else "category", "name": x_column},
                "yAxis": {"type": "value" if pd.api.types.is_numeric_dtype(clean_df[y_column]) else "category", "name": y_column},
                "dataZoom": [{"type": "inside"}, {"type": "slider"}],
                "series": [{
                    "symbolSize": 10,
                    "data": pts,
                    "type": "scatter"
                }]
            }
            return {
                "dataset_id": dataset_id,
                "x_column": x_column,
                "y_column": y_column,
                "chart_type": "scatter",
                "title": title,
                "series_data": pts,
                "option": option
            }

        elif chart_type in ["line", "bar", "area"]:
            # If x is categorical/datetime, group by x and average y
            if pd.api.types.is_numeric_dtype(clean_df[y_column]):
                grouped = clean_df.groupby(x_column)[y_column].mean().reset_index()
            else:
                grouped = clean_df.head(50)

            x_data = [str(v) for v in grouped[x_column]]
            y_data = [round(float(v), 2) if isinstance(v, (int, float, np.number)) else str(v) for v in grouped[y_column]]

            series_obj = {
                "name": y_column,
                "data": y_data,
                "type": "line" if chart_type in ["line", "area"] else "bar",
                "smooth": True if chart_type in ["line", "area"] else False
            }

            if chart_type == "area":
                series_obj["areaStyle"] = {}

            option = {
                "title": {"text": title, "left": "center"},
                "tooltip": {"trigger": "axis"},
                "xAxis": {"type": "category", "data": x_data, "name": x_column, "axisLabel": {"rotate": 30}},
                "yAxis": {"type": "value", "name": y_column},
                "dataZoom": [{"type": "inside"}, {"type": "slider"}],
                "series": [series_obj]
            }

            return {
                "dataset_id": dataset_id,
                "x_column": x_column,
                "y_column": y_column,
                "chart_type": chart_type,
                "title": title,
                "series_data": y_data,
                "option": option
            }

        else:
            raise HTTPException(status_code=400, detail=f"Unsupported chart type '{chart_type}'")

    @staticmethod
    def get_correlation_matrix(db: Session, dataset_id: int, user_id: int) -> Dict[str, Any]:
        dataset, df = AnalyticsService.get_dataset_dataframe(db, dataset_id, user_id)
        if df.empty:
            return {"dataset_id": dataset_id, "columns": [], "matrix": []}

        # Filter numeric columns
        numeric_cols = []
        for col in df.columns:
            try:
                num_series = pd.to_numeric(df[col])
                df[col] = num_series
                if df[col].dropna().nunique() > 1:
                    numeric_cols.append(col)
            except Exception:
                continue

        if len(numeric_cols) < 2:
            return {"dataset_id": dataset_id, "columns": numeric_cols, "matrix": []}

        corr_df = df[numeric_cols].corr()
        # Round correlation matrix
        matrix = []
        for row_idx, row in corr_df.iterrows():
            matrix_row = []
            for val in row:
                if pd.isna(val):
                    matrix_row.append(None)
                else:
                    matrix_row.append(round(float(val), 3))
            matrix.append(matrix_row)

        return {
            "dataset_id": dataset_id,
            "columns": numeric_cols,
            "matrix": matrix
        }

    @staticmethod
    def get_dataset_summary_insights(db: Session, dataset_id: int, user_id: int) -> Dict[str, Any]:
        dataset, df = AnalyticsService.get_dataset_dataframe(db, dataset_id, user_id)
        
        total_cells = df.size if not df.empty else 1
        null_cells = int(df.isna().sum().sum()) if not df.empty else 0
        quality_score = round(max(0.0, (1 - null_cells / total_cells) * 100), 1)

        numeric_cols = []
        categorical_cols = []

        for meta in dataset.columns_metadata:
            if meta.get("data_type") == "numeric":
                numeric_cols.append(meta["name"])
            else:
                categorical_cols.append(meta["name"])

        insights = []
        insights.append(f"Dataset contains {dataset.row_count} rows across {dataset.column_count} columns.")
        insights.append(f"Data Health Score: {quality_score}% completeness ({null_cells} missing values).")
        
        if numeric_cols:
            insights.append(f"Identified {len(numeric_cols)} quantitative columns suitable for correlation & trend analysis.")
        if categorical_cols:
            insights.append(f"Identified {len(categorical_cols)} categorical fields suitable for grouping & pie charts.")

        return {
            "dataset_id": dataset_id,
            "dataset_name": dataset.name,
            "quality_score": quality_score,
            "numeric_columns": numeric_cols,
            "categorical_columns": categorical_cols,
            "insights": insights
        }
