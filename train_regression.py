import pandas as pd
from pathlib import Path
import joblib
import json
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
import sys, os

BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

from data_processing import build_preprocessor

DATA_DIR = BASE_DIR / "data_splits"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Load data splits (agreeing on validation file safely)
train_df = pd.read_csv(DATA_DIR / "train.csv")
val_file = DATA_DIR / "validation.csv" if (DATA_DIR / "validation.csv").exists() else DATA_DIR / "val.csv"
val_df = pd.read_csv(val_file)
test_df = pd.read_csv(DATA_DIR / "test.csv")

TARGET_COL = "avg_wait_days"
# Exclude targets from features (prevent leakage)
FEATURE_COLS = [c for c in train_df.columns if c not in [TARGET_COL, "congestion_class", "congestion_index", "week_start", "year"]]

X_train = train_df[FEATURE_COLS]
y_train = train_df[TARGET_COL]
X_val = val_df[FEATURE_COLS]
y_val = val_df[TARGET_COL]
X_test = test_df[FEATURE_COLS]
y_test = test_df[TARGET_COL]

preprocessor = build_preprocessor()

candidates = {
    "LinearRegression": LinearRegression(),
    "RandomForest": RandomForestRegressor(n_estimators=300, random_state=42),
    "GradientBoosting": GradientBoostingRegressor(random_state=42),
}

best_score = -float("inf")
best_name = None
best_pipe = None
best_metrics = {}
all_results = {}

for name, model in candidates.items():
    pipe = Pipeline([("preprocessor", preprocessor), ("reg", model)])
    pipe.fit(X_train, y_train)
    
    val_pred = pipe.predict(X_val)
    r2 = r2_score(y_val, val_pred)
    mae = mean_absolute_error(y_val, val_pred)
    mse = mean_squared_error(y_val, val_pred)
    rmse = mse ** 0.5
    
    all_results[name] = {
        "val_r2": float(r2),
        "val_mae": float(mae),
        "val_mse": float(mse),
        "val_rmse": float(rmse),
    }
    
    if r2 > best_score:
        best_score = r2
        best_name = name
        best_pipe = pipe
        best_metrics = {
            "r2": float(r2),
            "mae": float(mae),
            "mse": float(mse),
            "rmse": float(rmse),
        }

# Test evaluation
test_pred = best_pipe.predict(X_test)
test_r2 = r2_score(y_test, test_pred)
test_mae = mean_absolute_error(y_test, test_pred)
test_mse = mean_squared_error(y_test, test_pred)
test_rmse = test_mse ** 0.5

test_metrics = {
    "r2": float(test_r2),
    "mae": float(test_mae),
    "mse": float(test_mse),
    "rmse": float(test_rmse),
}

# Save model
joblib.dump(best_pipe, MODEL_DIR / "regressor.joblib")

# Save model report metadata
report = {
    "task": "regression",
    "target": TARGET_COL,
    "unit": "days",
    "features": FEATURE_COLS,
    "best_model": best_name,
    "validation_metrics": best_metrics,
    "test_metrics": test_metrics,
    "candidate_evaluations": all_results
}
with open(MODEL_DIR / "regression_metrics.json", "w") as f:
    json.dump(report, f, indent=2)

print("=== Regression Model Selection ===")
print(f"Best model: {best_name}")
print("Validation metrics:", best_metrics)
print("Test metrics:", test_metrics)
