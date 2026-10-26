import os
import json
from pathlib import Path
from typing import Dict, Any, Optional
import pandas as pd
import numpy as np
import joblib

from backend.schemas.models import PredictionInput

BASE_DIR = Path(__file__).resolve().parents[2]
MODELS_DIR = BASE_DIR / "models"

class ModelService:
    def __init__(self):
        self.classifier_pipeline = None
        self.label_encoder = None
        self.regressor_pipeline = None
        self.quantiles = {"low_thr": 1.24, "high_thr": 2.9}
        self.classification_meta = {}
        self.regression_meta = {}
        self.is_loaded = False
        self.load_models()

    def load_models(self):
        try:
            # 1. Congestion quantiles
            quantiles_file = MODELS_DIR / "congestion_quantiles.json"
            if quantiles_file.exists():
                with open(quantiles_file, "r", encoding="utf-8") as f:
                    self.quantiles = json.load(f)

            # 2. Classifier
            clf_file = MODELS_DIR / "classifier.joblib"
            if clf_file.exists():
                clf_data = joblib.load(clf_file)
                if isinstance(clf_data, dict):
                    self.classifier_pipeline = clf_data.get("pipeline")
                    self.label_encoder = clf_data.get("label_encoder")
                else:
                    self.classifier_pipeline = clf_data

            # 3. Regressor
            reg_file = MODELS_DIR / "regressor.joblib"
            if reg_file.exists():
                self.regressor_pipeline = joblib.load(reg_file)

            # 4. Metrics reports
            clf_meta_file = MODELS_DIR / "classification_metrics.json"
            if clf_meta_file.exists():
                with open(clf_meta_file, "r", encoding="utf-8") as f:
                    self.classification_meta = json.load(f)

            reg_meta_file = MODELS_DIR / "regression_metrics.json"
            if reg_meta_file.exists():
                with open(reg_meta_file, "r", encoding="utf-8") as f:
                    self.regression_meta = json.load(f)

            self.is_loaded = (self.classifier_pipeline is not None and self.regressor_pipeline is not None)
            print(f"ModelService loaded successfully: is_loaded={self.is_loaded}")
        except Exception as e:
            print(f"Error loading models: {e}")
            self.is_loaded = False

    def build_feature_dataframe(self, data: PredictionInput) -> pd.DataFrame:
        # Parse date and derive time features matching training convention
        dt = pd.to_datetime(data.week_start)
        year_num = int(dt.year)
        month = int(dt.month)
        week_of_year = int(dt.isocalendar().week)

        feature_dict = {
            "port": [data.port],
            "country": [data.country],
            "region": [data.region],
            "throughput_teu_mn": [float(data.throughput_teu_mn)],
            "vessels_at_anchor": [float(data.vessels_at_anchor)],
            "port_utilization_pct": [float(data.port_utilization_pct)],
            "berth_delay_hrs": [float(data.berth_delay_hrs)],
            "year_num": [year_num],
            "month": [month],
            "week_of_year": [week_of_year],
        }
        return pd.DataFrame(feature_dict)

    def predict_congestion(self, data: PredictionInput) -> Dict[str, Any]:
        if not self.is_loaded or self.classifier_pipeline is None:
            raise RuntimeError("Classification model is not loaded.")

        df = self.build_feature_dataframe(data)
        raw_pred = self.classifier_pipeline.predict(df)[0]

        # Decode class label using label encoder if present
        if self.label_encoder is not None:
            predicted_class = str(self.label_encoder.inverse_transform([raw_pred])[0])
        else:
            predicted_class = str(raw_pred)

        # Probabilities
        probabilities = None
        if hasattr(self.classifier_pipeline, "predict_proba"):
            probs = self.classifier_pipeline.predict_proba(df)[0]
            if self.label_encoder is not None:
                classes = list(self.label_encoder.classes_)
            else:
                classes = [f"Class_{i}" for i in range(len(probs))]
            probabilities = {cls_name: round(float(prob), 4) for cls_name, prob in zip(classes, probs)}

        model_name = self.classifier_pipeline.named_steps["clf"].__class__.__name__

        return {
            "prediction": {
                "class": predicted_class,
                "code": int(raw_pred)
            },
            "probabilities": probabilities,
            "model_name": model_name,
            "model_status": "loaded",
            "feature_summary": {
                "derived_year": int(df["year_num"].iloc[0]),
                "derived_month": int(df["month"].iloc[0]),
                "derived_week_of_year": int(df["week_of_year"].iloc[0]),
                "port": data.port,
                "throughput_teu_mn": data.throughput_teu_mn,
                "vessels_at_anchor": data.vessels_at_anchor,
                "port_utilization_pct": data.port_utilization_pct,
                "berth_delay_hrs": data.berth_delay_hrs,
            },
            "thresholds": self.quantiles
        }

    def predict_waiting_time(self, data: PredictionInput) -> Dict[str, Any]:
        if not self.is_loaded or self.regressor_pipeline is None:
            raise RuntimeError("Regression model is not loaded.")

        df = self.build_feature_dataframe(data)
        raw_pred = self.regressor_pipeline.predict(df)[0]
        
        # Transparently validate finite prediction
        if not np.isfinite(raw_pred):
            raise ValueError(f"Regressor produced non-finite output: {raw_pred}")

        wait_days = float(raw_pred)
        model_name = self.regressor_pipeline.named_steps["reg"].__class__.__name__

        return {
            "prediction": {
                "avg_wait_days": round(wait_days, 2),
                "is_negative": bool(wait_days < 0),
                "unit": "days"
            },
            "unit": "days",
            "model_name": model_name,
            "model_status": "loaded",
            "feature_summary": {
                "derived_year": int(df["year_num"].iloc[0]),
                "derived_month": int(df["month"].iloc[0]),
                "derived_week_of_year": int(df["week_of_year"].iloc[0]),
                "port": data.port,
                "vessels_at_anchor": data.vessels_at_anchor,
                "berth_delay_hrs": data.berth_delay_hrs,
            }
        }

    def get_model_info(self) -> Dict[str, Any]:
        clf_name = "Unavailable"
        if self.classifier_pipeline:
            clf_name = self.classifier_pipeline.named_steps["clf"].__class__.__name__

        reg_name = "Unavailable"
        if self.regressor_pipeline:
            reg_name = self.regressor_pipeline.named_steps["reg"].__class__.__name__

        return {
            "status": "ready" if self.is_loaded else "error",
            "classifier": {
                "loaded": self.classifier_pipeline is not None,
                "algorithm": clf_name,
                "target": "congestion_class",
                "classes": list(self.label_encoder.classes_) if self.label_encoder else ["Low", "Medium", "High"],
                "metrics": self.classification_meta.get("test_metrics", {}),
                "validation_metrics": self.classification_meta.get("validation_metrics", {}),
                "candidate_evaluations": self.classification_meta.get("candidate_evaluations", {}),
                "artifact_path": "models/classifier.joblib"
            },
            "regressor": {
                "loaded": self.regressor_pipeline is not None,
                "algorithm": reg_name,
                "target": "avg_wait_days",
                "unit": "days",
                "metrics": self.regression_meta.get("test_metrics", {}),
                "validation_metrics": self.regression_meta.get("validation_metrics", {}),
                "candidate_evaluations": self.regression_meta.get("candidate_evaluations", {}),
                "artifact_path": "models/regressor.joblib"
            },
            "quantiles": self.quantiles
        }

model_service = ModelService()
