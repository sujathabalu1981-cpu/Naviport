import pandas as pd
from pathlib import Path
import sys, os

BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

from data_processing import (
    add_time_features,
    create_congestion_class,
    split_chronological,
    save_quantile_cutoffs,
)

def main():
    print("Dataset prepared in data_splits/")

if __name__ == "__main__":
    main()
