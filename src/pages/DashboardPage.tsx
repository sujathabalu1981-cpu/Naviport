import React, { useEffect, useState } from 'react';
import {
  Clock,
  Anchor,
  Ship,
  TrendingUp,
  Activity,
  Layers,
  ArrowRight,
  Filter,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Compass,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from 'recharts';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import {
  MetadataResponse,
  AnalyticsOverviewResponse,
  TrendItem,
} from '../types';
import { VERIFIED_PORTS } from '../data/portsData';

interface DashboardPageProps {
  setActiveTab: (tab: string) => void;
  metadata: MetadataResponse | null;
  onSelectPortForPrediction?: (port: string) => void;
}

const CLASS_COLORS: Record<string, string> = {
  Low: '#10B981',
  Medium: '#F59E0B',
  High: '#EF4444',
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  setActiveTab,
  metadata,
  onSelectPortForPrediction,
}) => {
  const [selectedPort, setSelectedPort] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [overview, setOverview] = useState<AnalyticsOverviewResponse | null>(null);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, trendsData] = await Promise.all([
        api.getOverview({
          port: selectedPort,
          region: selectedRegion,
          country: selectedCountry,
        }),
        api.getTrends({
          port: selectedPort,
          region: selectedRegion,
          country: selectedCountry,
        }),
      ]);
      setOverview(overviewData);
      setTrends(trendsData);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load telemetry data from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPort, selectedRegion, selectedCountry]);

  const handleResetFilters = () => {
    setSelectedPort('all');
    setSelectedRegion('all');
    setSelectedCountry('all');
  };

  // Sample or aggregate trends for clean chart rendering
  const sampledTrends = trends.filter((_, idx) => idx % 4 === 0 || idx === trends.length - 1);

  return (
    <div className="space-y-8 py-6">
      {/* Page Title & Operational Status Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#168BFF]/15 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-[#F3F7FC] sm:text-3xl font-['Plus_Jakarta_Sans']">
              Live Operations Deck
            </h1>
            <span className="rounded-md bg-[#168BFF]/20 px-2 py-0.5 text-xs font-semibold text-[#31D5E8]">
              Telemetry
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#9BB0C7]">
            Historical port congestion telemetry and genuine analytics based on 6,260 dated weekly records.
          </p>
        </div>

        {/* Quick Prediction Shortcut Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('congestion')}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-400 transition hover:bg-amber-500/20"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Classify Port Congestion
          </button>
          <button
            onClick={() => setActiveTab('waiting-time')}
            className="flex items-center gap-1.5 rounded-xl bg-[#168BFF] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[#168BFF]/25 transition hover:brightness-110"
          >
            <Clock className="h-3.5 w-3.5" />
            Predict Waiting Delay
          </button>
        </div>
      </div>

      {/* Interactive Filter Bar */}
      <div className="rounded-2xl border border-[#168BFF]/15 bg-[#0B1F35] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#31D5E8]">
            <Filter className="h-4 w-4" />
            Filter Operations Scope
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto">
            {/* Port Filter */}
            <div>
              <label htmlFor="dashboard-port-select" className="block text-[11px] font-medium text-[#9BB0C7] mb-1">Port</label>
              <select
                id="dashboard-port-select"
                aria-label="Filter by Port"
                value={selectedPort}
                onChange={(e) => setSelectedPort(e.target.value)}
                className="w-full sm:w-48 rounded-xl border border-[#168BFF]/20 bg-[#102941] px-3 py-2 text-xs font-medium text-[#F3F7FC] focus:border-[#31D5E8] focus:outline-none"
              >
                <option value="all">All Ports (20 Global Hubs)</option>
                {(metadata?.ports && metadata.ports.length > 0 ? metadata.ports : VERIFIED_PORTS.map((p) => p.port)).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
            <div>
              <label htmlFor="dashboard-region-select" className="block text-[11px] font-medium text-[#9BB0C7] mb-1">Region</label>
              <select
                id="dashboard-region-select"
                aria-label="Filter by Region"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full sm:w-44 rounded-xl border border-[#168BFF]/20 bg-[#102941] px-3 py-2 text-xs font-medium text-[#F3F7FC] focus:border-[#31D5E8] focus:outline-none"
              >
                <option value="all">All Regions</option>
                {(metadata?.regions && metadata.regions.length > 0 ? metadata.regions : ['Asia', 'Europe', 'NorthAmerica', 'MiddleEast']).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Country Filter */}
            <div>
              <label htmlFor="dashboard-country-select" className="block text-[11px] font-medium text-[#9BB0C7] mb-1">Country</label>
              <select
                id="dashboard-country-select"
                aria-label="Filter by Country"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full sm:w-44 rounded-xl border border-[#168BFF]/20 bg-[#102941] px-3 py-2 text-xs font-medium text-[#F3F7FC] focus:border-[#31D5E8] focus:outline-none"
              >
                <option value="all">All Countries</option>
                {(metadata?.countries && metadata.countries.length > 0 ? metadata.countries : Array.from(new Set(VERIFIED_PORTS.map((p) => p.country))).sort()).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 lg:pt-0">
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 rounded-xl border border-[#168BFF]/20 bg-[#102941] px-3 py-2 text-xs font-semibold text-[#9BB0C7] transition hover:bg-[#168BFF]/10 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Coverage explanation */}
        <div className="mt-4 flex flex-wrap items-center justify-between border-t border-[#168BFF]/10 pt-3 text-[11px] text-[#9BB0C7]">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#31D5E8]" />
            Dataset Reporting Coverage: <strong>{metadata?.date_range.min || '2019-01-07'}</strong> to <strong>{metadata?.date_range.max || '2024-12-30'}</strong>
          </span>
          <span>
            Scope: {selectedPort !== 'all' ? selectedPort : 'Global aggregate'} • {overview?.kpis?.record_count ?? 0} matching observations
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      {overview && !overview.empty ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Avg Vessel Wait Time"
            value={overview.kpis.avg_wait_days}
            unit="Days"
            subtitle={`Range: ${overview.kpis.min_wait_days}d - ${overview.kpis.max_wait_days}d`}
            icon={Clock}
            badge="Regression Target"
            badgeColor="blue"
          />
          <StatCard
            title="Avg Vessels at Anchor"
            value={overview.kpis.avg_vessels_at_anchor}
            unit="Ships"
            subtitle={`Peak anchor count: ${overview.kpis.max_vessels_at_anchor}`}
            icon={Ship}
            badge="Anchorage Queue"
            badgeColor="amber"
          />
          <StatCard
            title="Avg Terminal Utilization"
            value={`${overview.kpis.avg_utilization_pct}%`}
            subtitle="Berth & container yard occupancy"
            icon={Activity}
            badge="Yard Density"
            badgeColor="cyan"
          />
          <StatCard
            title="Avg Berth Delay"
            value={overview.kpis.avg_berth_delay_hrs}
            unit="Hours"
            subtitle={`Average port throughput: ${overview.kpis.avg_throughput_teu_mn}M TEU`}
            icon={Anchor}
            badge="Operational Lag"
            badgeColor="emerald"
          />
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-[#102941] border border-[#168BFF]/10" />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6 text-center text-sm text-amber-300">
          No records found for the selected combination of filters. Please reset filters.
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart 1: Chronological Waiting Time Trends */}
        <div className="lg:col-span-2 rounded-2xl border border-[#168BFF]/15 bg-[#102941] p-6 shadow-xl">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-[#F3F7FC]">
                Historical Waiting Time &amp; Congestion Trends
              </h3>
              <p className="text-xs text-[#9BB0C7]">
                Chronological dated weekly observations over the reporting period (2019-2024)
              </p>
            </div>
            <span className="self-start rounded bg-[#168BFF]/15 px-2 py-0.5 text-[11px] font-mono text-[#31D5E8]">
              {selectedPort !== 'all' ? selectedPort : '20-Port Aggregate'}
            </span>
          </div>

          <div className="h-72 w-full">
            {sampledTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sampledTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="waitDaysGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#168BFF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#168BFF" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="congestionGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#31D5E8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#31D5E8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#168BFF" strokeOpacity={0.1} />
                  <XAxis
                    dataKey="date"
                    stroke="#9BB0C7"
                    fontSize={11}
                    tickFormatter={(val) => val.slice(0, 7)}
                    minTickGap={40}
                  />
                  <YAxis stroke="#9BB0C7" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B1F35',
                      borderColor: 'rgba(22, 139, 255, 0.3)',
                      borderRadius: '0.75rem',
                      color: '#F3F7FC',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val} days`, 'Avg Wait']}
                  />
                  <Area
                    type="monotone"
                    dataKey="avg_wait_days"
                    stroke="#168BFF"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#waitDaysGrad)"
                    name="Wait Time (Days)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[#9BB0C7]">
                No chronological trend data available for current selection.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Congestion Class Distribution */}
        <div className="rounded-2xl border border-[#168BFF]/15 bg-[#102941] p-6 shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#F3F7FC]">
              Congestion Class Distribution
            </h3>
            <p className="text-xs text-[#9BB0C7]">
              Low (&lt;1.24) • Medium (1.24-2.90) • High (≥2.90)
            </p>
          </div>

          <div className="h-56 w-full">
            {overview?.class_distribution && overview.class_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overview.class_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {overview.class_distribution.map((entry) => (
                      <Cell key={entry.name} fill={CLASS_COLORS[entry.name] || '#168BFF'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B1F35',
                      borderColor: 'rgba(22, 139, 255, 0.3)',
                      borderRadius: '0.75rem',
                      color: '#F3F7FC',
                      fontSize: '12px',
                    }}
                    formatter={(val: any, name: any, item: any) => [
                      `${val} observations (${item.payload.percentage}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[#9BB0C7]">
                No distribution data available
              </div>
            )}
          </div>

          {/* Legend breakdown */}
          <div className="mt-2 grid grid-cols-3 gap-2 border-t border-[#168BFF]/15 pt-3">
            {overview?.class_distribution?.map((item) => (
              <div key={item.name} className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: CLASS_COLORS[item.name] }}
                  />
                  <span className="text-xs font-semibold text-[#F3F7FC]">{item.name}</span>
                </div>
                <p className="text-xs font-bold text-[#9BB0C7] mt-0.5">{item.percentage}%</p>
                <p className="text-[10px] text-[#9BB0C7]/60">{item.count} obs</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Port Comparison Table & Bar Chart */}
      <div className="rounded-2xl border border-[#168BFF]/15 bg-[#102941] p-6 shadow-xl space-y-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-bold text-[#F3F7FC]">
              Port Performance Benchmark (Average Vessel Wait Time)
            </h3>
            <p className="text-xs text-[#9BB0C7]">
              Ranked comparison across container ports in the selected scope
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          {overview?.port_comparisons && overview.port_comparisons.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={overview.port_comparisons.slice(0, 10)}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#168BFF" strokeOpacity={0.1} />
                <XAxis
                  dataKey="port"
                  stroke="#9BB0C7"
                  fontSize={10}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#9BB0C7" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B1F35',
                    borderColor: 'rgba(22, 139, 255, 0.3)',
                    borderRadius: '0.75rem',
                    color: '#F3F7FC',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} days`, 'Avg Wait']}
                />
                <Bar dataKey="avg_wait_days" fill="#168BFF" radius={[6, 6, 0, 0]} name="Avg Wait Days" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[#9BB0C7]">
              No port comparison data available.
            </div>
          )}
        </div>

        {/* Quick Launch Prediction Cards */}
        <div className="grid grid-cols-1 gap-4 pt-4 border-t border-[#168BFF]/15 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl bg-[#0B1F35] p-4 border border-[#168BFF]/15">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-amber-400" />
                <h4 className="text-sm font-bold text-[#F3F7FC]">Port Congestion Classification</h4>
              </div>
              <p className="text-xs text-[#9BB0C7] mt-1">
                Gradient Boosting Pipeline evaluated on 7 numerical &amp; 3 categorical features
              </p>
            </div>
            <button
              onClick={() => setActiveTab('congestion')}
              className="rounded-lg bg-amber-500/15 border border-amber-500/30 px-3.5 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/25 transition"
            >
              Classify
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-[#0B1F35] p-4 border border-[#168BFF]/15">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#31D5E8]" />
                <h4 className="text-sm font-bold text-[#F3F7FC]">Vessel Waiting Time Prediction</h4>
              </div>
              <p className="text-xs text-[#9BB0C7] mt-1">
                Linear Regression Pipeline achieving 0.9984 validation R²
              </p>
            </div>
            <button
              onClick={() => setActiveTab('waiting-time')}
              className="rounded-lg bg-[#31D5E8]/15 border border-[#31D5E8]/30 px-3.5 py-2 text-xs font-bold text-[#31D5E8] hover:bg-[#31D5E8]/25 transition"
            >
              Predict
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
