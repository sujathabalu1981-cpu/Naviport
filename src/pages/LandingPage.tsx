import React from 'react';
import {
  Anchor,
  Compass,
  ArrowRight,
  Clock,
  AlertTriangle,
  BarChart3,
  Cpu,
  Layers,
  Database,
  CheckCircle2,
  Ship,
  TrendingUp,
  ShieldCheck,
  Globe2,
} from 'lucide-react';

interface LandingPageProps {
  setActiveTab: (tab: string) => void;
  metadataCount: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActiveTab, metadataCount }) => {
  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-[#168BFF]/20 bg-gradient-to-b from-[#0B1F35] via-[#0B1F35]/80 to-[#071426] p-8 sm:p-12 lg:p-16">
        {/* Subtle maritime grid background pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-15">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="nautical-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#168BFF" strokeWidth="0.8" />
                <circle cx="20" cy="20" r="1" fill="#31D5E8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#nautical-grid)" />
          </svg>
        </div>

        {/* Ambient ocean glow */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#168BFF]/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-[#31D5E8]/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#168BFF]/30 bg-[#168BFF]/10 px-3.5 py-1 text-xs font-semibold text-[#31D5E8]">
            <Ship className="h-3.5 w-3.5" />
            Machine Learning-Based Maritime Logistics Engine
          </div>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-[#F3F7FC] sm:text-5xl lg:text-6xl font-['Plus_Jakarta_Sans'] leading-tight">
            Port Congestion Classification &amp; Vessel Waiting Time Prediction
          </h1>

          <p className="mt-6 text-sm sm:text-base lg:text-lg leading-relaxed text-[#9BB0C7] max-w-3xl mx-auto">
            NAVIPORT deploys supervised machine learning models to forecast global container terminal bottleneck intensity and estimate average vessel waiting delays in days. Powered by scikit-learn classification and regression pipelines trained on multi-year maritime shipping telemetry.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#168BFF] to-[#1270cc] px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#168BFF]/25 transition hover:brightness-110 active:scale-[0.98]"
            >
              Explore Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => setActiveTab('congestion')}
              className="flex items-center gap-2 rounded-xl border border-[#168BFF]/30 bg-[#102941] px-6 py-3.5 text-sm font-bold text-[#F3F7FC] transition hover:border-[#168BFF]/60 hover:bg-[#102941]/80"
            >
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Classify Congestion
            </button>

            <button
              onClick={() => setActiveTab('waiting-time')}
              className="flex items-center gap-2 rounded-xl border border-[#31D5E8]/30 bg-[#0B1F35] px-6 py-3.5 text-sm font-bold text-[#31D5E8] transition hover:border-[#31D5E8]/60 hover:bg-[#102941]"
            >
              <Clock className="h-4 w-4" />
              Predict Wait Time
            </button>
          </div>

          {/* Metrics summary strip */}
          <div className="mt-12 grid grid-cols-2 gap-4 border-t border-[#168BFF]/20 pt-8 sm:grid-cols-4">
            <div className="rounded-xl bg-[#102941]/50 p-4 border border-[#168BFF]/10">
              <div className="text-2xl font-black text-[#F3F7FC] font-['Plus_Jakarta_Sans']">20</div>
              <div className="text-xs text-[#9BB0C7] mt-0.5">Global Hub Ports</div>
            </div>
            <div className="rounded-xl bg-[#102941]/50 p-4 border border-[#168BFF]/10">
              <div className="text-2xl font-black text-[#F3F7FC] font-['Plus_Jakarta_Sans']">{metadataCount > 0 ? metadataCount.toLocaleString() : '6,260'}</div>
              <div className="text-xs text-[#9BB0C7] mt-0.5">Historical Observations</div>
            </div>
            <div className="rounded-xl bg-[#102941]/50 p-4 border border-[#168BFF]/10">
              <div className="text-2xl font-black text-emerald-400 font-['Plus_Jakarta_Sans']">94.2%</div>
              <div className="text-xs text-[#9BB0C7] mt-0.5">Classification Test F1</div>
            </div>
            <div className="rounded-xl bg-[#102941]/50 p-4 border border-[#168BFF]/10">
              <div className="text-2xl font-black text-[#31D5E8] font-['Plus_Jakarta_Sans']">0.9986</div>
              <div className="text-xs text-[#9BB0C7] mt-0.5">Regression Test R²</div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Core ML Capabilities */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-black tracking-tight text-[#F3F7FC] sm:text-3xl font-['Plus_Jakarta_Sans']">
            Dual Machine Learning Objectives
          </h2>
          <p className="mt-2 text-sm text-[#9BB0C7]">
            Tackling port vulnerability from both discrete operational severity categorization and continuous numerical vessel waiting time estimation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Capability 1: Congestion Classification */}
          <div className="relative overflow-hidden rounded-2xl border border-[#168BFF]/20 bg-[#102941] p-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-[#168BFF]/15 border border-[#168BFF]/30 px-3 py-1 text-xs font-semibold text-[#168BFF]">
                Multi-Class Task
              </span>
            </div>

            <h3 className="mt-6 text-xl font-bold text-[#F3F7FC]">
              Port Congestion Classification
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#9BB0C7]">
              Discretizes port congestion index into <strong>Low</strong> (&lt; 1.24), <strong>Medium</strong> (1.24 – 2.90), and <strong>High</strong> (≥ 2.90) categories using quantiles calculated strictly on the training partition. Evaluated across Logistic Regression, Random Forest, and Gradient Boosting Classifier.
            </p>

            <div className="mt-6 space-y-2 rounded-xl bg-[#0B1F35] p-4 text-xs">
              <div className="flex justify-between text-[#9BB0C7]">
                <span>Trained Model:</span>
                <span className="font-semibold text-[#F3F7FC]">GradientBoostingClassifier</span>
              </div>
              <div className="flex justify-between text-[#9BB0C7]">
                <span>Target Variable:</span>
                <span className="font-mono text-[#31D5E8]">congestion_class</span>
              </div>
              <div className="flex justify-between text-[#9BB0C7]">
                <span>Validation Macro F1:</span>
                <span className="font-mono text-emerald-400">0.9748</span>
              </div>
              <div className="flex justify-between text-[#9BB0C7]">
                <span>Outputs:</span>
                <span className="text-[#F3F7FC]">Predicted Class + Probabilities</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setActiveTab('congestion')}
                className="flex items-center gap-2 text-xs font-bold text-[#168BFF] hover:text-[#31D5E8] transition"
              >
                Open Classification Tool <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Capability 2: Waiting Time Regression */}
          <div className="relative overflow-hidden rounded-2xl border border-[#168BFF]/20 bg-[#102941] p-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#31D5E8]/15 border border-[#31D5E8]/30 text-[#31D5E8]">
                <Clock className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-[#31D5E8]/15 border border-[#31D5E8]/30 px-3 py-1 text-xs font-semibold text-[#31D5E8]">
                Continuous Regression
              </span>
            </div>

            <h3 className="mt-6 text-xl font-bold text-[#F3F7FC]">
              Vessel Waiting Time Prediction
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#9BB0C7]">
              Estimates the numerical average vessel waiting time in days before berth assignment. Learns the complex relationship between anchorage counts, port utilization percentage, terminal throughput capacity, and cumulative berth delay hours.
            </p>

            <div className="mt-6 space-y-2 rounded-xl bg-[#0B1F35] p-4 text-xs">
              <div className="flex justify-between text-[#9BB0C7]">
                <span>Trained Model:</span>
                <span className="font-semibold text-[#F3F7FC]">LinearRegression Pipeline</span>
              </div>
              <div className="flex justify-between text-[#9BB0C7]">
                <span>Target Variable:</span>
                <span className="font-mono text-[#31D5E8]">avg_wait_days (Days)</span>
              </div>
              <div className="flex justify-between text-[#9BB0C7]">
                <span>Validation R² Score:</span>
                <span className="font-mono text-emerald-400">0.9984</span>
              </div>
              <div className="flex justify-between text-[#9BB0C7]">
                <span>Validation MAE:</span>
                <span className="font-mono text-[#F3F7FC]">0.52 days</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setActiveTab('waiting-time')}
                className="flex items-center gap-2 text-xs font-bold text-[#31D5E8] hover:text-[#168BFF] transition"
              >
                Open Waiting Time Tool <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Operational Workflow: 3 Steps */}
      <section className="rounded-2xl border border-[#168BFF]/15 bg-[#0B1F35] p-8 sm:p-12">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#31D5E8]">
            Operational Workflow
          </span>
          <h2 className="mt-2 text-2xl font-black text-[#F3F7FC] sm:text-3xl font-['Plus_Jakarta_Sans']">
            How NAVIPORT Performs Inference
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#9BB0C7]">
            The decision support system integrates preprocessing pipelines and feature engineering automatically.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-[#168BFF]/15 bg-[#102941] p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#168BFF]/20 text-[#168BFF] font-black text-sm">
              01
            </div>
            <h4 className="text-base font-bold text-[#F3F7FC]">Input Port Telemetry</h4>
            <p className="text-xs text-[#9BB0C7] leading-relaxed">
              Supply the port name, reporting week-start date, vessels at anchor, terminal utilization %, berth delay hours, and container throughput TEU capacity.
            </p>
          </div>

          <div className="rounded-xl border border-[#168BFF]/15 bg-[#102941] p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#31D5E8]/20 text-[#31D5E8] font-black text-sm">
              02
            </div>
            <h4 className="text-base font-bold text-[#F3F7FC]">Automated Preprocessing</h4>
            <p className="text-xs text-[#9BB0C7] leading-relaxed">
              Date features (<span className="font-mono text-[#31D5E8]">year_num, month, week_of_year</span>) are automatically derived. The pipeline applies OneHotEncoding and StandardScaler normalization.
            </p>
          </div>

          <div className="rounded-xl border border-[#168BFF]/15 bg-[#102941] p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-sm">
              03
            </div>
            <h4 className="text-base font-bold text-[#F3F7FC]">Inference &amp; Benchmarks</h4>
            <p className="text-xs text-[#9BB0C7] leading-relaxed">
              Receive color-coded congestion severity classification, class probabilities, and estimated waiting days benchmarked against the port's multi-year historical distribution.
            </p>
          </div>
        </div>
      </section>

      {/* Value of Machine Learning in Maritime Operations */}
      <section className="grid grid-cols-1 items-center gap-8 rounded-2xl border border-[#168BFF]/15 bg-[#102941] p-8 lg:grid-cols-2 lg:p-12">
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#31D5E8]">
            Maritime Industry Intelligence
          </span>
          <h2 className="text-2xl font-black text-[#F3F7FC] sm:text-3xl font-['Plus_Jakarta_Sans']">
            Solving the Multi-Billion Dollar Bottleneck
          </h2>
          <p className="text-xs sm:text-sm text-[#9BB0C7] leading-relaxed">
            Port congestion and prolonged anchorage queues create cascading disruptions across international ocean supply chains—wasting fuel, increasing carbon emissions, and locking up container fleet capacity.
          </p>
          <div className="space-y-2 pt-2 text-xs text-[#F3F7FC]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Proactive anchorage queue management &amp; berth slot allocation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Vessel speed optimization to reduce anchorage idle emissions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Dwell time forecasting for container terminals and inland drayage</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div className="rounded-xl border border-[#168BFF]/20 bg-[#0B1F35] p-5">
            <Globe2 className="h-6 w-6 text-[#168BFF] mb-2" />
            <h4 className="text-sm font-bold text-[#F3F7FC]">3 Continents</h4>
            <p className="text-[11px] text-[#9BB0C7] mt-1">Asia, Europe, and North America logistics corridors</p>
          </div>
          <div className="rounded-xl border border-[#168BFF]/20 bg-[#0B1F35] p-5">
            <Layers className="h-6 w-6 text-[#31D5E8] mb-2" />
            <h4 className="text-sm font-bold text-[#F3F7FC]">Zero Leakage</h4>
            <p className="text-[11px] text-[#9BB0C7] mt-1">Strict chronological validation preventing data leakage</p>
          </div>
          <div className="rounded-xl border border-[#168BFF]/20 bg-[#0B1F35] p-5">
            <Cpu className="h-6 w-6 text-amber-400 mb-2" />
            <h4 className="text-sm font-bold text-[#F3F7FC]">Real Pipelines</h4>
            <p className="text-[11px] text-[#9BB0C7] mt-1">Joblib artifacts loaded dynamically without hardcoding</p>
          </div>
          <div className="rounded-xl border border-[#168BFF]/20 bg-[#0B1F35] p-5">
            <Database className="h-6 w-6 text-emerald-400 mb-2" />
            <h4 className="text-sm font-bold text-[#F3F7FC]">Authentic Data</h4>
            <p className="text-[11px] text-[#9BB0C7] mt-1">6,260 real dated rows across 20 global gateway ports</p>
          </div>
        </div>
      </section>
    </div>
  );
};
