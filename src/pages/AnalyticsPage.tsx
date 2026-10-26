import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Filter,
  RotateCcw,
  Search,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  Ship,
  Anchor,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  History,
  Trash2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';
import { api } from '../services/api';
import {
  MetadataResponse,
  AnalyticsOverviewResponse,
  TrendItem,
  HistoricalPortRecord,
  UserWorkflowState,
  StoredPrediction,
} from '../types';
import { VERIFIED_PORTS, PORT_BENCHMARKS } from '../data/portsData';

interface AnalyticsPageProps {
  metadata: MetadataResponse | null;
  activeScenario?: UserWorkflowState | null;
  predictions?: StoredPrediction[];
  onModifyScenario?: (type: 'congestion' | 'waiting-time') => void;
  onClearScenario?: () => void;
  onSelectPrediction?: (pred: StoredPrediction) => void;
  onClearPredictions?: () => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  metadata,
  activeScenario,
  predictions = [],
  onModifyScenario,
  onClearScenario,
  onSelectPrediction,
  onClearPredictions,
}) => {
  const [selectedPort, setSelectedPort] = useState<string>(activeScenario?.input?.port || 'all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [overview, setOverview] = useState<AnalyticsOverviewResponse | null>(null);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [tablePort, setTablePort] = useState<string>(activeScenario?.input?.port || 'Shanghai');
  const [portRecords, setPortRecords] = useState<HistoricalPortRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // User Prediction History State
  const [historyFilter, setHistoryFilter] = useState<'all' | 'congestion' | 'waiting_time'>('all');
  const [historySearch, setHistorySearch] = useState('');

  // When activeScenario changes, automatically focus the analytics on that port
  useEffect(() => {
    if (activeScenario?.input?.port) {
      setSelectedPort(activeScenario.input.port);
      setTablePort(activeScenario.input.port);
      if (activeScenario.input.region) {
        setSelectedRegion('all');
      }
      if (activeScenario.input.country) {
        setSelectedCountry('all');
      }
    }
  }, [activeScenario]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ov, tr] = await Promise.all([
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
        setOverview(ov);
        setTrends(tr);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedPort, selectedRegion, selectedCountry]);

  useEffect(() => {
    const fetchTableRecords = async () => {
      setTableLoading(true);
      try {
        const res = await api.getPortRecords(tablePort, 50);
        setPortRecords(res.records || []);
        setPage(1);
      } catch (err) {
        console.error('Error fetching port records:', err);
      } finally {
        setTableLoading(false);
      }
    };
    fetchTableRecords();
  }, [tablePort]);

  const handleResetFilters = () => {
    setSelectedPort('all');
    setSelectedRegion('all');
    setSelectedCountry('all');
  };

  const paginatedRecords = portRecords.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(portRecords.length / pageSize) || 1;

  // Sample trends for clean line charts
  const sampledTrends = trends.filter((_, idx) => idx % 3 === 0 || idx === trends.length - 1);

  return (
    <div className="space-y-8 py-6">
      {/* Title */}
      <div className="border-b border-[#168BFF]/15 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#168BFF]/20 text-[#31D5E8]">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#F3F7FC] sm:text-3xl font-['Plus_Jakarta_Sans']">
              Maritime Historical Analytics
            </h1>
            <p className="text-xs sm:text-sm text-[#9BB0C7]">
              Exploration of 6,260 dated observations across 20 global hub ports from 2019 to 2024.
            </p>
          </div>
        </div>
      </div>

      {/* Active User Scenario Evaluation Card */}
      {activeScenario && (
        <div className="relative overflow-hidden rounded-2xl border border-[#31D5E8]/35 bg-gradient-to-b from-[#102941] to-[#0B1F35] p-6 shadow-2xl shadow-[#168BFF]/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#168BFF]/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#168BFF] to-[#31D5E8] text-white shadow-lg shadow-[#168BFF]/25 shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[#F3F7FC]">
                    Evaluated Scenario: {activeScenario.input.port}
                  </h2>
                  <span className="rounded bg-[#168BFF]/20 px-2 py-0.5 text-[11px] font-semibold text-[#31D5E8]">
                    Current Simulation
                  </span>
                </div>
                <p className="text-xs text-[#9BB0C7]">
                  {activeScenario.input.country} • {activeScenario.input.region} • Week: {activeScenario.input.week_start}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeScenario.congestionResult && (
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${
                    activeScenario.congestionResult.prediction.class === 'Low'
                      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                      : activeScenario.congestionResult.prediction.class === 'Medium'
                      ? 'border-amber-500/40 bg-amber-500/15 text-amber-400'
                      : 'border-rose-500/40 bg-rose-500/15 text-rose-400'
                  }`}
                >
                  {activeScenario.congestionResult.prediction.class} Congestion
                </span>
              )}

              {activeScenario.waitingTimeResult && (
                <span className="rounded-full border border-[#31D5E8]/40 bg-[#31D5E8]/15 px-3 py-1 text-xs font-bold text-[#31D5E8]">
                  {activeScenario.waitingTimeResult.prediction.avg_wait_days} Days Delay
                </span>
              )}

              {onClearScenario && (
                <button
                  type="button"
                  onClick={onClearScenario}
                  className="rounded-lg p-1.5 text-[#9BB0C7] hover:bg-[#102941] hover:text-white transition cursor-pointer"
                  title="Dismiss scenario banner"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* User Input vs Historical Baseline Metrics */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-[#071426]/70 p-3.5 border border-[#168BFF]/15">
              <span className="block text-[10px] uppercase font-bold text-[#9BB0C7]">Predicted Wait Delay</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-black text-[#F3F7FC]">
                  {activeScenario.waitingTimeResult ? `${activeScenario.waitingTimeResult.prediction.avg_wait_days}d` : 'Pending'}
                </span>
                {activeScenario.waitingTimeResult?.historical_benchmark && (
                  <span
                    className={`text-[11px] font-bold ${
                      activeScenario.waitingTimeResult.historical_benchmark.difference_from_avg > 0
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    ({activeScenario.waitingTimeResult.historical_benchmark.difference_from_avg > 0 ? '+' : ''}
                    {activeScenario.waitingTimeResult.historical_benchmark.difference_from_avg}d)
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#9BB0C7]/70 block mt-0.5">
                Port Baseline Avg: {activeScenario.waitingTimeResult?.historical_benchmark?.historical_port_avg || '—'}d
              </span>
            </div>

            <div className="rounded-xl bg-[#071426]/70 p-3.5 border border-[#168BFF]/15">
              <span className="block text-[10px] uppercase font-bold text-[#9BB0C7]">Anchorage Queue</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-black text-[#F3F7FC]">
                  {activeScenario.input.vessels_at_anchor}
                </span>
                <span className="text-xs text-[#9BB0C7]">ships waiting</span>
              </div>
              <span className="text-[10px] text-[#9BB0C7]/70 block mt-0.5">
                Port Baseline: ~{Math.round((activeScenario.waitingTimeResult?.historical_benchmark?.historical_port_avg || 25) * 0.45)} ships
              </span>
            </div>

            <div className="rounded-xl bg-[#071426]/70 p-3.5 border border-[#168BFF]/15">
              <span className="block text-[10px] uppercase font-bold text-[#9BB0C7]">Yard Utilization</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-black text-[#F3F7FC]">
                  {activeScenario.input.port_utilization_pct > 1
                    ? `${activeScenario.input.port_utilization_pct}%`
                    : `${(activeScenario.input.port_utilization_pct * 100).toFixed(0)}%`}
                </span>
                <span className="text-xs text-[#31D5E8]">operating level</span>
              </div>
              <span className="text-[10px] text-[#9BB0C7]/70 block mt-0.5">
                Baseline Yard Occupancy: ~92.5%
              </span>
            </div>

            <div className="rounded-xl bg-[#071426]/70 p-3.5 border border-[#168BFF]/15">
              <span className="block text-[10px] uppercase font-bold text-[#9BB0C7]">Berth Operational Delay</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-lg font-black text-[#F3F7FC]">
                  {activeScenario.input.berth_delay_hrs}
                </span>
                <span className="text-xs text-[#9BB0C7]">hours</span>
              </div>
              <span className="text-[10px] text-[#9BB0C7]/70 block mt-0.5">
                Throughput Capacity: {activeScenario.input.throughput_teu_mn}M TEU
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#168BFF]/15 pt-3">
            <span className="text-xs text-[#9BB0C7]">
              Historical charts and logbook below are filtered to <strong>{activeScenario.input.port}</strong> for direct benchmarking.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onModifyScenario && onModifyScenario('congestion')}
                className="rounded-lg border border-[#168BFF]/30 bg-[#102941] px-3 py-1.5 text-xs font-semibold text-[#F3F7FC] hover:bg-[#168BFF]/15 transition cursor-pointer"
              >
                Modify Congestion
              </button>
              <button
                type="button"
                onClick={() => onModifyScenario && onModifyScenario('waiting-time')}
                className="rounded-lg border border-[#31D5E8]/30 bg-[#31D5E8]/10 px-3 py-1.5 text-xs font-semibold text-[#31D5E8] hover:bg-[#31D5E8]/20 transition cursor-pointer"
              >
                Modify Wait Time
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="rounded-2xl border border-[#168BFF]/15 bg-[#0B1F35] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#31D5E8]">
            <Filter className="h-4 w-4" />
            Analytics Filters
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="analytics-port-select" className="block text-[11px] font-medium text-[#9BB0C7] mb-1">Port</label>
              <select
                id="analytics-port-select"
                aria-label="Filter by Port"
                value={selectedPort}
                onChange={(e) => setSelectedPort(e.target.value)}
                className="w-full sm:w-44 rounded-xl border border-[#168BFF]/20 bg-[#102941] px-3 py-2 text-xs font-medium text-[#F3F7FC] focus:border-[#31D5E8] focus:outline-none"
              >
                <option value="all">All Ports (20)</option>
                {(metadata?.ports && metadata.ports.length > 0 ? metadata.ports : VERIFIED_PORTS.map((p) => p.port)).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="analytics-region-select" className="block text-[11px] font-medium text-[#9BB0C7] mb-1">Region</label>
              <select
                id="analytics-region-select"
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

            <div>
              <label htmlFor="analytics-country-select" className="block text-[11px] font-medium text-[#9BB0C7] mb-1">Country</label>
              <select
                id="analytics-country-select"
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

          <div>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 rounded-xl border border-[#168BFF]/20 bg-[#102941] px-3.5 py-2 text-xs font-semibold text-[#9BB0C7] hover:bg-[#168BFF]/10 hover:text-white transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Anchorage Queue vs Waiting Delay */}
        <div className="rounded-2xl border border-[#168BFF]/15 bg-[#102941] p-6 shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#F3F7FC]">
              Anchorage Queue &amp; Waiting Time Dynamics
            </h3>
            <p className="text-xs text-[#9BB0C7]">
              Dual-trend observation showing correlation between ships anchored and waiting days
            </p>
          </div>

          <div className="h-72 w-full">
            {sampledTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sampledTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="avg_wait_days"
                    stroke="#168BFF"
                    strokeWidth={2}
                    dot={false}
                    name="Wait Time (Days)"
                  />
                  <Line
                    type="monotone"
                    dataKey="vessels_at_anchor"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={false}
                    name="Vessels at Anchor"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[#9BB0C7]">
                No records available for selected scope
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Yard Utilization vs Berth Delay */}
        <div className="rounded-2xl border border-[#168BFF]/15 bg-[#102941] p-6 shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-[#F3F7FC]">
              Terminal Utilization &amp; Berth Delay Lag
            </h3>
            <p className="text-xs text-[#9BB0C7]">
              Cumulative operational berth delay (hours) and yard occupancy percentage
            </p>
          </div>

          <div className="h-72 w-full">
            {sampledTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sampledTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="delayGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#31D5E8" stopOpacity={0.4} />
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
                    formatter={(val: any, name: any) => [
                      name === 'Berth Delay (Hrs)' ? `${val} hrs` : `${val}%`,
                      name,
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="berth_delay_hrs"
                    stroke="#31D5E8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#delayGrad)"
                    name="Berth Delay (Hrs)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[#9BB0C7]">
                No records available for selected scope
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historical Data Inspection Table */}
      <div className="rounded-2xl border border-[#168BFF]/15 bg-[#102941] p-6 shadow-xl space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-bold text-[#F3F7FC] flex items-center gap-2">
              <TableIcon className="h-4 w-4 text-[#31D5E8]" />
              Historical Observations Logbook
            </h3>
            <p className="text-xs text-[#9BB0C7]">
              Inspect actual weekly telemetry records for a specific port
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9BB0C7]">Port:</span>
            <select
              aria-label="Select Port for Inspection Logbook"
              value={tablePort}
              onChange={(e) => setTablePort(e.target.value)}
              className="rounded-xl border border-[#168BFF]/20 bg-[#0B1F35] px-3 py-1.5 text-xs font-semibold text-[#F3F7FC] focus:border-[#31D5E8] focus:outline-none"
            >
              {(metadata?.ports && metadata.ports.length > 0 ? metadata.ports : VERIFIED_PORTS.map((p) => p.port)).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-[#168BFF]/15 bg-[#0B1F35]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#168BFF]/20 bg-[#071426] text-[11px] font-bold uppercase tracking-wider text-[#9BB0C7]">
              <tr>
                <th className="py-3 px-4">Week Start</th>
                <th className="py-3 px-4">Port</th>
                <th className="py-3 px-4">Throughput (TEU)</th>
                <th className="py-3 px-4">At Anchor</th>
                <th className="py-3 px-4">Utilization</th>
                <th className="py-3 px-4">Berth Delay</th>
                <th className="py-3 px-4">Wait Days</th>
                <th className="py-3 px-4">Congestion Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#168BFF]/10 text-[#F3F7FC]">
              {tableLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#9BB0C7]">
                    Loading port records...
                  </td>
                </tr>
              ) : paginatedRecords.length > 0 ? (
                paginatedRecords.map((r, i) => {
                  const badgeColor =
                    r.congestion_class === 'Low'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : r.congestion_class === 'Medium'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30';

                  return (
                    <tr key={i} className="hover:bg-[#102941]/50 transition">
                      <td className="py-2.5 px-4 font-mono text-[11px] text-[#9BB0C7]">{r.week_start}</td>
                      <td className="py-2.5 px-4 font-semibold">{r.port}</td>
                      <td className="py-2.5 px-4 font-mono">{r.throughput_teu_mn}M</td>
                      <td className="py-2.5 px-4 font-mono">{r.vessels_at_anchor}</td>
                      <td className="py-2.5 px-4 font-mono">{(r.port_utilization_pct * 100).toFixed(1)}%</td>
                      <td className="py-2.5 px-4 font-mono">{r.berth_delay_hrs} hrs</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-[#31D5E8]">{r.avg_wait_days}d</td>
                      <td className="py-2.5 px-4">
                        <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${badgeColor}`}>
                          {r.congestion_class}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#9BB0C7]">
                    No historical records found for {tablePort}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-xs text-[#9BB0C7] pt-2">
          <span>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, portRecords.length)} of {portRecords.length} records
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg border border-[#168BFF]/20 px-3 py-1.5 hover:bg-[#0B1F35] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-lg border border-[#168BFF]/20 px-3 py-1.5 hover:bg-[#0B1F35] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* User Inferences & Prediction History Section */}
      <div className="rounded-2xl border border-[#168BFF]/25 bg-[#0B1F35] p-6 shadow-xl">
        <div className="flex flex-col gap-4 border-b border-[#168BFF]/15 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#168BFF]/20 text-[#31D5E8]">
              <History className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#F3F7FC]">
                  User Inferences & Prediction History
                </h3>
                <span className="rounded-full bg-[#168BFF]/20 px-2.5 py-0.5 text-xs font-semibold text-[#31D5E8]">
                  {predictions.length} Total
                </span>
              </div>
              <p className="text-xs text-[#9BB0C7]">
                Log of real-time machine learning predictions generated during this session, mapped against port benchmarks.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Buttons */}
            <div className="flex rounded-lg border border-[#168BFF]/20 bg-[#102941] p-1 text-xs">
              <button
                onClick={() => setHistoryFilter('all')}
                className={`rounded px-2.5 py-1 font-semibold transition ${
                  historyFilter === 'all'
                    ? 'bg-[#168BFF] text-white shadow'
                    : 'text-[#9BB0C7] hover:text-white'
                }`}
              >
                All ({predictions.length})
              </button>
              <button
                onClick={() => setHistoryFilter('congestion')}
                className={`rounded px-2.5 py-1 font-semibold transition ${
                  historyFilter === 'congestion'
                    ? 'bg-[#168BFF] text-white shadow'
                    : 'text-[#9BB0C7] hover:text-white'
                }`}
              >
                Congestion ({predictions.filter((p) => p.type === 'congestion').length})
              </button>
              <button
                onClick={() => setHistoryFilter('waiting_time')}
                className={`rounded px-2.5 py-1 font-semibold transition ${
                  historyFilter === 'waiting_time'
                    ? 'bg-[#168BFF] text-white shadow'
                    : 'text-[#9BB0C7] hover:text-white'
                }`}
              >
                Waiting Time ({predictions.filter((p) => p.type === 'waiting_time').length})
              </button>
            </div>

            {/* Clear Button */}
            {predictions.length > 0 && onClearPredictions && (
              <button
                onClick={onClearPredictions}
                className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20"
                title="Clear all session predictions"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear Log
              </button>
            )}
          </div>
        </div>

        {/* Prediction KPI Quick Stats (if predictions exist) */}
        {predictions.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-[#168BFF]/15 bg-[#102941]/70 p-3.5">
              <span className="block text-[10px] font-bold uppercase text-[#9BB0C7]">Inferences Executed</span>
              <span className="mt-1 block text-xl font-black text-[#F3F7FC]">{predictions.length}</span>
              <span className="text-[10px] text-[#9BB0C7]/70">In current browser session</span>
            </div>
            <div className="rounded-xl border border-[#168BFF]/15 bg-[#102941]/70 p-3.5">
              <span className="block text-[10px] font-bold uppercase text-[#9BB0C7]">High Congestion Flags</span>
              <span className="mt-1 block text-xl font-black text-rose-400">
                {predictions.filter((p) => p.type === 'congestion' && p.resultClass === 'High').length}
              </span>
              <span className="text-[10px] text-[#9BB0C7]/70">Severe bottleneck scenarios</span>
            </div>
            <div className="rounded-xl border border-[#168BFF]/15 bg-[#102941]/70 p-3.5">
              <span className="block text-[10px] font-bold uppercase text-[#9BB0C7]">Simulated Avg Delay</span>
              <span className="mt-1 block text-xl font-black text-[#31D5E8]">
                {(() => {
                  const waitPreds = predictions.filter(
                    (p) => p.type === 'waiting_time' && typeof p.resultWaitDays === 'number'
                  );
                  if (waitPreds.length === 0) return '—';
                  const avg = waitPreds.reduce((acc, p) => acc + (p.resultWaitDays || 0), 0) / waitPreds.length;
                  return `${avg.toFixed(2)}d`;
                })()}
              </span>
              <span className="text-[10px] text-[#9BB0C7]/70">Mean across wait simulations</span>
            </div>
            <div className="rounded-xl border border-[#168BFF]/15 bg-[#102941]/70 p-3.5">
              <span className="block text-[10px] font-bold uppercase text-[#9BB0C7]">Most Evaluated Port</span>
              <span className="mt-1 block text-base font-bold truncate text-[#F3F7FC]">
                {(() => {
                  if (predictions.length === 0) return '—';
                  const counts: Record<string, number> = {};
                  predictions.forEach((p) => {
                    counts[p.input.port] = (counts[p.input.port] || 0) + 1;
                  });
                  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
                })()}
              </span>
              <span className="text-[10px] text-[#9BB0C7]/70">Primary focus hub</span>
            </div>
          </div>
        )}

        {/* Search input if more than 3 predictions */}
        {predictions.length > 3 && (
          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#9BB0C7]" />
              <input
                type="text"
                placeholder="Search history by port, country, or region..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full rounded-lg border border-[#168BFF]/20 bg-[#102941] pl-9 pr-3 py-1.5 text-xs text-[#F3F7FC] placeholder-[#9BB0C7]/60 focus:border-[#31D5E8] focus:outline-none"
              />
            </div>
            {historySearch && (
              <button
                onClick={() => setHistorySearch('')}
                className="text-xs text-[#9BB0C7] hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Prediction Cards / Table */}
        <div className="mt-5">
          {predictions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#168BFF]/25 bg-[#102941]/40 py-12 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#168BFF]/15 text-[#31D5E8] mb-3">
                <History className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-[#F3F7FC]">No User Predictions Recorded Yet</h4>
              <p className="mt-1 max-w-md text-xs text-[#9BB0C7]">
                Whenever you classify congestion or predict waiting times on the model pages, your custom simulated scenarios and outcomes will appear here for side-by-side analysis.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {onModifyScenario && (
                  <>
                    <button
                      onClick={() => onModifyScenario('congestion')}
                      className="flex items-center gap-1.5 rounded-lg bg-[#168BFF] px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-[#168BFF]/90 transition"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Classify Congestion
                    </button>
                    <button
                      onClick={() => onModifyScenario('waiting-time')}
                      className="flex items-center gap-1.5 rounded-lg border border-[#31D5E8]/40 bg-[#31D5E8]/15 px-3.5 py-1.5 text-xs font-semibold text-[#31D5E8] hover:bg-[#31D5E8]/25 transition"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Predict Waiting Time
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#168BFF]/15">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#102941] text-[#9BB0C7] uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Model Type</th>
                    <th className="py-3 px-4">Port / Country</th>
                    <th className="py-3 px-4">Week Start</th>
                    <th className="py-3 px-4">Telemetry Inputs</th>
                    <th className="py-3 px-4">Prediction Outcome</th>
                    <th className="py-3 px-4">Port Benchmark</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#168BFF]/10 text-[#F3F7FC]">
                  {predictions
                    .filter((p) => {
                      if (historyFilter !== 'all' && p.type !== historyFilter) return false;
                      if (historySearch) {
                        const q = historySearch.toLowerCase();
                        return (
                          p.input.port.toLowerCase().includes(q) ||
                          p.input.country.toLowerCase().includes(q) ||
                          p.input.region.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map((p) => {
                      const isCongestion = p.type === 'congestion';
                      const benchmark = PORT_BENCHMARKS[p.input.port];
                      const histAvgWait = benchmark ? (benchmark.avg * 0.08).toFixed(2) : null;

                      let waitDiffStr: string | null = null;
                      if (!isCongestion && typeof p.resultWaitDays === 'number' && histAvgWait) {
                        const diff = p.resultWaitDays - parseFloat(histAvgWait);
                        waitDiffStr = `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}d`;
                      }

                      return (
                        <tr key={p.id} className="hover:bg-[#102941]/50 transition">
                          <td className="py-3 px-4 whitespace-nowrap">
                            {isCongestion ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-400">
                                <AlertTriangle className="h-3 w-3" />
                                Congestion
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#31D5E8]/30 bg-[#31D5E8]/10 px-2.5 py-1 text-[11px] font-bold text-[#31D5E8]">
                                <Clock className="h-3 w-3" />
                                Waiting Time
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-bold text-[#F3F7FC] block">{p.input.port}</span>
                            <span className="text-[10px] text-[#9BB0C7]">
                              {p.input.country} • {p.input.region}
                            </span>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-[#9BB0C7]">
                            {p.input.week_start}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[11px]">
                              <span className="text-[#9BB0C7]">
                                Queue: <strong className="text-[#F3F7FC]">{p.input.vessels_at_anchor}</strong>
                              </span>
                              <span className="text-[#9BB0C7]">
                                Yard: <strong className="text-[#F3F7FC]">
                                  {p.input.port_utilization_pct > 1
                                    ? `${p.input.port_utilization_pct}%`
                                    : `${(p.input.port_utilization_pct * 100).toFixed(0)}%`}
                                </strong>
                              </span>
                              <span className="text-[#9BB0C7]">
                                Delay: <strong className="text-[#F3F7FC]">{p.input.berth_delay_hrs}h</strong>
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            {isCongestion ? (
                              <span
                                className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                                  p.resultClass === 'Low'
                                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                                    : p.resultClass === 'Medium'
                                    ? 'border-amber-500/40 bg-amber-500/15 text-amber-400'
                                    : 'border-rose-500/40 bg-rose-500/15 text-rose-400'
                                }`}
                              >
                                {p.resultClass || 'Predicted'} Congestion
                              </span>
                            ) : (
                              <div className="flex items-baseline gap-1.5">
                                <span className="font-mono text-sm font-black text-[#31D5E8]">
                                  {typeof p.resultWaitDays === 'number' ? `${p.resultWaitDays} Days` : '—'}
                                </span>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap text-[11px]">
                            {histAvgWait ? (
                              <div>
                                <span className="text-[#9BB0C7]">Avg: ~{histAvgWait}d</span>
                                {waitDiffStr && (
                                  <span
                                    className={`ml-1.5 font-bold ${
                                      waitDiffStr.startsWith('+') ? 'text-amber-400' : 'text-emerald-400'
                                    }`}
                                  >
                                    ({waitDiffStr})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[#9BB0C7]/60">—</span>
                            )}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap text-[10px] text-[#9BB0C7]/80 font-mono">
                            {new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            {onSelectPrediction && (
                              <button
                                onClick={() => onSelectPrediction(p)}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#168BFF]/30 bg-[#168BFF]/10 px-2.5 py-1 text-xs font-semibold text-[#31D5E8] hover:bg-[#168BFF]/25 transition cursor-pointer"
                                title="Re-run prediction in model simulator"
                              >
                                <span>Re-simulate</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
