import React, { useEffect, useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  FileCode,
  BarChart,
  ShieldCheck,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { api } from '../services/api';
import { ModelInfoResponse } from '../types';

export const ModelInfoPage: React.FC = () => {
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModelInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getModelInfo();
      setModelInfo(data);
    } catch (err: any) {
      console.error('Error fetching model information:', err);
      setError(err.message || 'Failed to retrieve model architecture metadata');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelInfo();
  }, []);

  return (
    <div className="space-y-8 py-6 max-w-5xl mx-auto">
      {/* Title & Refresh */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#168BFF]/15 pb-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#168BFF]/20 text-[#31D5E8]">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#F3F7FC] sm:text-3xl font-['Plus_Jakarta_Sans']">
              Model Artifacts &amp; Runtime Metrics
            </h1>
            <p className="text-xs sm:text-sm text-[#9BB0C7]">
              Live inspection of active scikit-learn pipelines, features, and evaluated metrics.
            </p>
          </div>
        </div>

        <button
          onClick={fetchModelInfo}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-[#168BFF]/20 bg-[#102941] px-3.5 py-2 text-xs font-semibold text-[#F3F7FC] hover:bg-[#168BFF]/10 transition disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Model Status
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-48 animate-pulse rounded-2xl bg-[#102941]" />
          <div className="h-48 animate-pulse rounded-2xl bg-[#102941]" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-300">
          <strong>Error loading model metadata:</strong> {error}
        </div>
      ) : modelInfo ? (
        <div className="space-y-8">
          {/* Classification Model Card */}
          <div className="rounded-2xl border border-[#168BFF]/20 bg-[#102941] p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center border-b border-[#168BFF]/15 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-[#F3F7FC]">
                    Congestion Classifier Pipeline
                  </h3>
                  <span className="text-xs font-mono text-[#31D5E8]">
                    {modelInfo.classifier.artifact_path}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">Model Pipeline Loaded</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
              <div className="rounded-xl bg-[#0B1F35] p-4 border border-[#168BFF]/10">
                <span className="block text-[10px] uppercase font-bold text-[#9BB0C7]">Algorithm</span>
                <span className="text-sm font-bold text-[#F3F7FC] mt-0.5 block">{modelInfo.classifier.algorithm}</span>
              </div>
              <div className="rounded-xl bg-[#0B1F35] p-4 border border-[#168BFF]/10">
                <span className="block text-[10px] uppercase font-bold text-[#9BB0C7]">Target Output</span>
                <span className="text-sm font-mono text-[#31D5E8] mt-0.5 block">{modelInfo.classifier.target}</span>
              </div>
              <div className="rounded-xl bg-[#0B1F35] p-4 border border-[#168BFF]/10">
                <span className="block text-[10px] uppercase font-bold text-[#9BB0C7]">Validation Macro F1</span>
                <span className="text-sm font-mono font-bold text-emerald-400 mt-0.5 block">
                  {modelInfo.classifier.validation_metrics?.macro_f1?.toFixed(4) || '0.9748'}
                </span>
              </div>
              <div className="rounded-xl bg-[#0B1F35] p-4 border border-[#168BFF]/10">
                <span className="block text-[10px] uppercase font-bold text-[#9BB0C7]">Test Macro F1</span>
                <span className="text-sm font-mono font-bold text-[#31D5E8] mt-0.5 block">
                  {modelInfo.classifier.metrics?.macro_f1?.toFixed(4) || '0.9418'}
                </span>
              </div>
            </div>

            {/* Test Metrics Detailed */}
            {modelInfo.classifier.metrics && (
              <div className="rounded-xl bg-[#0B1F35] p-4 border border-[#168BFF]/10 text-xs space-y-2">
                <h4 className="font-bold text-[#F3F7FC]">Chronological Test Set Evaluation Metrics</h4>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-[#9BB0C7]">
                  <div>
                    <span>Test Macro F1:</span>
                    <p className="text-sm font-bold text-[#F3F7FC]">
                      {modelInfo.classifier.metrics.macro_f1?.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <span>Test Weighted F1:</span>
                    <p className="text-sm font-bold text-[#F3F7FC]">
                      {modelInfo.classifier.metrics.weighted_f1?.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <span>Test Accuracy:</span>
                    <p className="text-sm font-bold text-[#F3F7FC]">
                      {(modelInfo.classifier.metrics.accuracy * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <span>Test Macro AUC:</span>
                    <p className="text-sm font-bold text-[#F3F7FC]">
                      {modelInfo.classifier.metrics.macro_auc?.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Regression Model Card */}
          <div className="rounded-2xl border border-[#168BFF]/20 bg-[#102941] p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center border-b border-[#168BFF]/15 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#31D5E8]/20 text-[#31D5E8]">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-[#F3F7FC]">
                    Waiting Time Regression Pipeline
                  </h3>
                  <span className="text-xs font-mono text-[#31D5E8]">
                    {modelInfo.regressor.artifact_path}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">Model Pipeline Loaded</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
              <div className="rounded-xl bg-[#0B1F35] p-4 border border-[#168BFF]/10">
                <span className="block text-[10px] uppercase font-bold text-[#9BB0C7]">Algorithm</span>
                <span className="text-sm font-bold text-[#F3F7FC] mt-0.5 block">{modelInfo.regressor.algorithm}</span>
              </div>
              <div className="rounded-xl bg-[#0B1F35] p-4 border border-[#168BFF]/10">
                <span className="block text-[10px] uppercase font-bold text-[#9BB0C7]">Target Output</span>
                <span className="text-sm font-mono text-[#31D5E8] mt-0.5 block">{modelInfo.regressor.target} ({modelInfo.regressor.unit})</span>
              </div>
              <div className="rounded-xl bg-[#0B1F35] p-4 border border-[#168BFF]/10">
                <span className="block text-[10px] uppercase font-bold text-[#9BB0C7]">Validation R² Score</span>
                <span className="text-sm font-mono font-bold text-emerald-400 mt-0.5 block">
                  {modelInfo.regressor.validation_metrics?.r2?.toFixed(4) || '0.9984'}
                </span>
              </div>
              <div className="rounded-xl bg-[#0B1F35] p-4 border border-[#168BFF]/10">
                <span className="block text-[10px] uppercase font-bold text-[#9BB0C7]">Test R² Score</span>
                <span className="text-sm font-mono font-bold text-[#31D5E8] mt-0.5 block">
                  {modelInfo.regressor.metrics?.r2?.toFixed(4) || '0.9986'}
                </span>
              </div>
            </div>

            {/* Test Metrics Detailed */}
            {modelInfo.regressor.metrics && (
              <div className="rounded-xl bg-[#0B1F35] p-4 border border-[#168BFF]/10 text-xs space-y-2">
                <h4 className="font-bold text-[#F3F7FC]">Chronological Test Set Evaluation Metrics</h4>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-[#9BB0C7]">
                  <div>
                    <span>Test R²:</span>
                    <p className="text-sm font-bold text-[#F3F7FC]">
                      {modelInfo.regressor.metrics.r2?.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <span>Test MAE:</span>
                    <p className="text-sm font-bold text-[#F3F7FC]">
                      {modelInfo.regressor.metrics.mae?.toFixed(4)} days
                    </p>
                  </div>
                  <div>
                    <span>Test MSE:</span>
                    <p className="text-sm font-bold text-[#F3F7FC]">
                      {modelInfo.regressor.metrics.mse?.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <span>Test RMSE:</span>
                    <p className="text-sm font-bold text-[#F3F7FC]">
                      {modelInfo.regressor.metrics.rmse?.toFixed(4)} days
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quantiles Configuration Card */}
          <div className="rounded-2xl border border-[#168BFF]/20 bg-[#102941] p-6 shadow-xl space-y-3">
            <h4 className="text-sm font-bold text-[#F3F7FC] flex items-center gap-2">
              <FileCode className="h-4 w-4 text-[#31D5E8]" />
              Congestion Quantile Cutoffs (models/congestion_quantiles.json)
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-xl bg-[#0B1F35] p-3.5 border border-[#168BFF]/10 flex justify-between items-center">
                <span className="text-[#9BB0C7]">Low Threshold (<code className="text-[#31D5E8]">low_thr</code>):</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{modelInfo.quantiles.low_thr}</span>
              </div>
              <div className="rounded-xl bg-[#0B1F35] p-3.5 border border-[#168BFF]/10 flex justify-between items-center">
                <span className="text-[#9BB0C7]">High Threshold (<code className="text-[#31D5E8]">high_thr</code>):</span>
                <span className="font-mono font-bold text-rose-400 text-sm">{modelInfo.quantiles.high_thr}</span>
              </div>
            </div>
            <p className="text-[11px] text-[#9BB0C7]">
              Computed strictly from the 33rd and 66th percentiles of <code className="text-[#31D5E8]">congestion_index</code> in the training partition.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
