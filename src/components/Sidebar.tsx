import React from 'react';
import {
  LayoutDashboard,
  Compass,
  AlertTriangle,
  Clock,
  BarChart3,
  Cpu,
  Info,
  X,
  Anchor,
  Ship,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
}) => {
  const navItems = [
    { id: 'landing', label: 'Overview & Mission', icon: Compass },
    { id: 'dashboard', label: 'Live Operations Deck', icon: LayoutDashboard },
    { id: 'congestion', label: 'Congestion Classifier', icon: AlertTriangle },
    { id: 'waiting-time', label: 'Vessel Waiting Time', icon: Clock },
    { id: 'analytics', label: 'Historical Analytics', icon: BarChart3 },
    { id: 'model-info', label: 'Model Architecture', icon: Cpu },
    { id: 'about', label: 'Project Methodology', icon: Info },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative flex w-full max-w-xs flex-1 flex-col border-r border-[#168BFF]/20 bg-[#0B1F35] p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-6 border-b border-[#168BFF]/15">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#168BFF] to-[#31D5E8]">
              <Anchor className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-wider text-[#F3F7FC]">
              NAVIPORT
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#9BB0C7] hover:bg-[#102941] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#168BFF] text-white shadow-lg shadow-[#168BFF]/25'
                    : 'text-[#9BB0C7] hover:bg-[#102941] hover:text-[#F3F7FC]'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-[#31D5E8]'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-[#168BFF]/15 pt-6 text-xs text-[#9BB0C7]">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Trained ML Engine Active
          </div>
          <p className="mt-1 text-[11px] text-[#9BB0C7]/70">
            Based on 6,260 real container port observations.
          </p>
        </div>
      </div>
    </div>
  );
};
