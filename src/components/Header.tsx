import React, { useEffect, useState } from 'react';
import { Anchor, Activity, Clock, ShieldCheck, AlertCircle, History, Menu, Compass } from 'lucide-react';
import { api } from '../services/api';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenHistory: () => void;
  historyCount: number;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenHistory,
  historyCount,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const [health, setHealth] = useState<{
    status: string;
    models_loaded: boolean;
    classifier: string;
    regressor: string;
  } | null>(null);

  useEffect(() => {
    api.getHealth()
      .then(setHealth)
      .catch((err) => console.error('Health check error:', err));
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#168BFF]/20 bg-[#071426]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo & Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-[#9BB0C7] hover:bg-[#102941] hover:text-[#F3F7FC] lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-2.5 text-left transition hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#168BFF] to-[#31D5E8] shadow-lg shadow-[#168BFF]/20">
              <Anchor className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider text-[#F3F7FC] font-['Plus_Jakarta_Sans']">
                  NAVIPORT
                </span>
                <span className="hidden rounded bg-[#168BFF]/20 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-[#31D5E8] sm:inline-block">
                  ML ENGINE
                </span>
              </div>
              <p className="hidden text-[11px] text-[#9BB0C7] sm:block">
                Maritime Logistics Intelligence
              </p>
            </div>
          </button>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden items-center gap-1 rounded-xl border border-[#168BFF]/15 bg-[#0B1F35]/70 p-1.5 lg:flex">
          {[
            { id: 'landing', label: 'Overview' },
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'congestion', label: 'Classify Congestion' },
            { id: 'waiting-time', label: 'Predict Wait Time' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'model-info', label: 'Models' },
            { id: 'about', label: 'About' },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#168BFF] text-white shadow-md shadow-[#168BFF]/30'
                    : 'text-[#9BB0C7] hover:bg-[#102941] hover:text-[#F3F7FC]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Operational Status & Session History */}
        <div className="flex items-center gap-3">
          {/* Real Backend Service Indicator */}
          <div className="hidden items-center gap-2 rounded-lg border border-[#168BFF]/15 bg-[#0B1F35] px-3 py-1.5 sm:flex">
            {health?.models_loaded ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-medium text-emerald-400">
                  ML Models Online
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-[11px] font-medium text-amber-400">
                  Initializing Models...
                </span>
              </>
            )}
          </div>

          {/* Session History Trigger */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-2 rounded-lg border border-[#168BFF]/20 bg-[#102941] px-3 py-1.5 text-xs font-medium text-[#F3F7FC] transition hover:border-[#168BFF]/50 hover:bg-[#168BFF]/10"
            title="View session prediction log"
          >
            <History className="h-4 w-4 text-[#31D5E8]" />
            <span className="hidden sm:inline">Session Log</span>
            {historyCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#168BFF] text-[10px] font-bold text-white">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
