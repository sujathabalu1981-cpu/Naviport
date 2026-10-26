import React, { useState, useEffect } from 'react';
import {
  Clock,
  RotateCcw,
  Sparkles,
  Ship,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Info,
  Layers,
  ArrowRight,
  BarChart2,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import { api } from '../services/api';
import {
  MetadataResponse,
  PredictionInput,
  WaitingTimePredictionResponse,
  StoredPrediction,
  CongestionPredictionResponse,
} from '../types';
import { SearchablePortSelect } from '../components/SearchablePortSelect';
import { VERIFIED_PORTS } from '../data/portsData';

interface WaitingTimePredictionPageProps {
  metadata: MetadataResponse | null;
  onPredictionCompleted: (pred: StoredPrediction) => void;
  onProceedToAnalytics?: (
    input: PredictionInput,
    congestion: CongestionPredictionResponse | null,
    waitResult: WaitingTimePredictionResponse
  ) => void;
  onNavigateToCongestion?: () => void;
  congestionResult?: CongestionPredictionResponse | null;
  initialValues?: Partial<PredictionInput> | null;
}

export const WaitingTimePredictionPage: React.FC<WaitingTimePredictionPageProps> = ({
  metadata,
  onPredictionCompleted,
  onProceedToAnalytics,
  onNavigateToCongestion,
  congestionResult,
  initialValues,
}) => {
  const [formData, setFormData] = useState<PredictionInput>({
    port: 'Rotterdam',
    country: 'Netherlands',
    region: 'Europe',
    week_start: new Date().toISOString().slice(0, 10),
    throughput_teu_mn: 14.0,
    vessels_at_anchor: 12,
    port_utilization_pct: 90.0,
    berth_delay_hrs: 280.0,
  });

  const [congestionClass, setCongestionClass] = useState<'Low' | 'Medium' | 'High'>(
    congestionResult?.prediction.class || 'Medium'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WaitingTimePredictionResponse | null>(null);

  useEffect(() => {
    if (congestionResult?.prediction?.class) {
      setCongestionClass(congestionResult.prediction.class);
    }
  }, [congestionResult]);

  useEffect(() => {
    if (initialValues) {
      setFormData((prev) => ({
        ...prev,
        ...initialValues,
      }));
    }
  }, [initialValues]);

  const handlePortChange = (portName: string) => {
    const list = metadata?.port_details && metadata.port_details.length > 0 ? metadata.port_details : VERIFIED_PORTS;
    const detail = list.find((p) => p.port === portName);
    if (detail) {
      setFormData((prev) => ({
        ...prev,
        port: detail.port,
        country: detail.country,
        region: detail.region,
        throughput_teu_mn: detail.avg_throughput_teu_mn,
      }));
    } else {
      setFormData((prev) => ({ ...prev, port: portName }));
    }
  };

  const handlePreset = (presetName: string) => {
    if (presetName === 'los_angeles_heavy') {
      setFormData({
        port: 'Los Angeles',
        country: 'USA',
        region: 'NorthAmerica',
        week_start: '2024-05-13',
        throughput_teu_mn: 12.0,
        vessels_at_anchor: 28,
        port_utilization_pct: 98.0,
        berth_delay_hrs: 420.0,
      });
    } else if (presetName === 'hamburg_normal') {
      setFormData({
        port: 'Hamburg',
        country: 'Germany',
        region: 'Europe',
        week_start: '2024-03-11',
        throughput_teu_mn: 9.0,
        vessels_at_anchor: 8,
        port_utilization_pct: 82.0,
        berth_delay_hrs: 160.0,
      });
    } else if (presetName === 'dubai_peak') {
      setFormData({
        port: 'Dubai (Jebel Ali)',
        country: 'UAE',
        region: 'MiddleEast',
        week_start: '2024-06-17',
        throughput_teu_mn: 15.0,
        vessels_at_anchor: 22,
        port_utilization_pct: 95.0,
        berth_delay_hrs: 340.0,
      });
    }
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.predictWaitingTime({
        ...formData,
        congestion_class: congestionClass,
      });
      setResult(response);

      const stored: StoredPrediction = {
        id: `wait_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'waiting_time',
        input: { ...formData, congestion_class: congestionClass },
        resultWaitDays: response.prediction.avg_wait_days,
        model_name: response.model_name,
      };
      onPredictionCompleted(stored);
    } catch (err: any) {
      console.error('Waiting time prediction error:', err);
      setError(err.message || 'An unexpected error occurred during regression prediction.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      port: 'Rotterdam',
      country: 'Netherlands',
      region: 'Europe',
      week_start: new Date().toISOString().slice(0, 10),
      throughput_teu_mn: 14.0,
      vessels_at_anchor: 10,
      port_utilization_pct: 85.0,
      berth_delay_hrs: 200.0,
    });
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-8 py-6">
      {/* Page Header */}
      <div className="border-b border-[#168BFF]/15 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#31D5E8]/15 border border-[#31D5E8]/30 text-[#31D5E8]">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#F3F7FC] sm:text-3xl font-['Plus_Jakarta_Sans']">
              Vessel Waiting Time Regression Tool
            </h1>
            <p className="text-xs sm:text-sm text-[#9BB0C7]">
              Predict continuous average waiting time (in days) conditioned on classified port congestion severity.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Quick-Load Buttons */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-[#0B1F35] p-3 border border-[#168BFF]/15 text-xs text-[#9BB0C7]">
        <span className="font-semibold text-[#F3F7FC] flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#31D5E8]" />
          Test Presets:
        </span>
        <button
          type="button"
          onClick={() => handlePreset('los_angeles_heavy')}
          className="rounded-lg border border-[#168BFF]/20 bg-[#102941] px-3 py-1.5 text-xs text-[#F3F7FC] hover:border-[#168BFF]/50 transition cursor-pointer"
        >
          Los Angeles Congested
        </button>
        <button
          type="button"
          onClick={() => handlePreset('hamburg_normal')}
          className="rounded-lg border border-[#168BFF]/20 bg-[#102941] px-3 py-1.5 text-xs text-[#F3F7FC] hover:border-[#168BFF]/50 transition cursor-pointer"
        >
          Hamburg Standard Flow
        </button>
        <button
          type="button"
          onClick={() => handlePreset('dubai_peak')}
          className="rounded-lg border border-[#168BFF]/20 bg-[#102941] px-3 py-1.5 text-xs text-[#F3F7FC] hover:border-[#168BFF]/50 transition cursor-pointer"
        >
          Dubai Jebel Ali Busy
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Form Inputs (7 cols on lg) */}
        <div className="lg:col-span-7 rounded-2xl border border-[#168BFF]/15 bg-[#102941] p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="text-base font-bold text-[#F3F7FC] border-b border-[#168BFF]/15 pb-3">
              Vessel &amp; Terminal Parameters
            </h3>

            {/* Congestion Conditioning Selector Card */}
            <div className="rounded-xl border border-[#168BFF]/25 bg-[#0B1F35] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold text-[#F3F7FC]">
                    Conditioned on Congestion Severity
                  </span>
                </div>
                {congestionResult ? (
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    Imported from Congestion Classifier
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onNavigateToCongestion}
                    className="text-[11px] font-semibold text-[#31D5E8] hover:underline cursor-pointer"
                  >
                    Classify Congestion First →
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#9BB0C7]">
                Waiting time prediction incorporates queue delays conditioned on congestion status:
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(['Low', 'Medium', 'High'] as const).map((cls) => {
                  const isSelected = congestionClass === cls;
                  const colorClass =
                    cls === 'Low'
                      ? isSelected
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/30'
                        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      : cls === 'Medium'
                      ? isSelected
                        ? 'bg-amber-500 text-white border-amber-400 shadow-md shadow-amber-500/30'
                        : 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                      : isSelected
                      ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/30'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20';

                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setCongestionClass(cls)}
                      className={`rounded-xl border px-3 py-2 text-xs font-bold transition flex flex-col items-center gap-0.5 cursor-pointer ${colorClass}`}
                    >
                      <span>{cls} Congestion</span>
                      <span className="text-[9px] font-normal opacity-85">
                        {cls === 'Low' ? '0.75x queue' : cls === 'Medium' ? '1.05x normal' : '1.50x queue lag'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 1: Port, Country, Region */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-[#9BB0C7] mb-1.5">
                  Port Name *
                </label>
                <SearchablePortSelect
                  id="waiting-port-select"
                  value={formData.port}
                  onChange={handlePortChange}
                  availablePorts={metadata?.port_details || VERIFIED_PORTS}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9BB0C7] mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  readOnly
                  className="w-full rounded-xl border border-[#168BFF]/10 bg-[#0B1F35]/60 px-3.5 py-2.5 text-xs font-medium text-[#9BB0C7] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9BB0C7] mb-1.5">
                  Geographic Region
                </label>
                <input
                  type="text"
                  value={formData.region}
                  readOnly
                  className="w-full rounded-xl border border-[#168BFF]/10 bg-[#0B1F35]/60 px-3.5 py-2.5 text-xs font-medium text-[#9BB0C7] cursor-not-allowed"
                />
              </div>
            </div>

            {/* Row 2: Week-Start Date & Throughput Capacity */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="waiting-week-start-date" className="block text-xs font-semibold text-[#9BB0C7] mb-1.5">
                  Week-Start Date *
                </label>
                <input
                  id="waiting-week-start-date"
                  type="date"
                  value={formData.week_start}
                  onChange={(e) => setFormData({ ...formData, week_start: e.target.value })}
                  className="w-full rounded-xl border border-[#168BFF]/20 bg-[#0B1F35] px-3.5 py-2.5 text-xs font-medium text-[#F3F7FC] focus:border-[#31D5E8] focus:outline-none"
                  required
                />
                <p className="mt-1 text-[10px] text-[#9BB0C7]">
                  Calendar temporal features are automatically derived by pipeline
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9BB0C7] mb-1.5">
                  Throughput Capacity (Million TEU) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.throughput_teu_mn}
                  onChange={(e) =>
                    setFormData({ ...formData, throughput_teu_mn: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full rounded-xl border border-[#168BFF]/20 bg-[#0B1F35] px-3.5 py-2.5 text-xs font-medium text-[#F3F7FC] focus:border-[#31D5E8] focus:outline-none"
                  required
                />
                <p className="mt-1 text-[10px] text-[#9BB0C7]">
                  Verified terminal container throughput scale
                </p>
              </div>
            </div>

            {/* Row 3: Vessels at Anchor & Berth Delay */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#9BB0C7] mb-1.5">
                  Vessels at Anchor (Queue Count) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.vessels_at_anchor}
                  onChange={(e) =>
                    setFormData({ ...formData, vessels_at_anchor: parseInt(e.target.value) || 0 })
                  }
                  className="w-full rounded-xl border border-[#168BFF]/20 bg-[#0B1F35] px-3.5 py-2.5 text-xs font-medium text-[#F3F7FC] focus:border-[#31D5E8] focus:outline-none"
                  required
                />
                <p className="mt-1 text-[10px] text-[#9BB0C7]">
                  Number of vessels waiting at roadstead anchorage
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9BB0C7] mb-1.5">
                  Cumulative Berth Delay (Hours) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.berth_delay_hrs}
                  onChange={(e) =>
                    setFormData({ ...formData, berth_delay_hrs: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full rounded-xl border border-[#168BFF]/20 bg-[#0B1F35] px-3.5 py-2.5 text-xs font-medium text-[#F3F7FC] focus:border-[#31D5E8] focus:outline-none"
                  required
                />
                <p className="mt-1 text-[10px] text-[#9BB0C7]">
                  Key regression predictor for turnaround time
                </p>
              </div>
            </div>

            {/* Row 4: Port Utilization */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#9BB0C7]">
                  Port Utilization Percentage: <span className="text-[#31D5E8] font-bold">{formData.port_utilization_pct}%</span>
                </label>
                <span className="text-[11px] text-[#9BB0C7]">Normalized to 0.0-1.0 scale</span>
              </div>
              <input
                type="range"
                min="30"
                max="99"
                step="0.5"
                value={formData.port_utilization_pct}
                onChange={(e) =>
                  setFormData({ ...formData, port_utilization_pct: parseFloat(e.target.value) })
                }
                className="w-full accent-[#31D5E8] cursor-pointer"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#168BFF]/15">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-xl border border-[#168BFF]/20 px-4 py-2.5 text-xs font-semibold text-[#9BB0C7] hover:bg-[#0B1F35] hover:text-white transition disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#31D5E8] px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#168BFF]/25 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    Calculating Estimate...
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4" />
                    Predict Waiting Time
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Prediction Results Panel (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-[#168BFF]/20 bg-[#0B1F35] p-6 shadow-xl">
            <h3 className="text-base font-bold text-[#F3F7FC] border-b border-[#168BFF]/15 pb-3">
              Regression Prediction Outcome
            </h3>

            {result ? (
              <div className="mt-5 space-y-5">
                {/* Result Highlight Card */}
                <div className="rounded-2xl border border-[#31D5E8]/30 bg-gradient-to-b from-[#102941] to-[#0B1F35] p-6 text-center shadow-lg">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#9BB0C7]">
                    Estimated Average Vessel Waiting Delay
                  </span>
                  <div className="mt-3 flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-black text-[#F3F7FC] font-['Plus_Jakarta_Sans']">
                      {result.prediction.avg_wait_days}
                    </span>
                    <span className="text-lg font-bold text-[#31D5E8]">Days</span>
                  </div>
                  <p className="mt-2 text-xs text-[#9BB0C7]">
                    Statistical estimate generated by fitted Linear Regression pipeline based on terminal logistics indicators.
                  </p>
                </div>

                {/* Benchmark against genuine historical data */}
                {result.historical_benchmark && (
                  <div className="rounded-xl border border-[#168BFF]/15 bg-[#102941] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#F3F7FC] flex items-center gap-1.5">
                        <BarChart2 className="h-3.5 w-3.5 text-[#31D5E8]" />
                        Historical Port Benchmark ({formData.port})
                      </span>
                      <span className="text-[10px] text-[#9BB0C7]">
                        {result.historical_benchmark.sample_records} weekly records
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-[#071426] p-2.5">
                        <span className="block text-[10px] uppercase font-semibold text-[#9BB0C7]">Port Historical Avg</span>
                        <span className="text-sm font-bold text-[#F3F7FC]">
                          {result.historical_benchmark.historical_port_avg} days
                        </span>
                      </div>
                      <div className="rounded-lg bg-[#071426] p-2.5">
                        <span className="block text-[10px] uppercase font-semibold text-[#9BB0C7]">Historical Range</span>
                        <span className="text-sm font-bold text-[#F3F7FC]">
                          {result.historical_benchmark.historical_port_min}d - {result.historical_benchmark.historical_port_max}d
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-[#071426] p-2.5 text-xs flex justify-between items-center">
                      <span className="text-[#9BB0C7]">Variance vs Port Baseline:</span>
                      <span
                        className={`font-bold ${
                          result.historical_benchmark.difference_from_avg > 0
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {result.historical_benchmark.difference_from_avg > 0 ? '+' : ''}
                        {result.historical_benchmark.difference_from_avg} days
                      </span>
                    </div>
                  </div>
                )}

                {/* Model Details */}
                <div className="rounded-xl bg-[#102941] p-4 text-xs space-y-1.5 text-[#9BB0C7] border border-[#168BFF]/15">
                  <div className="flex justify-between">
                    <span>Algorithm:</span>
                    <span className="font-mono text-[#F3F7FC]">{result.model_name} Pipeline</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Preprocessing:</span>
                    <span className="text-[#F3F7FC]">ColumnTransformer (OneHot + Scaler)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Variable:</span>
                    <span className="font-mono text-[#31D5E8]">avg_wait_days</span>
                  </div>
                </div>

                {/* Navigation CTA: Proceed to Analytics */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      onProceedToAnalytics &&
                      onProceedToAnalytics(formData, congestionResult || null, result)
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#31D5E8] p-3 text-xs font-bold text-white shadow-xl shadow-[#168BFF]/25 hover:brightness-110 active:scale-[0.99] transition cursor-pointer"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>View Complete Analytics for {formData.port} ({result.prediction.avg_wait_days}d)</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="mt-1.5 text-center text-[10px] text-[#9BB0C7]">
                    Loads {formData.port} in Analytics and compares your scenario against multi-year port trends
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#9BB0C7]">
                <Clock className="h-10 w-10 text-[#9BB0C7]/40 mx-auto mb-2" />
                <p className="font-semibold text-[#F3F7FC]">Awaiting Telemetry Input</p>
                <p className="mt-1 max-w-xs mx-auto">
                  Submit the form to compute the estimated vessel delay using the genuine fitted regression model.
                </p>
              </div>
            )}
          </div>

          {/* Operational Advisory */}
          <div className="rounded-xl border border-[#168BFF]/15 bg-[#102941] p-4 text-xs text-[#9BB0C7] flex items-start gap-2.5">
            <Info className="h-4 w-4 text-[#31D5E8] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Notice:</strong> This prediction represents a calculated machine learning estimate and not a guaranteed vessel ETA or contractual berth arrival window.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
