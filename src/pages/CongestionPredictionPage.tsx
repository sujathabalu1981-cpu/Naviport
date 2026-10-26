import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Ship,
  CheckCircle2,
  Calendar,
  Layers,
  Activity,
  ArrowRight,
  TrendingUp,
  Info,
  Clock,
} from 'lucide-react';
import { api } from '../services/api';
import {
  MetadataResponse,
  PredictionInput,
  CongestionPredictionResponse,
  StoredPrediction,
} from '../types';
import { SearchablePortSelect } from '../components/SearchablePortSelect';
import { VERIFIED_PORTS } from '../data/portsData';

interface CongestionPredictionPageProps {
  metadata: MetadataResponse | null;
  onPredictionCompleted: (pred: StoredPrediction) => void;
  onProceedToWaitingTime?: (input: PredictionInput, result: CongestionPredictionResponse) => void;
  initialValues?: Partial<PredictionInput> | null;
}

export const CongestionPredictionPage: React.FC<CongestionPredictionPageProps> = ({
  metadata,
  onPredictionCompleted,
  onProceedToWaitingTime,
  initialValues,
}) => {
  const [formData, setFormData] = useState<PredictionInput>({
    port: 'Singapore',
    country: 'Singapore',
    region: 'Asia',
    week_start: new Date().toISOString().slice(0, 10),
    throughput_teu_mn: 40.0,
    vessels_at_anchor: 25,
    port_utilization_pct: 95.0,
    berth_delay_hrs: 620.0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CongestionPredictionResponse | null>(null);

  // Apply initialValues if passed from session history or dashboard
  useEffect(() => {
    if (initialValues) {
      setFormData((prev) => ({
        ...prev,
        ...initialValues,
      }));
    }
  }, [initialValues]);

  // When port changes, auto-populate associated country, region, and typical throughput
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
    if (presetName === 'shanghai_high') {
      setFormData({
        port: 'Shanghai',
        country: 'China',
        region: 'Asia',
        week_start: '2024-04-15',
        throughput_teu_mn: 95.0,
        vessels_at_anchor: 65,
        port_utilization_pct: 99.0,
        berth_delay_hrs: 1150.0,
      });
    } else if (presetName === 'rotterdam_med') {
      setFormData({
        port: 'Rotterdam',
        country: 'Netherlands',
        region: 'Europe',
        week_start: '2024-03-18',
        throughput_teu_mn: 14.0,
        vessels_at_anchor: 12,
        port_utilization_pct: 92.0,
        berth_delay_hrs: 245.0,
      });
    } else if (presetName === 'singapore_low') {
      setFormData({
        port: 'Singapore',
        country: 'Singapore',
        region: 'Asia',
        week_start: '2024-02-12',
        throughput_teu_mn: 40.0,
        vessels_at_anchor: 4,
        port_utilization_pct: 72.0,
        berth_delay_hrs: 360.0,
      });
    }
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.predictCongestion(formData);
      setResult(response);

      // Save to session history
      const stored: StoredPrediction = {
        id: `cong_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'congestion',
        input: { ...formData },
        resultClass: response.prediction.class,
        probabilities: response.probabilities,
        model_name: response.model_name,
      };
      onPredictionCompleted(stored);
    } catch (err: any) {
      console.error('Congestion classification error:', err);
      setError(err.message || 'An unexpected error occurred during model inference.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      port: 'Singapore',
      country: 'Singapore',
      region: 'Asia',
      week_start: new Date().toISOString().slice(0, 10),
      throughput_teu_mn: 40.0,
      vessels_at_anchor: 15,
      port_utilization_pct: 85.0,
      berth_delay_hrs: 350.0,
    });
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-8 py-6">
      {/* Page Header */}
      <div className="border-b border-[#168BFF]/15 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#F3F7FC] sm:text-3xl font-['Plus_Jakarta_Sans']">
              Port Congestion Classification Tool
            </h1>
            <p className="text-xs sm:text-sm text-[#9BB0C7]">
              Multi-class categorization into Low, Medium, or High severity using trained Gradient Boosting models.
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
          onClick={() => handlePreset('shanghai_high')}
          className="rounded-lg border border-[#168BFF]/20 bg-[#102941] px-3 py-1.5 text-xs text-[#F3F7FC] hover:border-[#168BFF]/50 transition"
        >
          Shanghai Severe Peak
        </button>
        <button
          type="button"
          onClick={() => handlePreset('rotterdam_med')}
          className="rounded-lg border border-[#168BFF]/20 bg-[#102941] px-3 py-1.5 text-xs text-[#F3F7FC] hover:border-[#168BFF]/50 transition"
        >
          Rotterdam Moderate
        </button>
        <button
          type="button"
          onClick={() => handlePreset('singapore_low')}
          className="rounded-lg border border-[#168BFF]/20 bg-[#102941] px-3 py-1.5 text-xs text-[#F3F7FC] hover:border-[#168BFF]/50 transition"
        >
          Singapore Fluid Flow
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Form Inputs (7 cols on lg) */}
        <div className="lg:col-span-7 rounded-2xl border border-[#168BFF]/15 bg-[#102941] p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="text-base font-bold text-[#F3F7FC] border-b border-[#168BFF]/15 pb-3">
              Port Logistics Parameters
            </h3>

            {/* Row 1: Port, Country, Region */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-[#9BB0C7] mb-1.5">
                  Port Name *
                </label>
                <SearchablePortSelect
                  id="port-select"
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

            {/* Row 2: Week-Start Date & Throughput TEU Capacity */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="week-start-date" className="block text-xs font-semibold text-[#9BB0C7] mb-1.5">
                  Week-Start Date *
                </label>
                <div className="relative">
                  <input
                    id="week-start-date"
                    type="date"
                    value={formData.week_start}
                    onChange={(e) => setFormData({ ...formData, week_start: e.target.value })}
                    className="w-full rounded-xl border border-[#168BFF]/20 bg-[#0B1F35] px-3.5 py-2.5 text-xs font-medium text-[#F3F7FC] focus:border-[#31D5E8] focus:outline-none"
                    required
                  />
                </div>
                <p className="mt-1 text-[10px] text-[#9BB0C7]">
                  Used to derive <span className="text-[#31D5E8] font-mono">year_num, month, week_of_year</span>
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
                  Verified scale in dataset (e.g., Shanghai=95M, Singapore=40M, NY=7M)
                </p>
              </div>
            </div>

            {/* Row 3: Vessels at Anchor & Berth Delay Hours */}
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
                  Ships waiting outside port for available berth slot
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
                  Total terminal operational delay across docked vessels
                </p>
              </div>
            </div>

            {/* Row 4: Port Terminal Yard Utilization Slider & Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#9BB0C7]">
                  Port Utilization Percentage: <span className="text-[#31D5E8] font-bold">{formData.port_utilization_pct}%</span>
                </label>
                <span className="text-[11px] text-[#9BB0C7]">Scale: 0 - 100% (Normalized in model)</span>
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
                className="w-full accent-[#168BFF] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#9BB0C7] mt-1">
                <span>30% (Low Traffic)</span>
                <span>75% (Nominal)</span>
                <span>99% (Saturated Yard)</span>
              </div>
            </div>

            {/* Actions */}
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
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#1270cc] px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#168BFF]/25 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    Executing Pipeline...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    Predict Congestion
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
              Inference Outcome
            </h3>

            {result ? (
              <div className="mt-5 space-y-5">
                {/* Result Class Badge */}
                <div
                  className={`rounded-2xl border p-6 text-center shadow-lg transition-all ${
                    result.prediction.class === 'Low'
                      ? 'border-emerald-500/40 bg-emerald-500/10 shadow-emerald-500/10'
                      : result.prediction.class === 'Medium'
                      ? 'border-amber-500/40 bg-amber-500/10 shadow-amber-500/10'
                      : 'border-rose-500/40 bg-rose-500/10 shadow-rose-500/10'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-[#9BB0C7]">
                    Predicted Congestion Severity
                  </span>
                  <div
                    className={`mt-2 text-3xl font-black font-['Plus_Jakarta_Sans'] ${
                      result.prediction.class === 'Low'
                        ? 'text-emerald-400'
                        : result.prediction.class === 'Medium'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {result.prediction.class} Congestion
                  </div>
                  <p className="mt-2 text-xs text-[#9BB0C7]">
                    {result.prediction.class === 'Low' &&
                      'Port traffic and anchorage queues remain within fluid operating boundaries. Vessel turnaround delays are minimal.'}
                    {result.prediction.class === 'Medium' &&
                      'Moderate berth occupancy and anchorage waiting. Terminal yard operations are approaching capacity.'}
                    {result.prediction.class === 'High' &&
                      'Critical bottleneck detected. Severe anchorage delays and saturated yard utilization will impact scheduled arrival windows.'}
                  </p>
                </div>

                {/* Available Probabilities */}
                {result.probabilities && (
                  <div className="space-y-2.5 rounded-xl bg-[#102941] p-4 border border-[#168BFF]/15">
                    <span className="text-xs font-bold text-[#F3F7FC]">
                      Model Probability Confidence
                    </span>
                    <div className="space-y-2 pt-1 text-xs">
                      {Object.entries(result.probabilities).map(([cls, prob]) => {
                        const pct = Math.round(prob * 100);
                        const barColor =
                          cls === 'Low'
                            ? 'bg-emerald-500'
                            : cls === 'Medium'
                            ? 'bg-amber-500'
                            : 'bg-rose-500';

                        return (
                          <div key={cls} className="space-y-1">
                            <div className="flex justify-between text-[#9BB0C7]">
                              <span>{cls} Class</span>
                              <span className="font-semibold text-[#F3F7FC]">{(prob * 100).toFixed(1)}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-[#071426] overflow-hidden">
                              <div
                                className={`h-full ${barColor} transition-all duration-500`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Threshold context */}
                <div className="rounded-xl bg-[#102941] p-4 text-xs space-y-1.5 text-[#9BB0C7] border border-[#168BFF]/15">
                  <div className="flex justify-between">
                    <span>Algorithm:</span>
                    <span className="font-mono text-[#F3F7FC]">{result.model_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Low Cutoff Threshold:</span>
                    <span className="font-mono text-emerald-400">&lt; {result.thresholds.low_thr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>High Cutoff Threshold:</span>
                    <span className="font-mono text-rose-400">≥ {result.thresholds.high_thr}</span>
                  </div>
                </div>

                {/* Navigation CTA: Proceed to Predict Waiting Time */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onProceedToWaitingTime && onProceedToWaitingTime(formData, result)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#31D5E8] p-3 text-xs font-bold text-white shadow-xl shadow-[#168BFF]/25 hover:brightness-110 active:scale-[0.99] transition cursor-pointer"
                  >
                    <Clock className="h-4 w-4" />
                    <span>Proceed to Predict Waiting Time ({result.prediction.class} Congestion)</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="mt-1.5 text-center text-[10px] text-[#9BB0C7]">
                    Transfers these telemetry inputs to condition waiting time on {result.prediction.class} severity
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#9BB0C7]">
                <AlertTriangle className="h-10 w-10 text-[#9BB0C7]/40 mx-auto mb-2" />
                <p className="font-semibold text-[#F3F7FC]">Awaiting Parameter Submission</p>
                <p className="mt-1 max-w-xs mx-auto">
                  Complete the telemetry form on the left and click <strong>Predict Congestion</strong> to run the genuine trained model pipeline.
                </p>
              </div>
            )}
          </div>

          {/* Decision Support Reminder */}
          <div className="rounded-xl border border-[#168BFF]/15 bg-[#102941] p-4 text-xs text-[#9BB0C7] flex items-start gap-2.5">
            <Info className="h-4 w-4 text-[#31D5E8] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Predictions represent statistical estimates derived from historical shipping data patterns. Always corroborate with real harbor master notices and pilotage dispatch updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
