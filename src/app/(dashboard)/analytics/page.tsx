"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Line,
  Cell,
  CartesianGrid,
} from "recharts";
import PageTransition from "@/components/PageTransition";
import useAdminAnalytics from "@/hooks/useAdminAnalytics";
import { formatCurrency, formatNumber, formatPnl, cn } from "@/lib/utils";

// ── Constants ───────────────────────────────────────────────
const TABS = ["Trading", "Signals", "Revenue", "Users"] as const;
type Tab = (typeof TABS)[number];

const PERIODS = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
] as const;

const CHART_GRID = "#1a1a1a";
const CHART_TEXT = "#6b7280";
const NEON = "#39FF14";
const RED = "#ef4444";

const tooltipStyle = {
  background: "#1a1a1a",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  color: "#fff",
};

// ── Skeleton helpers ────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6 animate-pulse">
      <div className="h-3 w-20 bg-white/5 rounded mb-3" />
      <div className="h-7 w-28 bg-white/5 rounded" />
    </div>
  );
}

function SkeletonChart({ height = 320 }: { height?: number }) {
  return (
    <div
      className="bg-dark-200/60 border border-white/5 rounded-2xl p-6 animate-pulse flex items-center justify-center"
      style={{ height }}
    >
      <div className="h-full w-full bg-white/[0.02] rounded-xl" />
    </div>
  );
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6 animate-pulse space-y-3">
      <div className="h-4 w-40 bg-white/5 rounded mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-3 w-24 bg-white/5 rounded" />
          <div className="h-3 w-16 bg-white/5 rounded" />
          <div className="h-3 w-16 bg-white/5 rounded" />
          <div className="h-3 w-20 bg-white/5 rounded" />
        </div>
      ))}
    </div>
  );
}

// ── Reusable KPI Card ───────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={cn("text-2xl font-bold", color ?? "text-white")}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

// ── Error Banner ────────────────────────────────────────────
function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-center justify-between">
      <p className="text-sm text-red-400">{message}</p>
      <button
        onClick={onRetry}
        className="text-xs font-medium text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg px-3 py-1.5 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────
export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Trading");
  const [days, setDays] = useState(30);
  const [error, setError] = useState<string | null>(null);

  const {
    trading,
    signalAnalytics,
    revenue,
    userGrowth,
    revenueChart,
    loading,
    fetchTrading,
    fetchSignalAnalytics,
    fetchRevenue,
    fetchUserGrowth,
    fetchRevenueChart,
  } = useAdminAnalytics();

  const loadData = useCallback(
    async (tab: Tab, period: number) => {
      setError(null);
      try {
        switch (tab) {
          case "Trading":
            await fetchTrading(period);
            break;
          case "Signals":
            await fetchSignalAnalytics(period);
            break;
          case "Revenue":
            await Promise.all([fetchRevenue(), fetchRevenueChart(period)]);
            break;
          case "Users":
            await Promise.all([fetchRevenue(), fetchUserGrowth(period)]);
            break;
        }
      } catch {
        setError("Failed to load analytics data. Please try again.");
      }
    },
    [fetchTrading, fetchSignalAnalytics, fetchRevenue, fetchRevenueChart, fetchUserGrowth],
  );

  useEffect(() => {
    loadData(activeTab, days);
  }, [activeTab, days, loadData]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  const handlePeriodChange = (newDays: number) => {
    setDays(newDays);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
            <p className="text-sm text-gray-400 mt-1">
              Performance metrics, signals, revenue, and growth
            </p>
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-1 bg-dark-200/60 p-1 rounded-xl border border-white/5">
            {PERIODS.map((p) => (
              <button
                key={p.days}
                onClick={() => handlePeriodChange(p.days)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                  days === p.days
                    ? "bg-neon/10 text-neon"
                    : "text-gray-400 hover:text-white",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-dark-200/60 p-1 rounded-xl border border-white/5">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                activeTab === tab
                  ? "bg-neon/10 text-neon"
                  : "text-gray-400 hover:text-white",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && <ErrorBanner message={error} onRetry={() => loadData(activeTab, days)} />}

        {/* Tab content */}
        {activeTab === "Trading" && <TradingTab data={trading} loading={loading} />}
        {activeTab === "Signals" && <SignalsTab data={signalAnalytics} loading={loading} />}
        {activeTab === "Revenue" && (
          <RevenueTab revenue={revenue} chartData={revenueChart} loading={loading} />
        )}
        {activeTab === "Users" && (
          <UsersTab revenue={revenue} growthData={userGrowth} loading={loading} />
        )}
      </div>
    </PageTransition>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TAB 1: Trading Performance
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { TradingAnalytics, SignalAnalytics, RevenueAnalytics, UserGrowthPoint, RevenueChartPoint } from "@/types";

function TradingTab({
  data,
  loading,
}: {
  data: TradingAnalytics | null;
  loading: boolean;
}) {
  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonChart />
        <SkeletonChart />
        <SkeletonTable />
      </div>
    );
  }

  if (!data) return null;

  const bestPnl = formatPnl(data.best_trade);
  const worstPnl = formatPnl(data.worst_trade);
  const avgPnl = formatPnl(data.avg_pnl);

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Win Rate"
          value={`${formatNumber(data.win_rate, 1)}%`}
          color={data.win_rate >= 50 ? "text-neon" : "text-red-400"}
          sub={`Loss rate: ${formatNumber(data.loss_rate, 1)}%`}
        />
        <KpiCard
          label="Total Trades"
          value={formatNumber(data.total_trades, 0)}
        />
        <KpiCard
          label="Avg PnL"
          value={avgPnl.text}
          color={avgPnl.color}
        />
        <KpiCard
          label="Best / Worst Trade"
          value={bestPnl.text}
          sub={`Worst: ${worstPnl.text}`}
          color={bestPnl.color}
        />
      </div>

      {/* PnL by Day Chart */}
      <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">PnL by Day</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.pnl_by_day}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
              <XAxis
                dataKey="date"
                tick={{ fill: CHART_TEXT, fontSize: 12 }}
                stroke={CHART_GRID}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis tick={{ fill: CHART_TEXT, fontSize: 12 }} stroke={CHART_GRID} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [formatCurrency(value), "PnL"]}
                labelFormatter={(label) => {
                  const d = new Date(label);
                  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                }}
              />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {data.pnl_by_day.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.pnl >= 0 ? NEON : RED}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Executions by Day Chart */}
      <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Executions by Day</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.executions_by_day}>
              <defs>
                <linearGradient id="gradFilled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={NEON} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={NEON} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={RED} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={RED} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
              <XAxis
                dataKey="date"
                tick={{ fill: CHART_TEXT, fontSize: 12 }}
                stroke={CHART_GRID}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis tick={{ fill: CHART_TEXT, fontSize: 12 }} stroke={CHART_GRID} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(label) => {
                  const d = new Date(label);
                  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                }}
              />
              <Area
                type="monotone"
                dataKey="filled"
                stackId="1"
                stroke={NEON}
                fill="url(#gradFilled)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="failed"
                stackId="1"
                stroke={RED}
                fill="url(#gradFailed)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Symbols Table */}
      {data.by_symbol.length > 0 && (
        <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Performance by Symbol</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-gray-400 font-medium py-3 pr-4">Symbol</th>
                  <th className="text-right text-gray-400 font-medium py-3 px-4">Trades</th>
                  <th className="text-right text-gray-400 font-medium py-3 px-4">Wins</th>
                  <th className="text-right text-gray-400 font-medium py-3 px-4">Losses</th>
                  <th className="text-right text-gray-400 font-medium py-3 px-4">Win Rate</th>
                  <th className="text-right text-gray-400 font-medium py-3 pl-4">Total PnL</th>
                </tr>
              </thead>
              <tbody>
                {data.by_symbol.map((row) => {
                  const winRate = row.trades > 0 ? (row.wins / row.trades) * 100 : 0;
                  const pnl = formatPnl(row.total_pnl);
                  return (
                    <tr key={row.symbol} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4 font-medium text-white">{row.symbol}</td>
                      <td className="py-3 px-4 text-right text-gray-300">
                        {formatNumber(row.trades, 0)}
                      </td>
                      <td className="py-3 px-4 text-right text-neon">
                        {formatNumber(row.wins, 0)}
                      </td>
                      <td className="py-3 px-4 text-right text-red-400">
                        {formatNumber(row.losses, 0)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-300">
                        {formatNumber(winRate, 1)}%
                      </td>
                      <td className={cn("py-3 pl-4 text-right font-medium", pnl.color)}>
                        {pnl.text}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Direction Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(["buy", "sell"] as const).map((dir) => {
          const d = data.by_direction[dir];
          const winRate = d.trades > 0 ? (d.wins / d.trades) * 100 : 0;
          const pnl = formatPnl(d.pnl);
          return (
            <div
              key={dir}
              className="bg-dark-200/60 border border-white/5 rounded-2xl p-6"
            >
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
                {dir === "buy" ? "Long (Buy)" : "Short (Sell)"}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Trades</p>
                  <p className="text-lg font-bold text-white">
                    {formatNumber(d.trades, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Win Rate</p>
                  <p
                    className={cn(
                      "text-lg font-bold",
                      winRate >= 50 ? "text-neon" : "text-red-400",
                    )}
                  >
                    {formatNumber(winRate, 1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">PnL</p>
                  <p className={cn("text-lg font-bold", pnl.color)}>{pnl.text}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Strategy Type Breakdown */}
      {data.by_strategy_type.length > 0 && (
        <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">By Strategy Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.by_strategy_type.map((st) => {
              const winRate = st.trades > 0 ? (st.wins / st.trades) * 100 : 0;
              const pnl = formatPnl(st.total_pnl);
              return (
                <div key={st.strategy_type} className="space-y-1">
                  <p className="text-xs text-gray-400 capitalize">{st.strategy_type}</p>
                  <p className="text-sm font-semibold text-white">
                    {formatNumber(st.trades, 0)} trades
                  </p>
                  <p className="text-xs text-gray-400">
                    Win: {formatNumber(winRate, 1)}%
                  </p>
                  <p className={cn("text-xs font-medium", pnl.color)}>{pnl.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TAB 2: Signal Quality
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SignalsTab({
  data,
  loading,
}: {
  data: SignalAnalytics | null;
  loading: boolean;
}) {
  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonChart />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonTable />
      </div>
    );
  }

  if (!data) return null;

  const statusLabels: Array<{ key: keyof typeof data.by_status; label: string; color: string }> = [
    { key: "new", label: "New", color: "text-blue-400" },
    { key: "executing", label: "Executing", color: "text-yellow-400" },
    { key: "filled", label: "Filled", color: "text-neon" },
    { key: "expired", label: "Expired", color: "text-gray-400" },
    { key: "cancelled", label: "Cancelled", color: "text-red-400" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Signals"
          value={formatNumber(data.total_signals, 0)}
        />
        <KpiCard
          label="Accuracy Rate"
          value={`${formatNumber(data.accuracy_rate, 1)}%`}
          color={data.accuracy_rate >= 60 ? "text-neon" : data.accuracy_rate >= 40 ? "text-yellow-400" : "text-red-400"}
        />
        <KpiCard
          label="Avg Confidence"
          value={`${formatNumber(data.avg_confidence, 1)}%`}
        />
        <KpiCard
          label="Avg R:R Ratio"
          value={formatNumber(data.avg_rr_ratio, 2)}
        />
      </div>

      {/* Signals by Day Chart */}
      <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Signals by Day</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.signals_by_day}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
              <XAxis
                dataKey="date"
                tick={{ fill: CHART_TEXT, fontSize: 12 }}
                stroke={CHART_GRID}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis tick={{ fill: CHART_TEXT, fontSize: 12 }} stroke={CHART_GRID} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(label) => {
                  const d = new Date(label);
                  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                }}
              />
              <Bar dataKey="filled" stackId="a" fill={NEON} radius={[0, 0, 0, 0]} name="Filled" />
              <Bar dataKey="expired" stackId="a" fill="#6b7280" radius={[0, 0, 0, 0]} name="Expired" />
              <Bar
                dataKey="count"
                fill="transparent"
                stroke="#ffffff20"
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
                name="Total"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Breakdown Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statusLabels.map(({ key, label, color }) => (
          <div
            key={key}
            className="bg-dark-200/60 border border-white/5 rounded-2xl p-4 text-center"
          >
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={cn("text-xl font-bold", color)}>
              {formatNumber(data.by_status[key], 0)}
            </p>
          </div>
        ))}
      </div>

      {/* Signal Performance by Symbol */}
      {data.by_symbol.length > 0 && (
        <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Signal Performance by Symbol</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-gray-400 font-medium py-3 pr-4">Symbol</th>
                  <th className="text-right text-gray-400 font-medium py-3 px-4">Total</th>
                  <th className="text-right text-gray-400 font-medium py-3 px-4">Filled</th>
                  <th className="text-right text-gray-400 font-medium py-3 px-4">Expired</th>
                  <th className="text-right text-gray-400 font-medium py-3 px-4">Fill Rate</th>
                  <th className="text-right text-gray-400 font-medium py-3 pl-4">Avg Confidence</th>
                </tr>
              </thead>
              <tbody>
                {data.by_symbol.map((row) => {
                  const fillRate = row.total > 0 ? (row.filled / row.total) * 100 : 0;
                  return (
                    <tr key={row.symbol} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4 font-medium text-white">{row.symbol}</td>
                      <td className="py-3 px-4 text-right text-gray-300">
                        {formatNumber(row.total, 0)}
                      </td>
                      <td className="py-3 px-4 text-right text-neon">
                        {formatNumber(row.filled, 0)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-400">
                        {formatNumber(row.expired, 0)}
                      </td>
                      <td
                        className={cn(
                          "py-3 px-4 text-right",
                          fillRate >= 60 ? "text-neon" : "text-gray-300",
                        )}
                      >
                        {formatNumber(fillRate, 1)}%
                      </td>
                      <td className="py-3 pl-4 text-right text-gray-300">
                        {formatNumber(row.avg_confidence, 1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TAB 3: Revenue
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function RevenueTab({
  revenue,
  chartData,
  loading,
}: {
  revenue: RevenueAnalytics | null;
  chartData: RevenueChartPoint[];
  loading: boolean;
}) {
  if (loading && !revenue) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonChart />
        <SkeletonTable rows={4} />
      </div>
    );
  }

  if (!revenue) return null;

  const chartRevenue30d =
    chartData.length > 0
      ? chartData.reduce((sum, d) => sum + d.revenue_usd, 0)
      : revenue.period_revenue_usd ?? 0;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          label="Total Revenue"
          value={formatCurrency(revenue.total_revenue_usd)}
          color="text-neon"
        />
        <KpiCard
          label="Active Subscriptions"
          value={formatNumber(revenue.active_subscriptions, 0)}
        />
        <KpiCard
          label="Revenue (Period)"
          value={formatCurrency(chartRevenue30d)}
          sub={`${chartData.length} days`}
        />
      </div>

      {/* Revenue by Day Chart */}
      {chartData.length > 0 && (
        <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Revenue by Day</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={NEON} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={NEON} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: CHART_TEXT, fontSize: 12 }}
                  stroke={CHART_GRID}
                  tickFormatter={(v) => {
                    const d = new Date(v);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis tick={{ fill: CHART_TEXT, fontSize: 12 }} stroke={CHART_GRID} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number, name: string) => {
                    if (name === "revenue_usd") return [formatCurrency(value), "Revenue"];
                    return [value, "Payments"];
                  }}
                  labelFormatter={(label) => {
                    const d = new Date(label);
                    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue_usd"
                  stroke={NEON}
                  fill="url(#gradRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Revenue by Plan */}
      {revenue.revenue_by_plan.length > 0 && (
        <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Revenue by Plan</h3>
          <div className="space-y-3">
            {revenue.revenue_by_plan.map((plan) => {
              const pct =
                revenue.total_revenue_usd > 0
                  ? (plan.revenue_usd / revenue.total_revenue_usd) * 100
                  : 0;
              return (
                <div key={plan.plan_name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white font-medium">{plan.plan_name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-xs">
                        {formatNumber(plan.subscriptions, 0)} subs
                      </span>
                      <span className="text-neon font-medium">
                        {formatCurrency(plan.revenue_usd)}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neon/70 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TAB 4: User Growth
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function UsersTab({
  revenue,
  growthData,
  loading,
}: {
  revenue: RevenueAnalytics | null;
  growthData: UserGrowthPoint[];
  loading: boolean;
}) {
  if (loading && growthData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonChart height={400} />
      </div>
    );
  }

  const totalUsers = revenue?.total_users ?? (growthData.length > 0 ? growthData[growthData.length - 1].cumulative_total : 0);
  const newUsersInPeriod = growthData.reduce((sum, d) => sum + d.new_users, 0);
  const avgNewPerDay = growthData.length > 0 ? newUsersInPeriod / growthData.length : 0;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          label="Total Users"
          value={formatNumber(totalUsers, 0)}
          color="text-neon"
        />
        <KpiCard
          label="New Users (Period)"
          value={formatNumber(newUsersInPeriod, 0)}
        />
        <KpiCard
          label="Avg New / Day"
          value={formatNumber(avgNewPerDay, 1)}
        />
      </div>

      {/* User Growth Chart */}
      {growthData.length > 0 && (
        <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">User Growth</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={growthData}>
                <defs>
                  <linearGradient id="gradNewUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={NEON} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={NEON} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: CHART_TEXT, fontSize: 12 }}
                  stroke={CHART_GRID}
                  tickFormatter={(v) => {
                    const d = new Date(v);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: CHART_TEXT, fontSize: 12 }}
                  stroke={CHART_GRID}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: CHART_TEXT, fontSize: 12 }}
                  stroke={CHART_GRID}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(label) => {
                    const d = new Date(label);
                    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="new_users"
                  fill={NEON}
                  fillOpacity={0.6}
                  radius={[4, 4, 0, 0]}
                  name="New Users"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumulative_total"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                  name="Cumulative Total"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-neon/60" />
              <span className="text-xs text-gray-400">New Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-purple-500" />
              <span className="text-xs text-gray-400">Cumulative Total</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
