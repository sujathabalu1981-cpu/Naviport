# generate_splits.py
"""Generate chronological train/validation/test splits and save them as CSV files.

This script uses the preprocessing utilities defined in ``data_processing.py`` to:
1. Load the raw Excel dataset.
2. Add time‑based features.
3. Perform a chronological split (train → validation → test).
4. Create the ``congestion_class`` target using quantile cut‑offs derived **only** from the training set.
5. Apply the same cut‑offs to validation and test sets.
6. Persist the splits under ``data_splits/`` and store the cut‑offs for later inference.
"""

import pandas as pd
from pathlib import Path

# Import helpers from data_processing
from data_processing import (
    load_dataset,
    add_time_features,
    split_chronological,
    create_congestion_class,
    save_quantile_cutoffs,
)


def main() -> None:
    # 1. Load raw data
    df = load_dataset()

    # 2. Engineer temporal features
    df = add_time_features(df)

    # 3. Chronological split (train/val/test)
    train_df, val_df, test_df = split_chronological(df)

    # 4. Create target on training data and capture cut‑offs
    train_df, cutoffs = create_congestion_class(train_df, quantiles=None)

    # 5. Apply same cut‑offs to validation and test sets
    val_df, _ = create_congestion_class(val_df, quantiles=(cutoffs["low_thr"], cutoffs["high_thr"]))
    test_df, _ = create_congestion_class(test_df, quantiles=(cutoffs["low_thr"], cutoffs["high_thr"]))

    # 6. Persist splits
    splits_dir = Path(__file__).resolve().parents[1] / "data_splits"
    splits_dir.mkdir(parents=True, exist_ok=True)
    train_df.to_csv(splits_dir / "train.csv", index=False)
    val_df.to_csv(splits_dir / "val.csv", index=False)
    test_df.to_csv(splits_dir / "test.csv", index=False)

    # 7. Save cut‑offs for inference
    save_quantile_cutoffs(cutoffs)

    print("Splits and cut-offs saved to", splits_dir)


if __name__ == "__main__":
    main()
