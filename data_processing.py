import pandas as pd
import numpy as np
import json
from pathlib import Path
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from typing import Tuple, Optional

# Base project directory
BASE_DIR = Path(__file__).resolve().parent
DEFAULT_QUANTILES_PATH = BASE_DIR / "models" / "congestion_quantiles.json"

# Feature groups used by the preprocessing pipeline
NUMERIC_FEATURES = [
    "throughput_teu_mn",
    "vessels_at_anchor",
    "port_utilization_pct",
    "berth_delay_hrs",
    "year_num",
    "month",
    "week_of_year",
]
CATEGORICAL_FEATURES = ["port", "country", "region"]

def add_time_features(df: pd.DataFrame) -> pd.DataFrame:
    """Derive simple time features from ``week_start``.

    Adds ``year_num``, ``month`` and ``week_of_year`` as integers.
    """
    df = df.copy()
    if not pd.api.types.is_datetime64_any_dtype(df["week_start"]):
        df["week_start"] = pd.to_datetime(df["week_start"], errors="coerce")
    df["year_num"] = df["week_start"].dt.year
    df["month"] = df["week_start"].dt.month
    df["week_of_year"] = df["week_start"].dt.isocalendar().week.astype(int)
    return df

def create_congestion_class(df: pd.DataFrame, quantiles: Optional[Tuple[float, float]] = None) -> Tuple[pd.DataFrame, dict]:
    """Create the ``congestion_class`` target based on ``congestion_index``.

    If ``quantiles`` is ``None`` the function computes the 33-rd and 66-th percentiles
    from the training portion of the data and returns them for later reuse.
    The returned dictionary contains ``low_thr`` and ``high_thr``.
    """
    df = df.copy()
    if quantiles is None:
        low_thr = float(np.percentile(df["congestion_index"], 33))
        high_thr = float(np.percentile(df["congestion_index"], 66))
    else:
        low_thr, high_thr = float(quantiles[0]), float(quantiles[1])
    bins = [-np.inf, low_thr, high_thr, np.inf]
    labels = ["Low", "Medium", "High"]
    df["congestion_class"] = pd.cut(df["congestion_index"], bins=bins, labels=labels)
    return df, {"low_thr": low_thr, "high_thr": high_thr}

def split_chronological(df: pd.DataFrame, test_size: float = 0.16, val_size: float = 0.1667):
    """Chronological split: train -> validation -> test.

    The function assumes the data is sorted by ``week_start``.
    """
    df = df.sort_values("week_start").reset_index(drop=True)
    n = len(df)
    test_cut = int(n * (1 - test_size))
    val_cut = int(test_cut * (1 - val_size / (1 - test_size)))
    train = df.iloc[:val_cut]
    val = df.iloc[val_cut:test_cut]
    test = df.iloc[test_cut:]
    return train, val, test

def build_preprocessor() -> ColumnTransformer:
    """Create a ColumnTransformer that encodes categoricals and scales numerics.

    The pipeline works for both linear and tree-based models.
    """
    categorical_transformer = OneHotEncoder(handle_unknown="ignore")
    numeric_transformer = StandardScaler()
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", categorical_transformer, CATEGORICAL_FEATURES),
            ("num", numeric_transformer, NUMERIC_FEATURES),
        ]
    )
    return preprocessor

def save_quantile_cutoffs(cutoffs: dict, path: Optional[Path] = None):
    """Persist the low/high thresholds for later inference."""
    target_path = path or DEFAULT_QUANTILES_PATH
    target_path.parent.mkdir(parents=True, exist_ok=True)
    with open(target_path, "w", encoding="utf-8") as f:
        json.dump(cutoffs, f, ensure_ascii=False, indent=2)

def load_quantile_cutoffs(path: Optional[Path] = None) -> dict:
    """Load previously saved quantile thresholds."""
    target_path = path or DEFAULT_QUANTILES_PATH
    with open(target_path, "r", encoding="utf-8") as f:
        return json.load(f)
