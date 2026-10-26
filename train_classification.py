import pandas as pd
from pathlib import Path
import joblib
import json
from sklearn.pipeline import Pipeline
from sklearn.metrics import f1_score, roc_auc_score, accuracy_score
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
import sys, os

BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

from data_processing import build_preprocessor

DATA_DIR = BASE_DIR / "data_splits"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Load splits (supporting either val.csv or validation.csv)
train_df = pd.read_csv(DATA_DIR / "train.csv")
val_file = DATA_DIR / "val.csv" if (DATA_DIR / "val.csv").exists() else DATA_DIR / "validation.csv"
val_df = pd.read_csv(val_file)
test_df = pd.read_csv(DATA_DIR / "test.csv")

TARGET_COL = "congestion_class"
# Exclude targets from features (prevent leakage)
FEATURE_COLS = [c for c in train_df.columns if c not in [TARGET_COL, "avg_wait_days", "congestion_index", "week_start", "year"]]

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
all_results = {}

for name, model in candidates.items():
    pipe = Pipeline([("preprocessor", preprocessor), ("clf", model)])
    pipe.fit(X_train, y_train_enc)
    
    val_pred = pipe.predict(X_val)
    val_proba = pipe.predict_proba(X_val)
    
    macro_f1 = f1_score(y_val_enc, val_pred, average="macro")
    weighted_f1 = f1_score(y_val_enc, val_pred, average="weighted")
    acc = accuracy_score(y_val_enc, val_pred)
    try:
        macro_auc = roc_auc_score(y_val_enc, val_proba, multi_class="ovr", average="macro")
    except ValueError:
        macro_auc = float("nan")
        
    all_results[name] = {
        "val_macro_f1": float(macro_f1),
        "val_weighted_f1": float(weighted_f1),
        "val_accuracy": float(acc),
        "val_macro_auc": float(macro_auc),
    }
    
    if macro_f1 > best_score:
        best_score = macro_f1
        best_name = name
        best_pipe = pipe
        best_metrics = {
            "macro_f1": float(macro_f1),
            "weighted_f1": float(weighted_f1),
            "accuracy": float(acc),
            "macro_auc": float(macro_auc),
        }

# Evaluate on test set with selected best model
test_pred = best_pipe.predict(X_test)
test_proba = best_pipe.predict_proba(X_test)
macro_f1_test = f1_score(y_test_enc, test_pred, average="macro")
weighted_f1_test = f1_score(y_test_enc, test_pred, average="weighted")
acc_test = accuracy_score(y_test_enc, test_pred)
macro_auc_test = roc_auc_score(y_test_enc, test_proba, multi_class="ovr", average="macro")

test_metrics = {
    "macro_f1": float(macro_f1_test),
    "weighted_f1": float(weighted_f1_test),
    "accuracy": float(acc_test),
    "macro_auc": float(macro_auc_test),
}

# Save the pipeline and label encoder
joblib.dump({"pipeline": best_pipe, "label_encoder": le}, MODEL_DIR / "classifier.joblib")

# Save model report metadata
report = {
    "task": "classification",
    "target": TARGET_COL,
    "classes": list(le.classes_),
    "features": FEATURE_COLS,
    "best_model": best_name,
    "validation_metrics": best_metrics,
    "test_metrics": test_metrics,
    "candidate_evaluations": all_results
}
with open(MODEL_DIR / "classification_metrics.json", "w") as f:
    json.dump(report, f, indent=2)

print("=== Classification Model Selection ===")
print(f"Best model: {best_name}")
print("Validation metrics:", best_metrics)
print("Test metrics:", test_metrics)
