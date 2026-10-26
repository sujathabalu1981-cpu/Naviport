import React from 'react';
import {
  Info,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Cpu,
  Layers,
  Database,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface AboutPageProps {
  setActiveTab: (tab: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ setActiveTab }) => {
  return (
    <div className="space-y-12 py-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="border-b border-[#168BFF]/15 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#168BFF]/20 text-[#31D5E8]">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#F3F7FC] sm:text-3xl font-['Plus_Jakarta_Sans']">
              About NAVIPORT
            </h1>
            <p className="text-xs sm:text-sm text-[#9BB0C7]">
              Machine Learning-Based Port Congestion Classification and Vessel Waiting Time Prediction System
            </p>
          </div>
        </div>
      </div>

      {/* The Problem of Port Congestion */}
      <section className="rounded-2xl border border-[#168BFF]/15 bg-[#102941] p-8 shadow-xl space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#31D5E8]">
          Operational Background
        </span>
        <h2 className="text-xl font-bold text-[#F3F7FC] sm:text-2xl font-['Plus_Jakarta_Sans']">
          The Global Port Congestion Challenge
        </h2>
        <p className="text-xs sm:text-sm leading-relaxed text-[#9BB0C7]">
          Maritime container ports are the vital nodes of global trade, handling over 80% of international merchandise volume. When shipping volume surges or terminal operations encounter disruptions, vessels queue at outer roadstead anchorages. Prolonged waiting periods inflict severe fuel wastage, inflate greenhouse gas emissions, induce supply chain delays, and incur millions of dollars in demurrage charges.
        </p>
        <p className="text-xs sm:text-sm leading-relaxed text-[#9BB0C7]">
          Traditional port operations rely heavily on manual pilot dispatching and reactive scheduling. <strong>NAVIPORT</strong> applies supervised machine learning to deliver proactive, data-driven foresight into terminal bottleneck intensity and expected vessel delay horizons.
        </p>
      </section>

      {/* Dual Problem Formulation */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[#168BFF]/15 bg-[#0B1F35] p-6 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="h-5 w-5" />
            1. Congestion Classification Task
          </div>
          <p className="text-xs text-[#9BB0C7] leading-relaxed">
            Formulated as a 3-class classification problem. The continuous <code className="text-[#31D5E8]">congestion_index</code> is discretized into three operational severity categories using strict training-set quantile thresholds:
          </p>
          <ul className="text-xs text-[#F3F7FC] space-y-1.5 pl-2">
            <li>• <strong className="text-emerald-400">Low:</strong> Congestion index &lt; 1.24 (Fluid traffic)</li>
            <li>• <strong className="text-amber-400">Medium:</strong> 1.24 ≤ index &lt; 2.90 (Heightened queueing)</li>
            <li>• <strong className="text-rose-400">High:</strong> Congestion index ≥ 2.90 (Severe bottleneck)</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-[#168BFF]/15 bg-[#0B1F35] p-6 space-y-3">
          <div className="flex items-center gap-2 text-[#31D5E8] font-bold text-sm">
            <Clock className="h-5 w-5" />
            2. Vessel Waiting Time Regression Task
          </div>
          <p className="text-xs text-[#9BB0C7] leading-relaxed">
            Formulated as a continuous regression problem predicting <code className="text-[#31D5E8]">avg_wait_days</code> (vessel waiting duration in days). It quantifies the expected roadstead delay before berth docking, benchmarked against historical port performance.
          </p>
          <ul className="text-xs text-[#F3F7FC] space-y-1.5 pl-2">
            <li>• Target: <span className="font-mono text-[#31D5E8]">avg_wait_days</span> (Days)</li>
            <li>• Metric: R² Score, Mean Absolute Error (MAE), RMSE</li>
            <li>• Strict exclusion of classification targets to avoid leakage</li>
          </ul>
        </div>
      </section>

      {/* Candidate Algorithms & Evaluation */}
      <section className="rounded-2xl border border-[#168BFF]/15 bg-[#102941] p-8 shadow-xl space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#31D5E8]">
            Comparative Model Evaluation
          </span>
          <h2 className="text-xl font-bold text-[#F3F7FC] sm:text-2xl font-['Plus_Jakarta_Sans'] mt-1">
            Evaluated Machine Learning Algorithms
          </h2>
          <p className="text-xs sm:text-sm text-[#9BB0C7] mt-1">
            The project evaluated three candidate algorithms for each machine learning task using chronological validation:
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Classification Candidates */}
          <div className="rounded-xl bg-[#0B1F35] p-5 border border-[#168BFF]/15 space-y-3">
            <h3 className="text-sm font-bold text-[#F3F7FC] flex items-center justify-between">
              <span>Classification Candidates</span>
              <span className="text-[10px] text-[#31D5E8] font-mono">Macro F1 Selection</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="rounded-lg bg-[#102941] p-3 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-[#F3F7FC]">Logistic Regression</span>
                  <span className="block text-[10px] text-[#9BB0C7]">Linear baseline with balanced class weights</span>
                </div>
                <span className="text-[11px] font-mono text-[#9BB0C7]">F1: ~0.89</span>
              </div>
              <div className="rounded-lg bg-[#102941] p-3 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-[#F3F7FC]">Random Forest Classifier</span>
                  <span className="block text-[10px] text-[#9BB0C7]">300 estimators, balanced weights</span>
                </div>
                <span className="text-[11px] font-mono text-[#9BB0C7]">F1: ~0.94</span>
              </div>
              <div className="rounded-lg bg-[#168BFF]/15 border border-[#168BFF]/30 p-3 flex justify-between items-center">
                <div>
                  <span className="font-bold text-[#F3F7FC] flex items-center gap-1.5">
                    Gradient Boosting Classifier
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400">WINNER</span>
                  </span>
                  <span className="block text-[10px] text-[#9BB0C7]">Sequentially boosted decision tree ensembles</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-400">F1: 0.9748</span>
              </div>
            </div>
          </div>

          {/* Regression Candidates */}
          <div className="rounded-xl bg-[#0B1F35] p-5 border border-[#168BFF]/15 space-y-3">
            <h3 className="text-sm font-bold text-[#F3F7FC] flex items-center justify-between">
              <span>Regression Candidates</span>
              <span className="text-[10px] text-[#31D5E8] font-mono">R² Score Selection</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="rounded-lg bg-[#168BFF]/15 border border-[#168BFF]/30 p-3 flex justify-between items-center">
                <div>
                  <span className="font-bold text-[#F3F7FC] flex items-center gap-1.5">
                    Linear Regression
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400">WINNER</span>
                  </span>
                  <span className="block text-[10px] text-[#9BB0C7]">Fitted with StandardScaler and OneHotEncoder</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-400">R²: 0.9984</span>
              </div>
              <div className="rounded-lg bg-[#102941] p-3 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-[#F3F7FC]">Random Forest Regressor</span>
                  <span className="block text-[10px] text-[#9BB0C7]">300 decision tree regressors</span>
                </div>
                <span className="text-[11px] font-mono text-[#9BB0C7]">R²: ~0.98</span>
              </div>
              <div className="rounded-lg bg-[#102941] p-3 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-[#F3F7FC]">Gradient Boosting Regressor</span>
                  <span className="block text-[10px] text-[#9BB0C7]">Gradient boosted residuals</span>
                </div>
                <span className="text-[11px] font-mono text-[#9BB0C7]">R²: ~0.99</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Preprocessing and Temporal Feature Engineering */}
      <section className="rounded-2xl border border-[#168BFF]/15 bg-[#0B1F35] p-8 shadow-xl space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#31D5E8]">
          Preprocessing Pipeline
        </span>
        <h2 className="text-xl font-bold text-[#F3F7FC] sm:text-2xl font-['Plus_Jakarta_Sans']">
          Feature Schema and Zero-Leakage Pipeline
        </h2>
        <p className="text-xs sm:text-sm text-[#9BB0C7] leading-relaxed">
          The preprocessing engine uses scikit-learn's <code className="text-[#31D5E8]">ColumnTransformer</code>. Categorical variables (<code className="text-[#31D5E8]">port</code>, <code className="text-[#31D5E8]">country</code>, <code className="text-[#31D5E8]">region</code>) are encoded via <code className="text-[#31D5E8]">OneHotEncoder(handle_unknown="ignore")</code>, preventing breakage on unseen values. Numerical variables (<code className="text-[#31D5E8]">throughput_teu_mn</code>, <code className="text-[#31D5E8]">vessels_at_anchor</code>, <code className="text-[#31D5E8]">port_utilization_pct</code>, <code className="text-[#31D5E8]">berth_delay_hrs</code>, <code className="text-[#31D5E8]">year_num</code>, <code className="text-[#31D5E8]">month</code>, <code className="text-[#31D5E8]">week_of_year</code>) are normalized using <code className="text-[#31D5E8]">StandardScaler()</code>.
        </p>

        <div className="rounded-xl bg-[#102941] p-4 border border-[#168BFF]/15 text-xs text-[#9BB0C7] space-y-2">
          <div className="flex items-center gap-2 text-[#F3F7FC] font-semibold">
            <GitBranch className="h-4 w-4 text-[#168BFF]" />
            Chronological Split Protocol
          </div>
          <p>
            Data is strictly separated chronologically (Train: 2019-2022, Val: 2023, Test: 2024). Test data was never used during preprocessing fitting or algorithm hyperparameter selection.
          </p>
        </div>
      </section>

      {/* Decision Support Limitations */}
      <section className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
          <ShieldCheck className="h-5 w-5" />
          Intended Decision-Support Role &amp; Model Limitations
        </div>
        <p className="text-xs leading-relaxed text-[#9BB0C7]">
          NAVIPORT is designed as a decision-support system to provide early indicators of port congestion severity and vessel turnaround delays. Predictions are statistical outputs based on observed patterns in historical weekly terminal telemetry. Real-world shipping conditions remain subject to unmodeled exogenous factors including severe weather, labor strikes, geopolitical chokepoint closures, and customs clearance holds. Predictions must be utilized in conjunction with direct port authority communications.
        </p>
      </section>
    </div>
  );
};
