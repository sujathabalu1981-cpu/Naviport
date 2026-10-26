import pandas as pd
from pathlib import Path
import joblib
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor

import sys, os
# Ensure the script can import data_processing when run directly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import preprocessing pipeline builder
from data_processing import build_preprocessor

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data_splits"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Load data splits
train_df = pd.read_csv(DATA_DIR / "train.csv")
val_df = pd.read_csv(DATA_DIR / "validation.csv")
test_df = pd.read_csv(DATA_DIR / "test.csv")

TARGET_COL = "avg_wait_days"
FEATURE_COLS = [c for c in train_df.columns if c not in [TARGET_COL, "congestion_class"]]

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

for name, model in candidates.items():
    pipe = Pipeline([("preprocessor", preprocessor), ("reg", model)])
    pipe.fit(X_train, y_train)
    # Validation predictions
    val_pred = pipe.predict(X_val)
    r2 = r2_score(y_val, val_pred)
    mae = mean_absolute_error(y_val, val_pred)
    mse = mean_squared_error(y_val, val_pred)
    # Choose based on highest R2 (you may combine metrics as needed)
    if r2 > best_score:
        best_score = r2
        best_name = name
        best_pipe = pipe
        best_metrics = {"r2": r2, "mae": mae, "mse": mse}

# Test evaluation
test_pred = best_pipe.predict(X_test)
test_r2 = r2_score(y_test, test_pred)
test_mae = mean_absolute_error(y_test, test_pred)
test_mse = mean_squared_error(y_test, test_pred)

# Save model
joblib.dump(best_pipe, MODEL_DIR / "regressor.joblib")

print("=== Regression Model Selection ===")
print(f"Best model: {best_name}")
print("Validation metrics:")
for k, v in best_metrics.items():
    print(f"  {k}: {v:.4f}")
print("Test metrics:")
print(f"  r2: {test_r2:.4f}")
print(f"  mae: {test_mae:.4f}")
print(f"  mse: {test_mse:.4f}")
