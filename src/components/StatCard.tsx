import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan';
  trend?: string;
  trendPositive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'blue',
  trend,
  trendPositive,
}) => {
  const badgeClasses = {
    blue: 'bg-[#168BFF]/15 text-[#168BFF] border-[#168BFF]/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    cyan: 'bg-[#31D5E8]/15 text-[#31D5E8] border-[#31D5E8]/30',
  }[badgeColor];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#168BFF]/15 bg-[#102941] p-5 shadow-lg transition-all duration-200 hover:border-[#168BFF]/40 hover:shadow-[#168BFF]/5">
      {/* Decorative gradient corner */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#168BFF]/5 blur-xl" />

      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1F35] border border-[#168BFF]/20 text-[#31D5E8]">
          <Icon className="h-5 w-5" />
        </div>
        {badge && (
          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgeClasses}`}>
            {badge}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-[#9BB0C7]">
          {title}
        </p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold tracking-tight text-[#F3F7FC] font-['Plus_Jakarta_Sans']">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-semibold text-[#9BB0C7]">{unit}</span>
          )}
        </div>
        {(subtitle || trend) && (
          <div className="mt-2 flex items-center gap-2 text-xs text-[#9BB0C7]">
            {trend && (
              <span className={`font-semibold ${trendPositive ? 'text-emerald-400' : 'text-amber-400'}`}>
                {trend}
              </span>
            )}
            {subtitle && <span className="truncate">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
