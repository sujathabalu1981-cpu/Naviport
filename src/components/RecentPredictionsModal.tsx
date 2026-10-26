import React from 'react';
import { X, History, Trash2, Clock, AlertTriangle, ArrowRight, Ship, Calendar } from 'lucide-react';
import { StoredPrediction } from '../types';

interface RecentPredictionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  predictions: StoredPrediction[];
  onClearHistory: () => void;
  onSelectPrediction: (pred: StoredPrediction) => void;
}

export const RecentPredictionsModal: React.FC<RecentPredictionsModalProps> = ({
  isOpen,
  onClose,
  predictions,
  onClearHistory,
  onSelectPrediction,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-[#168BFF]/25 bg-[#0B1F35] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#168BFF]/15 p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#168BFF]/20 text-[#31D5E8]">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F3F7FC]">
                Session Prediction Log
              </h3>
              <p className="text-xs text-[#9BB0C7]">
                Real-time inferences executed during your current browser session
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {predictions.length > 0 && (
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-[#9BB0C7] hover:bg-[#102941] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {predictions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Ship className="h-12 w-12 text-[#9BB0C7]/40 mb-3" />
              <p className="text-sm font-semibold text-[#F3F7FC]">No inferences run yet in this session</p>
              <p className="text-xs text-[#9BB0C7] max-w-sm mt-1">
                Run a Congestion Classification or Waiting Time Prediction to see live model evaluation cards logged here.
              </p>
            </div>
          ) : (
            predictions.map((p) => {
              const isCongestion = p.type === 'congestion';
              const classBadgeColor =
                p.resultClass === 'Low'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : p.resultClass === 'Medium'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30';

              return (
                <div
                  key={p.id}
                  className="rounded-xl border border-[#168BFF]/15 bg-[#102941] p-4 transition hover:border-[#168BFF]/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      {isCongestion ? (
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#168BFF]/20 text-[#168BFF]">
                          <AlertTriangle className="h-4 w-4" />
                        </span>
                      ) : (
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#31D5E8]/20 text-[#31D5E8]">
                          <Clock className="h-4 w-4" />
                        </span>
                      )}
                      <div>
                        <span className="text-xs font-bold text-[#F3F7FC]">
                          {isCongestion ? 'Congestion Classification' : 'Waiting Time Regression'}
                        </span>
                        <span className="ml-2 text-[10px] text-[#9BB0C7]">
                          {p.timestamp}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isCongestion && p.resultClass ? (
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${classBadgeColor}`}>
                          {p.resultClass} Congestion
                        </span>
                      ) : (
                        <span className="rounded-full border border-[#168BFF]/30 bg-[#168BFF]/15 px-2.5 py-0.5 text-xs font-bold text-[#31D5E8]">
                          {p.resultWaitDays} Days Estimated
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 rounded-lg bg-[#071426]/60 p-2.5 text-[#9BB0C7]">
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-[#9BB0C7]/70">Port</span>
                      <span className="text-[#F3F7FC] font-medium">{p.input.port} ({p.input.country})</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-[#9BB0C7]/70">Anchorage</span>
                      <span className="text-[#F3F7FC] font-medium">{p.input.vessels_at_anchor} vessels</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-[#9BB0C7]/70">Utilization</span>
                      <span className="text-[#F3F7FC] font-medium">{p.input.port_utilization_pct > 1 ? `${p.input.port_utilization_pct}%` : `${(p.input.port_utilization_pct * 100).toFixed(0)}%`}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-[#9BB0C7]/70">Berth Delay</span>
                      <span className="text-[#F3F7FC] font-medium">{p.input.berth_delay_hrs} hrs</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-[#9BB0C7]">
                    <span className="font-mono">Engine: {p.model_name}</span>
                    <button
                      onClick={() => {
                        onSelectPrediction(p);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 font-semibold text-[#31D5E8] hover:underline"
                    >
                      Reload in Form <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
