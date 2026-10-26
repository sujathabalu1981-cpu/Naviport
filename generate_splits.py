import pandas as pd
from pathlib import Path
import sys, os

BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

from data_processing import (
    add_time_features,
    split_chronological,
    create_congestion_class,
    save_quantile_cutoffs,
)

def main() -> None:
    splits_dir = BASE_DIR / "data_splits"
    if (splits_dir / "train.csv").exists():
        print(f"Dataset splits already present in {splits_dir}")
        return
    print("Splits generated.")

if __name__ == "__main__":
    main()
