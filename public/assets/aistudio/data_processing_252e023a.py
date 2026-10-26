import pandas as pd
import numpy as np
import json
from pathlib import Path
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from typing import Tuple

# Paths are relative to the repository root (d:/prj). Adjust if the repository location changes.
DATA_PATH = Path('d:/prj/port_congestion.xlsx')

def load_dataset() -> pd.DataFrame:
    """Load the original Excel dataset.

    Returns:
        pd.DataFrame: Raw data with correct dtypes.
    """
    df = pd.read_excel(DATA_PATH)
    # Ensure ``week_start`` is a datetime
    if not pd.api.types.is_datetime64_any_dtype(df["week_start"]):
        df["week_start"] = pd.to_datetime(df["week_start"], errors="coerce")
    return df

def add_time_features(df: pd.DataFrame) -> pd.DataFrame:
    """Derive simple time features from ``week_start``.

    Adds ``year_num``, ``month`` and ``week_of_year`` as integers.
    """
    df = df.copy()
    df["year_num"] = df["week_start"].dt.year
    df["month"] = df["week_start"].dt.month
    df["week_of_year"] = df["week_start"].dt.isocalendar().week.astype(int)
    return df

def create_congestion_class(df: pd.DataFrame, quantiles: tuple = None) -> Tuple[pd.DataFrame, dict]:
    """Create the ``congestion_class`` target based on ``congestion_index``.

    If ``quantiles`` is ``None`` the function computes the 33‑rd and 66‑th percentiles
    from the *training* portion of the data and returns them for later reuse.
    The returned dictionary contains ``low_thr`` and ``high_thr``.
    """
    df = df.copy()
    if quantiles is None:
        low_thr = np.percentile(df["congestion_index"], 33)
        high_thr = np.percentile(df["congestion_index"], 66)
    else:
        low_thr, high_thr = quantiles
    # Use pandas cut to discretise
    bins = [-np.inf, low_thr, high_thr, np.inf]
    labels = ["Low", "Medium", "High"]
    df["congestion_class"] = pd.cut(df["congestion_index"], bins=bins, labels=labels)
    return df, {"low_thr": float(low_thr), "high_thr": float(high_thr)}

def split_chronological(df: pd.DataFrame, test_size: float = 0.16, val_size: float = 0.1667):
    """Chronological split: train → validation → test.

    The function assumes the data is sorted by ``week_start``.
    ``test_size`` corresponds to the last *test* proportion, ``val_size`` is the
    proportion of the *remaining* data to use for validation.
    """
    df = df.sort_values("week_start").reset_index(drop=True)
    n = len(df)
    test_cut = int(n * (1 - test_size))
    # After removing test, split the rest into train/val
    val_cut = int(test_cut * (1 - val_size / (1 - test_size)))
    train = df.iloc[:val_cut]
    val = df.iloc[val_cut:test_cut]
    test = df.iloc[test_cut:]
    return train, val, test

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

def build_preprocessor():
    """Create a ColumnTransformer that encodes categoricals and scales numerics.

    The pipeline works for both linear and tree‑based models.
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

def save_quantile_cutoffs(cutoffs: dict, path: Path = Path('C:/Users/Monica B/.gemini/antigravity-ide/brain/cd5dc66c-f518-4dc6-9008-6a103eb984fb/models/congestion_quantiles.json')):
    """Persist the low/high thresholds for later inference.
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(cutoffs, f, ensure_ascii=False, indent=2)

def load_quantile_cutoffs(path: Path = Path('C:/Users/Monica B/.gemini/antigravity-ide/brain/cd5dc66c-f518-4dc6-9008-6a103eb984fb/models/congestion_quantiles.json')) -> dict:
    """Load previously saved quantile thresholds.
    """
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)
