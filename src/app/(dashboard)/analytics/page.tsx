"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
  PieChart,
  Pie,
  Legend,
} from "recharts";
import PageTransition from "@/components/PageTransition";
import useAdminAnalytics from "@/hooks/useAdminAnalytics";
import { formatCurrency, formatNumber, formatPnl, cn } from "@/lib/utils";
import type { PerformanceAnalytics } from "@/types";

// ── Constants ───────────────────────────────────────────────
const TABS = ["Performance", "Trading", "Signals", "Revenue", "Users"] as const;
type Tab = (typeof TABS)[number];

const PERF_PERIODS = [
  { label: "Today", value: "today" },
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
] as const;

const LEGACY_PERIODS = [
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
] as const;

const CHART_GRID = "#1a1a1a";
const CHART_TEXT = "#6b7280";
const NEON = "#39FF14";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const BLUE = "#3b82f6";

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
    <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-5">
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

// ── Performance Tab Content ─────────────────────────────────
function PerformanceTab({
  data,
  loading,
}: {
  data: PerformanceAnalytics | null;
  loading: boolean;
}) {
  if (loading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonChart height={350} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonChart height={280} />
          <SkeletonChart height={280} />
        </div>
        <SkeletonTable rows={6} />
      </div>
    );
  }

  const pnlColor = data.total_pnl >= 0 ? "text-neon" : "text-red-400";

  // Merge daily + cumulative for composed chart
  const chartData = data.pnl_by_day.map((d, i) => ({
    date: d.date.slice(5), // "MM-DD"
    pnl: d.pnl,
    trades: d.trades_count,
    cumulative: data.cumulative_pnl_by_day[i]?.cumulative_pnl ?? 0,
  }));

  // Exchange pie data
  const exchangePie = data.by_exchange.map((ex) => ({
    name: ex.exchange === "hyperliquid" ? "HyperLiquid" : "Bybit",
    value: ex.trades,
    pnl: ex.total_pnl,
    fill: ex.exchange === "hyperliquid" ? NEON : AMBER,
  }));

  // Direction data
  const dirData = [
    {
      name: "Long (Buy)",
      trades: data.by_direction.buy.trades,
      wins: data.by_direction.buy.wins,
      pnl: data.by_direction.buy.pnl,
      winRate:
        data.by_direction.buy.trades > 0
          ? ((data.by_direction.buy.wins / data.by_direction.buy.trades) * 100).toFixed(1)
          : "0",
    },
    {
      name: "Short (Sell)",
      trades: data.by_direction.sell.trades,
      wins: data.by_direction.sell.wins,
      pnl: data.by_direction.sell.pnl,
      winRate:
        data.by_direction.sell.trades > 0
          ? ((data.by_direction.sell.wins / data.by_direction.sell.trades) * 100).toFixed(1)
          : "0",
    },
  ];

  // Funnel
  const funnel = data.signal_funnel;
  const funnelStages = [
    { label: "Generated", count: funnel.generated, color: "bg-gray-500" },
    { label: "Executed", count: funnel.executed, color: "bg-blue-500" },
    { label: "Filled", count: funnel.filled, color: "bg-amber-500" },
    { label: "Profitable", count: funnel.profitable, color: "bg-neon" },
  ];
  const maxFunnel = Math.max(funnel.generated, 1);

  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Total PnL"
          value={formatPnl(data.total_pnl).text}
          sub={`Max DD: ${formatCurrency(data.max_drawdown)}`}
          color={pnlColor}
        />
        <KpiCard
          label="Win Rate"
          value={`${data.win_rate}%`}
          sub={`${data.total_trades} trades`}
          color={data.win_rate >= 50 ? "text-neon" : "text-red-400"}
        />
        <KpiCard
          label="Profit Factor"
          value={data.profit_factor.toFixed(2)}
          sub={`Sharpe: ${data.sharpe_ratio.toFixed(2)}`}
          color={data.profit_factor >= 1 ? "text-neon" : "text-red-400"}
        />
        <KpiCard
          label="Trade Volume"
          value={formatCurrency(data.trade_volume)}
          sub={`Avg PnL: ${formatPnl(data.avg_pnl).text}`}
        />
        <KpiCard
          label="Active Users"
          value={String(data.active_users)}
          sub={`Best: ${formatPnl(data.best_trade).text}`}
        />
      </div>

      {/* PnL Chart */}
      <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Cumulative PnL & Daily Trades</h3>
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis dataKey="date" tick={{ fill: CHART_TEXT, fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fill: CHART_TEXT, fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: CHART_TEXT, fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar yAxisId="right" dataKey="pnl" name="Daily PnL" radius={[3, 3, 0, 0]} opacity={0.7}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.pnl >= 0 ? NEON : RED} />
              ))}
            </Bar>
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="cumulative"
              name="Cumulative PnL"
              stroke={BLUE}
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Exchange + Direction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Exchange Breakdown */}
        <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Exchange Breakdown</h3>
          {data.by_exchange.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No exchange data</p>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="45%" height={200}>
                <PieChart>
                  <Pie
                    data={exchangePie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {exchangePie.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    formatter={(v: string) => <span className="text-xs text-gray-400">{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {data.by_exchange.map((ex) => (
                  <div key={ex.exchange} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 capitalize">
                      {ex.exchange === "hyperliquid" ? "HyperLiquid" : "Bybit"}
                    </span>
                    <div className="text-right">
                      <p className="text-white font-medium">{ex.trades} trades</p>
                      <p className={ex.total_pnl >= 0 ? "text-neon text-xs" : "text-red-400 text-xs"}>
                        {formatPnl(ex.total_pnl).text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Direction Breakdown */}
        <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Direction Breakdown</h3>
          <div className="grid grid-cols-2 gap-4">
            {dirData.map((d) => (
              <div key={d.name} className="bg-dark-300/50 rounded-xl p-4 space-y-2">
                <p className="text-xs text-gray-400 font-medium">{d.name}</p>
                <p className="text-xl font-bold text-white">{d.trades}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Win Rate</span>
                  <span className={Number(d.winRate) >= 50 ? "text-neon" : "text-red-400"}>
                    {d.winRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">PnL</span>
                  <span className={d.pnl >= 0 ? "text-neon" : "text-red-400"}>
                    {formatPnl(d.pnl).text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Signal Funnel */}
      <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-gray-400 mb-4">
          Signal Conversion Funnel
          <span className="ml-2 text-xs text-gray-500">
            ({funnel.conversion_rate}% fill rate, {funnel.profitability_rate}% profitable)
          </span>
        </h3>
        <div className="space-y-3">
          {funnelStages.map((s) => {
            const pct = maxFunnel > 0 ? (s.count / maxFunnel) * 100 : 0;
            return (
              <div key={s.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-20 text-right">{s.label}</span>
                <div className="flex-1 bg-dark-300/50 rounded-full h-7 overflow-hidden relative">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", s.color)}
                    style={{ width: `${Math.max(pct, 2)}%`, opacity: 0.7 }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {formatNumber(s.count)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Symbols Table */}
      <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Top Performing Symbols</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-white/5">
                <th className="text-left py-2 px-3">Symbol</th>
                <th className="text-center py-2 px-3">Trades</th>
                <th className="text-center py-2 px-3">Wins</th>
                <th className="text-center py-2 px-3">Losses</th>
                <th className="text-center py-2 px-3">Win Rate</th>
                <th className="text-right py-2 px-3">Total PnL</th>
                <th className="text-right py-2 px-3">Avg PnL</th>
              </tr>
            </thead>
            <tbody>
              {data.by_symbol.slice(0, 15).map((s) => {
                const wr = s.trades > 0 ? ((s.wins / s.trades) * 100).toFixed(1) : "0";
                return (
                  <tr key={s.symbol} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-medium text-white">{s.symbol}</td>
                    <td className="py-2.5 px-3 text-center text-gray-400">{s.trades}</td>
                    <td className="py-2.5 px-3 text-center text-neon">{s.wins}</td>
                    <td className="py-2.5 px-3 text-center text-red-400">{s.losses}</td>
                    <td className="py-2.5 px-3 text-center text-gray-300">{wr}%</td>
                    <td className={cn("py-2.5 px-3 text-right font-medium", s.total_pnl >= 0 ? "text-neon" : "text-red-400")}>
                      {formatPnl(s.total_pnl).text}
                    </td>
                    <td className={cn("py-2.5 px-3 text-right", s.avg_pnl >= 0 ? "text-gray-300" : "text-red-400")}>
                      {formatPnl(s.avg_pnl).text}
                    </td>
                  </tr>
                );
              })}
              {data.by_symbol.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500 text-sm">
                    No trading data in this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Recent Trades (Last 20)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-white/5">
                <th className="text-left py-2 px-3">Time</th>
                <th className="text-left py-2 px-3">Symbol</th>
                <th className="text-center py-2 px-3">Direction</th>
                <th className="text-center py-2 px-3">Exchange</th>
                <th className="text-right py-2 px-3">Entry</th>
                <th className="text-right py-2 px-3">Exit</th>
                <th className="text-center py-2 px-3">Lev</th>
                <th className="text-right py-2 px-3">PnL</th>
                <th className="text-center py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_trades.map((t) => {
                const dt = new Date(t.created_at);
                const timeStr = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " " + dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                return (
                  <tr key={t.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 text-gray-500 text-xs">{timeStr}</td>
                    <td className="py-2.5 px-3 font-medium text-white">{t.symbol}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded", t.direction === "buy" ? "bg-neon/10 text-neon" : "bg-red-500/10 text-red-400")}>
                        {t.direction.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded", t.exchange === "bybit" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400")}>
                        {t.exchange === "bybit" ? "Bybit" : "HL"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-300 text-xs">${t.entry_price.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-right text-gray-300 text-xs">{t.exit_price ? `$${t.exit_price.toFixed(4)}` : "-"}</td>
                    <td className="py-2.5 px-3 text-center text-gray-400 text-xs">{t.leverage}x</td>
                    <td className={cn("py-2.5 px-3 text-right font-medium text-xs", t.pnl !== null ? (t.pnl >= 0 ? "text-neon" : "text-red-400") : "text-gray-500")}>
                      {t.pnl !== null ? formatPnl(t.pnl).text : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={cn("text-xs px-2 py-0.5 rounded", t.status === "filled" || t.status === "closed" ? "bg-neon/10 text-neon" : t.status === "failed" ? "bg-red-500/10 text-red-400" : "bg-gray-500/10 text-gray-400")}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {data.recent_trades.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500 text-sm">
                    No trades in this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Trading Tab (legacy) ────────────────────────────────────
function TradingTab({
  data,
  loading,
}: {
  data: ReturnType<typeof useAdminAnalytics>["trading"];
  loading: boolean;
}) {
  if (loading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonChart />
        <SkeletonTable />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Win Rate" value={`${data.win_rate}%`} color={data.win_rate >= 50 ? "text-neon" : "text-red-400"} />
        <KpiCard label="Total Trades" value={formatNumber(data.total_trades)} />
        <KpiCard label="Best Trade" value={formatPnl(data.best_trade).text} color="text-neon" />
        <KpiCard label="Worst Trade" value={formatPnl(data.worst_trade).text} color="text-red-400" />
      </div>

      {/* PnL by day */}
      <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-gray-400 mb-4">PnL by Day</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.pnl_by_day}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis dataKey="date" tick={{ fill: CHART_TEXT, fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
            <YAxis tick={{ fill: CHART_TEXT, fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="pnl" name="PnL" radius={[3, 3, 0, 0]}>
              {data.pnl_by_day.map((d, i) => (
                <Cell key={i} fill={d.pnl >= 0 ? NEON : RED} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* By Symbol */}
      <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-gray-400 mb-4">By Symbol</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-white/5">
                <th className="text-left py-2 px-3">Symbol</th>
                <th className="text-center py-2 px-3">Trades</th>
                <th className="text-center py-2 px-3">Wins</th>
                <th className="text-right py-2 px-3">PnL</th>
              </tr>
            </thead>
            <tbody>
              {data.by_symbol.map((s) => (
                <tr key={s.symbol} className="border-b border-white/[0.03]">
                  <td className="py-2 px-3 text-white">{s.symbol}</td>
                  <td className="py-2 px-3 text-center text-gray-400">{s.trades}</td>
                  <td className="py-2 px-3 text-center text-neon">{s.wins}</td>
                  <td className={cn("py-2 px-3 text-right", s.total_pnl >= 0 ? "text-neon" : "text-red-400")}>
                    {formatPnl(s.total_pnl).text}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Signals Tab (legacy) ────────────────────────────────────
function SignalsTab({
  data,
  loading,
}: {
  data: ReturnType<typeof useAdminAnalytics>["signalAnalytics"];
  loading: boolean;
}) {
  if (loading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonChart />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Signals" value={formatNumber(data.total_signals)} />
        <KpiCard label="Accuracy" value={`${data.accuracy_rate}%`} color={data.accuracy_rate >= 50 ? "text-neon" : "text-red-400"} />
        <KpiCard label="Avg Confidence" value={`${(data.avg_confidence * 100).toFixed(1)}%`} />
        <KpiCard label="Avg R:R" value={data.avg_rr_ratio.toFixed(2)} />
      </div>

      {/* Status breakdown */}
      <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Status Breakdown</h3>
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(data.by_status).map(([key, val]) => (
            <div key={key} className="bg-dark-300/50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 uppercase">{key}</p>
              <p className="text-lg font-bold text-white">{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Signals by day */}
      <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Signals by Day</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.signals_by_day}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis dataKey="date" tick={{ fill: CHART_TEXT, fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
            <YAxis tick={{ fill: CHART_TEXT, fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" name="Total" fill={BLUE} radius={[3, 3, 0, 0]} />
            <Bar dataKey="filled" name="Filled" fill={NEON} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Revenue Tab (legacy) ────────────────────────────────────
function RevenueTab({
  revenue,
  chart,
  loading,
}: {
  revenue: ReturnType<typeof useAdminAnalytics>["revenue"];
  chart: ReturnType<typeof useAdminAnalytics>["revenueChart"];
  loading: boolean;
}) {
  if (loading || !revenue) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonChart />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard label="Total Revenue" value={formatCurrency(revenue.total_revenue_usd)} color="text-neon" />
        <KpiCard label="Active Subs" value={formatNumber(revenue.active_subscriptions)} />
        <KpiCard label="Total Users" value={formatNumber(revenue.total_users)} />
      </div>

      {chart.length > 0 && (
        <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
              <XAxis dataKey="date" tick={{ fill: CHART_TEXT, fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
              <YAxis tick={{ fill: CHART_TEXT, fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="revenue_usd" name="Revenue ($)" fill={NEON} fillOpacity={0.1} stroke={NEON} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ── Users Tab (legacy) ──────────────────────────────────────
function UsersTab({
  chart,
  loading,
}: {
  chart: ReturnType<typeof useAdminAnalytics>["userGrowth"];
  loading: boolean;
}) {
  if (loading || chart.length === 0) {
    return <SkeletonChart />;
  }

  return (
    <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
      <h3 className="text-sm font-medium text-gray-400 mb-4">User Growth</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chart}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis dataKey="date" tick={{ fill: CHART_TEXT, fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
          <YAxis yAxisId="left" tick={{ fill: CHART_TEXT, fontSize: 11 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: CHART_TEXT, fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar yAxisId="left" dataKey="new_users" name="New Users" fill={BLUE} radius={[3, 3, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="cumulative_total" name="Total Users" stroke={NEON} strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────
export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Performance");
  const [perfPeriod, setPerfPeriod] = useState("30d");
  const [legacyDays, setLegacyDays] = useState(30);
  const [error, setError] = useState<string | null>(null);

  const {
    trading,
    signalAnalytics,
    revenue,
    userGrowth,
    revenueChart,
    performance,
    loading,
    fetchTrading,
    fetchSignalAnalytics,
    fetchRevenue,
    fetchUserGrowth,
    fetchRevenueChart,
    fetchPerformance,
  } = useAdminAnalytics();

  const loadData = useCallback(async () => {
    setError(null);
    try {
      switch (activeTab) {
        case "Performance":
          await fetchPerformance({ period: perfPeriod });
          break;
        case "Trading":
          await fetchTrading(legacyDays);
          break;
        case "Signals":
          await fetchSignalAnalytics(legacyDays);
          break;
        case "Revenue":
          await Promise.all([fetchRevenue(), fetchRevenueChart(legacyDays)]);
          break;
        case "Users":
          await Promise.all([fetchRevenue(), fetchUserGrowth(legacyDays)]);
          break;
      }
    } catch {
      setError("Failed to load analytics data. Please try again.");
    }
  }, [activeTab, perfPeriod, legacyDays, fetchPerformance, fetchTrading, fetchSignalAnalytics, fetchRevenue, fetchRevenueChart, fetchUserGrowth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isPerformance = activeTab === "Performance";

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
          {isPerformance ? (
            <div className="flex items-center gap-1 bg-dark-200/60 p-1 rounded-xl border border-white/5">
              {PERF_PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPerfPeriod(p.value)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                    perfPeriod === p.value ? "bg-neon/10 text-neon" : "text-gray-400 hover:text-white"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-dark-200/60 p-1 rounded-xl border border-white/5">
              {LEGACY_PERIODS.map((p) => (
                <button
                  key={p.days}
                  onClick={() => setLegacyDays(p.days)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                    legacyDays === p.days ? "bg-neon/10 text-neon" : "text-gray-400 hover:text-white"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-dark-200/60 p-1 rounded-xl border border-white/5 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                activeTab === tab ? "bg-neon/10 text-neon" : "text-gray-400 hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && <ErrorBanner message={error} onRetry={loadData} />}

        {/* Tab content */}
        {activeTab === "Performance" && <PerformanceTab data={performance} loading={loading} />}
        {activeTab === "Trading" && <TradingTab data={trading} loading={loading} />}
        {activeTab === "Signals" && <SignalsTab data={signalAnalytics} loading={loading} />}
        {activeTab === "Revenue" && <RevenueTab revenue={revenue} chart={revenueChart} loading={loading} />}
        {activeTab === "Users" && <UsersTab chart={userGrowth} loading={loading} />}
      </div>
    </PageTransition>
  );
}
