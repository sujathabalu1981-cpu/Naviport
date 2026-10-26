from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from backend.schemas.models import (
    PredictionInput,
    CongestionPredictionResponse,
    WaitingTimePredictionResponse,
    MetadataResponse,
    ModelInfoResponse,
)
from backend.services.model_service import model_service
from backend.services.data_service import data_service

router = APIRouter(prefix="/api")

@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "service": "NAVIPORT Maritime Machine Learning Service",
        "models_loaded": model_service.is_loaded,
        "dataset_loaded": not data_service.df.empty if data_service.df is not None else False,
        "classifier": "GradientBoostingClassifier" if model_service.classifier_pipeline else "unloaded",
        "regressor": "LinearRegression" if model_service.regressor_pipeline else "unloaded",
    }

@router.get("/metadata", response_model=MetadataResponse)
def get_metadata():
    meta = data_service.get_metadata()
    meta["thresholds"] = model_service.quantiles
    return meta

@router.post("/predict/congestion", response_model=CongestionPredictionResponse)
def predict_congestion(payload: PredictionInput):
    try:
        result = model_service.predict_congestion(payload)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error during congestion classification: {str(e)}")

@router.post("/predict/waiting-time", response_model=WaitingTimePredictionResponse)
def predict_waiting_time(payload: PredictionInput):
    try:
        result = model_service.predict_waiting_time(payload)
        # Compute benchmark against real historical port average if available
        if data_service.df is not None and not data_service.df.empty:
            port_records = data_service.df[data_service.df["port"] == payload.port]
            if not port_records.empty:
                hist_avg = round(float(port_records["avg_wait_days"].mean()), 2)
                hist_std = round(float(port_records["avg_wait_days"].std()), 2)
                hist_min = round(float(port_records["avg_wait_days"].min()), 2)
                hist_max = round(float(port_records["avg_wait_days"].max()), 2)
                diff = round(result["prediction"]["avg_wait_days"] - hist_avg, 2)
                result["historical_benchmark"] = {
                    "historical_port_avg": hist_avg,
                    "historical_port_std": hist_std,
                    "historical_port_min": hist_min,
                    "historical_port_max": hist_max,
                    "difference_from_avg": diff,
                    "sample_records": len(port_records)
                }
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error during waiting time regression: {str(e)}")

@router.get("/analytics/overview")
def get_analytics_overview(
    port: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    overview = data_service.get_overview(
        port=port, region=region, country=country, start_date=start_date, end_date=end_date
    )
    return overview

@router.get("/analytics/trends")
def get_analytics_trends(
    port: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
):
    trends = data_service.get_trends(
        port=port, region=region, country=country, start_date=start_date, end_date=end_date
    )
    return trends

@router.get("/analytics/ports/{port_name}")
def get_port_records(port_name: str, limit: int = 30):
    records = data_service.get_recent_port_records(port_name, limit=limit)
    return {"port": port_name, "records": records, "count": len(records)}

@router.get("/models/info", response_model=ModelInfoResponse)
def get_model_information():
    info = model_service.get_model_info()
    return info
