import pandas as pd
from pathlib import Path

# Import utilities from the data_processing module in the same package
import sys
import os
# Ensure the local directory is on the Python path when running directly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from data_processing import (
    load_dataset,
    add_time_features,
    create_congestion_class,
    split_chronological,
    save_quantile_cutoffs,
)

# 1️⃣ Load raw data and add engineered time features
raw_df = load_dataset()
raw_df = add_time_features(raw_df)

# 2️⃣ Chronological split (train / val / test)
train_df, val_df, test_df = split_chronological(raw_df)

# 3️⃣ Create congestion class on the training set (computes quantile thresholds)
train_df, thresholds = create_congestion_class(train_df)
# Save thresholds for later inference
save_quantile_cutoffs(thresholds)

# 4️⃣ Apply the same thresholds to validation and test sets
val_df, _ = create_congestion_class(val_df, quantiles=(thresholds["low_thr"], thresholds["high_thr"]))
test_df, _ = create_congestion_class(test_df, quantiles=(thresholds["low_thr"], thresholds["high_thr"]))

# 5️⃣ Persist the splits as CSV files (stored under the brain artifact folder for easy access)
output_dir = Path(__file__).resolve().parents[2] / "data_splits"
output_dir.mkdir(parents=True, exist_ok=True)
train_df.to_csv(output_dir / "train.csv", index=False)
val_df.to_csv(output_dir / "validation.csv", index=False)
test_df.to_csv(output_dir / "test.csv", index=False)

print("Data preparation completed. Splits saved to:", output_dir)
print("Congestion thresholds:", thresholds)
