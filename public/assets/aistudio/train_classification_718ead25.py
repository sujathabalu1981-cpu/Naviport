import pandas as pd
from pathlib import Path
import joblib
from sklearn.pipeline import Pipeline
from sklearn.metrics import f1_score, roc_auc_score
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier

import sys, os
# Ensure the script can import data_processing when run directly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the preprocessing pipeline builder
from data_processing import build_preprocessor

# Paths
BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data_splits"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Load splits
train_df = pd.read_csv(DATA_DIR / "train.csv")
val_df = pd.read_csv(DATA_DIR / "val.csv")
test_df = pd.read_csv(DATA_DIR / "test.csv")

# Features and target for classification
TARGET_COL = "congestion_class"
FEATURE_COLS = [c for c in train_df.columns if c not in [TARGET_COL, "avg_wait_days"]]

X_train = train_df[FEATURE_COLS]
y_train = train_df[TARGET_COL]
X_val = val_df[FEATURE_COLS]
y_val = val_df[TARGET_COL]
X_test = test_df[FEATURE_COLS]
y_test = test_df[TARGET_COL]

# Encode target labels
le = LabelEncoder()
y_train_enc = le.fit_transform(y_train)
y_val_enc = le.transform(y_val)
y_test_enc = le.transform(y_test)

preprocessor = build_preprocessor()

candidates = {
    "LogisticRegression": LogisticRegression(max_iter=1000, class_weight="balanced"),
    "RandomForest": RandomForestClassifier(n_estimators=300, class_weight="balanced", random_state=42),
    "GradientBoosting": GradientBoostingClassifier(random_state=42),
}

best_score = -1
best_name = None
best_pipe = None
best_metrics = {}

for name, model in candidates.items():
    pipe = Pipeline([("preprocessor", preprocessor), ("clf", model)])
    pipe.fit(X_train, y_train_enc)
    # Validation predictions
    val_pred = pipe.predict(X_val)
    val_proba = pipe.predict_proba(X_val)
    macro_f1 = f1_score(y_val_enc, val_pred, average="macro")
    weighted_f1 = f1_score(y_val_enc, val_pred, average="weighted")
    # ROC‑AUC for multi‑class (OVR)
    try:
        macro_auc = roc_auc_score(y_val_enc, val_proba, multi_class="ovr", average="macro")
    except ValueError:
        macro_auc = float("nan")
    # Simple selection: highest macro F1 (you can adjust to combine metrics)
    if macro_f1 > best_score:
        best_score = macro_f1
        best_name = name
        best_pipe = pipe
        best_metrics = {
            "macro_f1": macro_f1,
            "weighted_f1": weighted_f1,
            "macro_auc": macro_auc,
        }

# Evaluate on test set with the selected model
test_pred = best_pipe.predict(X_test)
test_proba = best_pipe.predict_proba(X_test)
macro_f1_test = f1_score(y_test_enc, test_pred, average="macro")
weighted_f1_test = f1_score(y_test_enc, test_pred, average="weighted")
macro_auc_test = roc_auc_score(y_test_enc, test_proba, multi_class="ovr", average="macro")

# Save the pipeline (includes preprocessing) and label encoder
joblib.dump({"pipeline": best_pipe, "label_encoder": le}, MODEL_DIR / "classifier.joblib")

# Print a concise report
print("=== Classification Model Selection ===")
print(f"Best model: {best_name}")
print("Validation metrics:")
for k, v in best_metrics.items():
    print(f"  {k}: {v:.4f}")
print("Test metrics:")
print(f"  macro_f1: {macro_f1_test:.4f}")
print(f"  weighted_f1: {weighted_f1_test:.4f}")
print(f"  macro_auc: {macro_auc_test:.4f}")
