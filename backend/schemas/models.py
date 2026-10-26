from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any

class PredictionInput(BaseModel):
    port: str = Field(..., description="Name of the port (e.g., Shanghai, Singapore, Rotterdam)")
    country: str = Field(..., description="Country of the port (e.g., China, Singapore, Netherlands)")
    region: str = Field(..., description="Geographical shipping region (e.g., Asia, Europe, NorthAmerica)")
    week_start: str = Field(..., description="Week start date in YYYY-MM-DD format")
    throughput_teu_mn: float = Field(..., ge=0, description="Port throughput capacity in million TEUs (e.g., 40.0 for Singapore, 95.0 for Shanghai)")
    vessels_at_anchor: float = Field(..., ge=0, description="Number of container vessels currently waiting at anchor")
    port_utilization_pct: float = Field(..., ge=0, le=100, description="Port terminal yard & berth utilization percentage (0-100 or 0-1)")
    berth_delay_hrs: float = Field(..., ge=0, description="Cumulative or average berth operational delay in hours")

    @field_validator("port_utilization_pct")
    @classmethod
    def normalize_utilization(cls, v: float) -> float:
        # In the training data, utilization is expressed on a 0-1 scale (e.g., 0.99 = 99%)
        if v > 1.0:
            return round(v / 100.0, 4)
        return round(v, 4)

class CongestionPredictionResponse(BaseModel):
    prediction: Dict[str, Any]
    probabilities: Optional[Dict[str, float]] = None
    model_name: str
    model_status: str
    feature_summary: Dict[str, Any]
    thresholds: Dict[str, float]

class WaitingTimePredictionResponse(BaseModel):
    prediction: Dict[str, Any]
    unit: str = "days"
    model_name: str
    model_status: str
    feature_summary: Dict[str, Any]
    historical_benchmark: Optional[Dict[str, Any]] = None

class ModelInfoResponse(BaseModel):
    classifier: Dict[str, Any]
    regressor: Dict[str, Any]
    quantiles: Dict[str, float]
    status: str

class PortMetadata(BaseModel):
    port: str
    country: str
    region: str
    avg_throughput_teu_mn: float
    records_count: int

class MetadataResponse(BaseModel):
    ports: List[str]
    countries: List[str]
    regions: List[str]
    port_details: List[PortMetadata]
    dataset_records: int
    features: List[str]
    target_classification: str
    target_regression: str
    date_range: Dict[str, str]
    thresholds: Dict[str, float]
