"use client";

import { useEffect } from "react";
import {
  UserPlus,
  UserCheck,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import PageTransition from "@/components/PageTransition";
import StatsGrid from "@/components/dashboard/StatsGrid";
import TradingHaltControl from "@/components/dashboard/TradingHaltControl";
import RevenueChart from "@/components/dashboard/RevenueChart";
import useAdminTrading from "@/hooks/useAdminTrading";
import useAdminAnalytics from "@/hooks/useAdminAnalytics";
import { formatNumber, formatPnl } from "@/lib/utils";

export default function DashboardPage() {
  const { status, loading: tradingLoading, fetchStatus, haltTrading, resumeTrading } =
    useAdminTrading();
  const {
    revenue,
    userStats,
    executionStats,
    loading: analyticsLoading,
    fetchRevenue,
    fetchUserStats,
    fetchExecutionStats,
  } = useAdminAnalytics();

  useEffect(() => {
    fetchStatus();
    fetchRevenue();
    fetchUserStats();
    fetchExecutionStats();
  }, [fetchStatus, fetchRevenue, fetchUserStats, fetchExecutionStats]);

  const pnl = executionStats ? formatPnl(executionStats.total_pnl) : null;

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            Platform overview and emergency controls
          </p>
        </div>

        {/* Trading halt control */}
        <TradingHaltControl
          status={status}
          loading={tradingLoading}
          onHalt={haltTrading}
          onResume={resumeTrading}
        />

        {/* Stats grid */}
        <StatsGrid
          revenue={revenue}
          userStats={userStats}
          executionStats={executionStats}
        />

        {/* Revenue by Plan */}
        <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Revenue by Plan</h2>
          <RevenueChart data={revenue?.revenue_by_plan ?? []} />
        </div>

        {/* Recent activity summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* User activity card */}
          <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-5">User Activity</h2>
            {userStats ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <UserPlus className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-sm text-gray-400">New Users (period)</span>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {formatNumber(userStats.new_users_period, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-neon/10 flex items-center justify-center">
                      <UserCheck className="h-4 w-4 text-neon" />
                    </div>
                    <span className="text-sm text-gray-400">Active Users</span>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {formatNumber(userStats.active_users, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <ShieldCheck className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-sm text-gray-400">Admin Users</span>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {formatNumber(userStats.admin_users, 0)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-white/5 rounded-lg" />
                      <div className="h-3 w-28 bg-white/5 rounded" />
                    </div>
                    <div className="h-3 w-10 bg-white/5 rounded" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Execution breakdown card */}
          <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Execution Breakdown</h2>
            {executionStats ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-yellow-400" />
                    </div>
                    <span className="text-sm text-gray-400">Pending</span>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {formatNumber(executionStats.pending, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-neon/10 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-neon" />
                    </div>
                    <span className="text-sm text-gray-400">Filled</span>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {formatNumber(executionStats.filled, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <XCircle className="h-4 w-4 text-red-400" />
                    </div>
                    <span className="text-sm text-gray-400">Failed</span>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {formatNumber(executionStats.failed, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-white/5 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-400">Total PnL</span>
                  </div>
                  <span className={`text-sm font-semibold ${pnl?.color ?? "text-gray-400"}`}>
                    {pnl?.text ?? "---"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-white/5 rounded-lg" />
                      <div className="h-3 w-28 bg-white/5 rounded" />
                    </div>
                    <div className="h-3 w-10 bg-white/5 rounded" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
