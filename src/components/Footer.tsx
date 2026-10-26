import React from 'react';
import { Anchor, ShieldAlert, Cpu, Terminal, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="w-full border-t border-[#168BFF]/20 bg-[#0B1F35]/80 text-[#9BB0C7]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Col 1: System Branding */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#168BFF] to-[#31D5E8]">
                <Anchor className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-black tracking-wider text-[#F3F7FC]">
                NAVIPORT
              </span>
            </div>
            <p className="text-xs leading-relaxed">
              Machine Learning-Based Port Congestion Classification and Vessel Waiting Time Prediction System for maritime shipping logistics.
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-[#102941] px-2.5 py-1 text-[11px] font-mono text-[#31D5E8]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              v1.0.0 Production Engine
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F3F7FC]">
              Navigation
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveTab('landing')}
                  className="transition hover:text-[#31D5E8]"
                >
                  Overview & Mission
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="transition hover:text-[#31D5E8]"
                >
                  Live Operations Deck
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('congestion')}
                  className="transition hover:text-[#31D5E8]"
                >
                  Congestion Classifier
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('waiting-time')}
                  className="transition hover:text-[#31D5E8]"
                >
                  Waiting Time Regressor
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="transition hover:text-[#31D5E8]"
                >
                  Historical Analytics
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Machine Learning Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F3F7FC]">
              ML Pipeline Architecture
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <span className="text-[#31D5E8]">•</span>
                <span>Classification: GradientBoosting (Macro F1: 0.9418)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#31D5E8]">•</span>
                <span>Regression: Linear Regression (R²: 0.9986)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#31D5E8]">•</span>
                <span>Chronological 2019-2024 Split</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#31D5E8]">•</span>
                <span>Quantile Bins: Low (&lt;1.24), High (&gt;=2.90)</span>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('model-info')}
                  className="inline-flex items-center gap-1 text-[#168BFF] hover:underline"
                >
                  Inspect Model Artifacts <ArrowUpRight className="h-3 w-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Operational Limitations */}
          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#F3F7FC]">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              Decision-Support Role
            </h4>
            <p className="mt-3 text-xs leading-relaxed text-[#9BB0C7]/80">
              NAVIPORT predictions are statistical machine learning estimates trained on historical port data to assist maritime dispatchers and logistics planners. Predictions do not constitute guaranteed vessel ETAs or contractual arrival windows.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#168BFF]/15 pt-6 text-[11px] sm:flex-row">
          <p>© 2026 NAVIPORT Machine Learning Research & Operations. All models preserved from scikit-learn pipelines.</p>
          <div className="flex items-center gap-4 text-[#9BB0C7]">
            <span>FastAPI Python Engine</span>
            <span>•</span>
            <span>React & Vite</span>
            <span>•</span>
            <span>Recharts Analytics</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
