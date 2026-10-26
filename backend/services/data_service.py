import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, Any, List, Optional

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data_splits"

class DataService:
    def __init__(self):
        self.df = None
        self.load_data()

    def load_data(self):
        try:
            train_file = DATA_DIR / "train.csv"
            val_file = DATA_DIR / "val.csv" if (DATA_DIR / "val.csv").exists() else DATA_DIR / "validation.csv"
            test_file = DATA_DIR / "test.csv"

            dfs = []
            if train_file.exists():
                t_df = pd.read_csv(train_file)
                t_df["split"] = "train"
                dfs.append(t_df)
            if val_file.exists():
                v_df = pd.read_csv(val_file)
                v_df["split"] = "val"
                dfs.append(v_df)
            if test_file.exists():
                te_df = pd.read_csv(test_file)
                te_df["split"] = "test"
                dfs.append(te_df)

            if dfs:
                self.df = pd.concat(dfs, ignore_index=True)
                self.df["week_start"] = pd.to_datetime(self.df["week_start"])
                self.df = self.df.sort_values("week_start").reset_index(drop=True)
                print(f"DataService loaded {len(self.df)} total chronological records across splits.")
            else:
                self.df = pd.DataFrame()
                print("Warning: No dataset files found in data_splits/")
        except Exception as e:
            print(f"Error loading dataset in DataService: {e}")
            self.df = pd.DataFrame()

    def filter_df(self, port: Optional[str] = None, region: Optional[str] = None,
                  country: Optional[str] = None, start_date: Optional[str] = None,
                  end_date: Optional[str] = None) -> pd.DataFrame:
        if self.df is None or self.df.empty:
            return pd.DataFrame()

        filtered = self.df.copy()
        if port and port != "all":
            filtered = filtered[filtered["port"] == port]
        if region and region != "all":
            filtered = filtered[filtered["region"] == region]
        if country and country != "all":
            filtered = filtered[filtered["country"] == country]
        if start_date:
            filtered = filtered[filtered["week_start"] >= pd.to_datetime(start_date)]
        if end_date:
            filtered = filtered[filtered["week_start"] <= pd.to_datetime(end_date)]
        return filtered

    def get_metadata(self) -> Dict[str, Any]:
        if self.df is None or self.df.empty:
            return {
                "ports": [],
                "countries": [],
                "regions": [],
                "port_details": [],
                "dataset_records": 0,
                "features": [],
                "date_range": {"min": "", "max": ""}
            }

        ports = sorted(self.df["port"].dropna().unique().tolist())
        countries = sorted(self.df["country"].dropna().unique().tolist())
        regions = sorted(self.df["region"].dropna().unique().tolist())

        port_details = []
        for p in ports:
            sub = self.df[self.df["port"] == p]
            port_details.append({
                "port": p,
                "country": str(sub["country"].iloc[0]),
                "region": str(sub["region"].iloc[0]),
                "avg_throughput_teu_mn": round(float(sub["throughput_teu_mn"].mean()), 1),
                "records_count": int(len(sub))
            })

        min_d = self.df["week_start"].min().strftime("%Y-%m-%d")
        max_d = self.df["week_start"].max().strftime("%Y-%m-%d")

        return {
            "ports": ports,
            "countries": countries,
            "regions": regions,
            "port_details": port_details,
            "dataset_records": int(len(self.df)),
            "features": [
                "port", "country", "region", "week_start", "throughput_teu_mn",
                "vessels_at_anchor", "port_utilization_pct", "berth_delay_hrs",
                "year_num", "month", "week_of_year"
            ],
            "target_classification": "congestion_class (Low, Medium, High)",
            "target_regression": "avg_wait_days (days)",
            "date_range": {"min": min_d, "max": max_d}
        }

    def get_overview(self, port: Optional[str] = None, region: Optional[str] = None,
                     country: Optional[str] = None, start_date: Optional[str] = None,
                     end_date: Optional[str] = None) -> Dict[str, Any]:
        filtered = self.filter_df(port, region, country, start_date, end_date)
        if filtered.empty:
            return {"empty": True, "message": "No records match the selected filters."}

        # Class distribution
        class_counts = filtered["congestion_class"].value_counts().to_dict()
        total_count = len(filtered)
        class_distribution = [
            {
                "name": c,
                "count": int(class_counts.get(c, 0)),
                "percentage": round(float(class_counts.get(c, 0) / total_count * 100), 1)
            }
            for c in ["Low", "Medium", "High"]
        ]

        # Port comparisons (top ports in filtered subset)
        port_group = filtered.groupby("port").agg(
            avg_wait_days=("avg_wait_days", "mean"),
            avg_congestion_index=("congestion_index", "mean"),
            avg_vessels_at_anchor=("vessels_at_anchor", "mean"),
            avg_port_utilization=("port_utilization_pct", "mean"),
            throughput_teu_mn=("throughput_teu_mn", "mean"),
            count=("week_start", "count")
        ).reset_index()

        port_comparisons = []
        for _, row in port_group.sort_values("avg_wait_days", ascending=False).iterrows():
            port_comparisons.append({
                "port": str(row["port"]),
                "avg_wait_days": round(float(row["avg_wait_days"]), 2),
                "avg_congestion_index": round(float(row["avg_congestion_index"]), 2),
                "avg_vessels_at_anchor": round(float(row["avg_vessels_at_anchor"]), 1),
                "avg_utilization_pct": round(float(row["avg_port_utilization"] * 100), 1),
                "throughput_teu_mn": round(float(row["throughput_teu_mn"]), 1),
                "record_count": int(row["count"])
            })

        # Summary KPIs
        kpis = {
            "record_count": total_count,
            "avg_wait_days": round(float(filtered["avg_wait_days"].mean()), 2),
            "max_wait_days": round(float(filtered["avg_wait_days"].max()), 2),
            "min_wait_days": round(float(filtered["avg_wait_days"].min()), 2),
            "avg_vessels_at_anchor": round(float(filtered["vessels_at_anchor"].mean()), 1),
            "max_vessels_at_anchor": int(filtered["vessels_at_anchor"].max()),
            "avg_utilization_pct": round(float(filtered["port_utilization_pct"].mean() * 100), 1),
            "avg_berth_delay_hrs": round(float(filtered["berth_delay_hrs"].mean()), 1),
            "avg_throughput_teu_mn": round(float(filtered["throughput_teu_mn"].mean()), 1),
            "avg_congestion_index": round(float(filtered["congestion_index"].mean()), 2),
            "date_range": {
                "start": filtered["week_start"].min().strftime("%Y-%m-%d"),
                "end": filtered["week_start"].max().strftime("%Y-%m-%d")
            }
        }

        return {
            "empty": False,
            "kpis": kpis,
            "class_distribution": class_distribution,
            "port_comparisons": port_comparisons
        }

    def get_trends(self, port: Optional[str] = None, region: Optional[str] = None,
                   country: Optional[str] = None, start_date: Optional[str] = None,
                   end_date: Optional[str] = None) -> List[Dict[str, Any]]:
        filtered = self.filter_df(port, region, country, start_date, end_date)
        if filtered.empty:
            return []

        # Chronological timeline aggregation by week_start
        trends = filtered.groupby(filtered["week_start"].dt.strftime("%Y-%m-%d")).agg(
            avg_wait_days=("avg_wait_days", "mean"),
            avg_congestion_index=("congestion_index", "mean"),
            avg_vessels_at_anchor=("vessels_at_anchor", "mean"),
            avg_port_utilization=("port_utilization_pct", "mean"),
            avg_berth_delay_hrs=("berth_delay_hrs", "mean"),
            records=("port", "count")
        ).reset_index()

        result = []
        for _, row in trends.iterrows():
            result.append({
                "date": str(row["week_start"]),
                "avg_wait_days": round(float(row["avg_wait_days"]), 2),
                "congestion_index": round(float(row["avg_congestion_index"]), 2),
                "vessels_at_anchor": round(float(row["avg_vessels_at_anchor"]), 1),
                "utilization_pct": round(float(row["avg_port_utilization"] * 100), 1),
                "berth_delay_hrs": round(float(row["avg_berth_delay_hrs"]), 1),
                "records": int(row["records"])
            })
        return result

    def get_recent_port_records(self, port: str, limit: int = 25) -> List[Dict[str, Any]]:
        if self.df is None or self.df.empty:
            return []
        sub = self.df[self.df["port"] == port].tail(limit)
        records = []
        for _, row in sub.iterrows():
            records.append({
                "week_start": row["week_start"].strftime("%Y-%m-%d"),
                "port": str(row["port"]),
                "country": str(row["country"]),
                "region": str(row["region"]),
                "throughput_teu_mn": float(row["throughput_teu_mn"]),
                "vessels_at_anchor": float(row["vessels_at_anchor"]),
                "avg_wait_days": float(row["avg_wait_days"]),
                "congestion_index": float(row["congestion_index"]),
                "port_utilization_pct": float(row["port_utilization_pct"]),
                "berth_delay_hrs": float(row["berth_delay_hrs"]),
                "congestion_class": str(row["congestion_class"])
            })
        return records

data_service = DataService()
