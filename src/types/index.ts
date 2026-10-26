export interface PredictionInput {
  port: string;
  country: string;
  region: string;
  week_start: string;
  throughput_teu_mn: number;
  vessels_at_anchor: number;
  port_utilization_pct: number;
  berth_delay_hrs: number;
  congestion_class?: 'Low' | 'Medium' | 'High';
}

export interface UserWorkflowState {
  input: PredictionInput;
  congestionResult?: CongestionPredictionResponse | null;
  waitingTimeResult?: WaitingTimePredictionResponse | null;
}

export interface CongestionPredictionResponse {
  prediction: {
    class: 'Low' | 'Medium' | 'High';
    code: number;
  };
  probabilities: Record<string, number> | null;
  model_name: string;
  model_status: string;
  feature_summary: Record<string, any>;
  thresholds: {
    low_thr: number;
    high_thr: number;
  };
}

export interface WaitingTimePredictionResponse {
  prediction: {
    avg_wait_days: number;
    is_negative: boolean;
    unit: string;
  };
  unit: string;
  model_name: string;
  model_status: string;
  feature_summary: Record<string, any>;
  historical_benchmark?: {
    historical_port_avg: number;
    historical_port_std: number;
    historical_port_min: number;
    historical_port_max: number;
    difference_from_avg: number;
    sample_records: number;
  };
}

export interface PortMetadata {
  port: string;
  country: string;
  region: string;
  avg_throughput_teu_mn: number;
  records_count: number;
}

export interface MetadataResponse {
  ports: string[];
  countries: string[];
  regions: string[];
  port_details: PortMetadata[];
  dataset_records: number;
  features: string[];
  target_classification: string;
  target_regression: string;
  date_range: {
    min: string;
    max: string;
  };
  thresholds: {
    low_thr: number;
    high_thr: number;
  };
}

export interface KPIOverview {
  record_count: number;
  avg_wait_days: number;
  max_wait_days: number;
  min_wait_days: number;
  avg_vessels_at_anchor: number;
  max_vessels_at_anchor: number;
  avg_utilization_pct: number;
  avg_berth_delay_hrs: number;
  avg_throughput_teu_mn: number;
  avg_congestion_index: number;
  date_range: {
    start: string;
    end: string;
  };
}

export interface PortComparisonItem {
  port: string;
  avg_wait_days: number;
  avg_congestion_index: number;
  avg_vessels_at_anchor: number;
  avg_utilization_pct: number;
  throughput_teu_mn: number;
  record_count: number;
}

export interface ClassDistributionItem {
  name: 'Low' | 'Medium' | 'High';
  count: number;
  percentage: number;
}

export interface AnalyticsOverviewResponse {
  empty: boolean;
  message?: string;
  kpis: KPIOverview;
  class_distribution: ClassDistributionItem[];
  port_comparisons: PortComparisonItem[];
}

export interface TrendItem {
  date: string;
  avg_wait_days: number;
  congestion_index: number;
  vessels_at_anchor: number;
  utilization_pct: number;
  berth_delay_hrs: number;
  records: number;
}

export interface HistoricalPortRecord {
  week_start: string;
  port: string;
  country: string;
  region: string;
  throughput_teu_mn: number;
  vessels_at_anchor: number;
  avg_wait_days: number;
  congestion_index: number;
  port_utilization_pct: number;
  berth_delay_hrs: number;
  congestion_class: string;
}

export interface ModelInfoResponse {
  status: string;
  classifier: {
    loaded: boolean;
    algorithm: string;
    target: string;
    classes: string[];
    metrics: Record<string, number>;
    validation_metrics: Record<string, number>;
    candidate_evaluations: Record<string, Record<string, number>>;
    artifact_path: string;
  };
  regressor: {
    loaded: boolean;
    algorithm: string;
    target: string;
    unit: string;
    metrics: Record<string, number>;
    validation_metrics: Record<string, number>;
    candidate_evaluations: Record<string, Record<string, number>>;
    artifact_path: string;
  };
  quantiles: {
    low_thr: number;
    high_thr: number;
  };
}

export interface StoredPrediction {
  id: string;
  timestamp: string;
  type: 'congestion' | 'waiting_time';
  input: PredictionInput;
  resultClass?: 'Low' | 'Medium' | 'High';
  probabilities?: Record<string, number> | null;
  resultWaitDays?: number;
  model_name: string;
}
