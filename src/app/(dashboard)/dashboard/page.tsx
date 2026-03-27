"use client";

import { useEffect } from "react";
import {
  DollarSign,
  Users,
  Target,
  TrendingUp,
  CreditCard,
  Layers,
  Radio,
  Zap,
  AlertTriangle,
  Ticket,
  Activity,
  Database,
  Server,
  Clock,
} from "lucide-react";
import PageTransition from "@/components/PageTransition";
import TradingHaltControl from "@/components/dashboard/TradingHaltControl";
import RevenueChart from "@/components/dashboard/RevenueChart";
import useAdminTrading from "@/hooks/useAdminTrading";
import useAdminAnalytics from "@/hooks/useAdminAnalytics";
import useAdminSystem from "@/hooks/useAdminSystem";
import { formatCurrency, formatNumber, formatPnl } from "@/lib/utils";

/* ── Helpers ────────────────────────────────────────────── */

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  if (diffMs < 0) return "Just now";

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/* ── Skeleton Pulse ─────────────────────────────────────── */

function SkeletonKPI() {
  return (
    <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 bg-white/5 rounded-xl" />
        <div className="h-3 w-16 bg-white/5 rounded" />
      </div>
      <div className="h-7 w-24 bg-white/5 rounded mb-2" />
      <div className="h-4 w-20 bg-white/5 rounded" />
    </div>
  );
}

function SkeletonSmallKPI() {
  return (
    <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-9 w-9 bg-white/5 rounded-xl" />
        <div className="h-3 w-24 bg-white/5 rounded" />
      </div>
      <div className="h-6 w-16 bg-white/5 rounded" />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6 animate-pulse">
      <div className="h-5 w-32 bg-white/5 rounded mb-5" />
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-3 w-32 bg-white/5 rounded" />
            <div className="h-3 w-16 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Page Component ─────────────────────────────────────── */

export default function DashboardPage() {
  const {
    status,
    loading: tradingLoading,
    fetchStatus,
    haltTrading,
    resumeTrading,
  } = useAdminTrading();

  const {
    dashboard,
    revenue,
    loading: analyticsLoading,
    fetchDashboard,
    fetchRevenue,
  } = useAdminAnalytics();

  const {
    health,
    pipeline,
    fetchHealth,
    fetchPipeline,
  } = useAdminSystem();

  useEffect(() => {
    fetchStatus();
    fetchDashboard();
    fetchRevenue();
    fetchHealth();
    fetchPipeline();
  }, [fetchStatus, fetchDashboard, fetchRevenue, fetchHealth, fetchPipeline]);

  const pnl = dashboard ? formatPnl(dashboard.total_pnl) : null;
  const pnlToday = dashboard ? formatPnl(dashboard.pnl_today) : null;

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Platform overview and emergency controls
          </p>
        </div>

        {/* Row 1: Primary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboard ? (
            <>
              {/* Total Revenue */}
              <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-neon/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-neon" />
                  </div>
                  <span className="text-xs text-gray-500">
                    Last 30d: {formatCurrency(dashboard.revenue_30d)}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(dashboard.total_revenue_usd)}
                </p>
                <p className="text-sm text-gray-400 mt-1">Total Revenue</p>
              </div>

              {/* Total Users */}
              <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="text-xs text-gray-500">
                    +{formatNumber(dashboard.new_users_7d, 0)} this week
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(dashboard.total_users, 0)}
                </p>
                <p className="text-sm text-gray-400 mt-1">Total Users</p>
              </div>

              {/* Win Rate */}
              <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-purple-400" />
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatNumber(dashboard.total_executions, 0)} total trades
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(dashboard.win_rate, 1)}%
                </p>
                <p className="text-sm text-gray-400 mt-1">Win Rate</p>
              </div>

              {/* Total PnL */}
              <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span className={`text-xs ${pnlToday?.color ?? "text-gray-500"}`}>
                    Today: {pnlToday?.text ?? "---"}
                  </span>
                </div>
                <p className={`text-2xl font-bold ${pnl?.color ?? "text-gray-400"}`}>
                  {pnl?.text ?? "---"}
                </p>
                <p className="text-sm text-gray-400 mt-1">Total PnL</p>
              </div>
            </>
          ) : (
            <>
              {[...Array(4)].map((_, i) => (
                <SkeletonKPI key={i} />
              ))}
            </>
          )}
        </div>

        {/* Row 2: Secondary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {dashboard ? (
            <>
              <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-xl bg-neon/10 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-neon" />
                  </div>
                  <span className="text-xs text-gray-400">Subscriptions</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {formatNumber(dashboard.active_subscriptions, 0)}
                </p>
              </div>

              <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Layers className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-xs text-gray-400">Strategies</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {formatNumber(dashboard.active_strategies, 0)}
                </p>
              </div>

              <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Radio className="h-4 w-4 text-purple-400" />
                  </div>
                  <span className="text-xs text-gray-400">Signals</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {formatNumber(dashboard.active_signals, 0)}
                </p>
              </div>

              <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-yellow-400" />
                  </div>
                  <span className="text-xs text-gray-400">Executions 24h</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {formatNumber(dashboard.executions_24h, 0)}
                </p>
              </div>

              <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  </div>
                  <span className="text-xs text-gray-400">Failed</span>
                </div>
                <p className={`text-xl font-bold ${dashboard.failed_executions > 0 ? "text-red-400" : "text-white"}`}>
                  {formatNumber(dashboard.failed_executions, 0)}
                </p>
              </div>

              <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Ticket className="h-4 w-4 text-orange-400" />
                  </div>
                  <span className="text-xs text-gray-400">Open Tickets</span>
                </div>
                <p className={`text-xl font-bold ${dashboard.open_tickets > 0 ? "text-orange-400" : "text-white"}`}>
                  {formatNumber(dashboard.open_tickets, 0)}
                </p>
              </div>
            </>
          ) : (
            <>
              {[...Array(6)].map((_, i) => (
                <SkeletonSmallKPI key={i} />
              ))}
            </>
          )}
        </div>

        {/* Row 3: Trading Halt Control */}
        <TradingHaltControl
          status={status}
          loading={tradingLoading}
          onHalt={haltTrading}
          onResume={resumeTrading}
        />

        {/* Row 4: Pipeline Status + System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pipeline Status */}
          {pipeline ? (
            <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <Activity className="h-5 w-5 text-neon" />
                <h2 className="text-lg font-semibold text-white">
                  Pipeline Status
                </h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Last Signal</span>
                  <span className="text-sm font-medium text-white">
                    {timeAgo(pipeline.last_signal_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Last Execution</span>
                  <span className="text-sm font-medium text-white">
                    {timeAgo(pipeline.last_execution_at)}
                  </span>
                </div>
                <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Signals Today</span>
                  <span className="text-sm font-medium text-white">
                    {formatNumber(pipeline.total_signals_today, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Executions Today</span>
                  <span className="text-sm font-medium text-white">
                    {formatNumber(pipeline.total_executions_today, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Active Strategies</span>
                  <span className="text-sm font-medium text-white">
                    {formatNumber(pipeline.active_strategies, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Pending Executions</span>
                  <span className={`text-sm font-medium ${pipeline.pending_executions > 0 ? "text-yellow-400" : "text-white"}`}>
                    {formatNumber(pipeline.pending_executions, 0)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <SkeletonCard />
          )}

          {/* System Health */}
          {health ? (
            <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <Server className="h-5 w-5 text-neon" />
                <h2 className="text-lg font-semibold text-white">
                  System Health
                </h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Database</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        health.database === "ok"
                          ? "bg-neon shadow-[0_0_6px_rgba(57,255,20,0.5)]"
                          : "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        health.database === "ok"
                          ? "text-neon"
                          : "text-red-400"
                      }`}
                    >
                      {health.database === "ok" ? "Healthy" : "Unhealthy"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Server className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Version</span>
                  </div>
                  <span className="text-sm font-medium text-white font-mono">
                    {health.version}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Server Time</span>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {new Date(health.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <SkeletonCard />
          )}
        </div>

        {/* Row 5: Revenue by Plan */}
        <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Revenue by Plan
          </h2>
          <RevenueChart data={revenue?.revenue_by_plan ?? []} />
        </div>
      </div>
    </PageTransition>
  );
}
