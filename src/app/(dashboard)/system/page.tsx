"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import PageTransition from "@/components/PageTransition";
import { PageSpinner } from "@/components/ui/Spinner";
import useAdminSystem from "@/hooks/useAdminSystem";
import { formatDateTime } from "@/lib/utils";
import {
  RefreshCw,
  Database,
  Server,
  Tag,
  Activity,
  Zap,
  BarChart3,
  Clock,
  AlertCircle,
  Timer,
} from "lucide-react";

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function signalStatusColor(dateStr: string | null): string {
  if (!dateStr) return "bg-red-400";
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = diff / 3_600_000;
  if (hours <= 6) return "bg-neon";
  if (hours <= 24) return "bg-yellow-400";
  return "bg-red-400";
}

function signalStatusLabel(dateStr: string | null): string {
  if (!dateStr) return "No Data";
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = diff / 3_600_000;
  if (hours <= 6) return "Healthy";
  if (hours <= 24) return "Stale";
  return "Critical";
}

export default function SystemPage() {
  const { health, pipeline, loading, fetchHealth, fetchPipeline } =
    useAdminSystem();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    await Promise.all([fetchHealth(), fetchPipeline()]);
  }, [fetchHealth, fetchPipeline]);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh every 30s
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(refresh, 30_000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, refresh]);

  if (loading && !health && !pipeline) return <PageSpinner />;

  const dbOk = health?.database === "ok";

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">System Health</h1>
            <p className="text-sm text-gray-400 mt-1">
              Monitor infrastructure and pipeline status
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh((v) => !v)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                autoRefresh
                  ? "border-neon/30 text-neon bg-neon/5"
                  : "border-white/10 text-gray-400 bg-dark-200"
              }`}
            >
              Auto-refresh {autoRefresh ? "ON" : "OFF"}
            </button>
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-dark-200 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white hover:border-neon/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Row 1: Health Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Database */}
          <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-white/5">
                <Database className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-400">Database</h3>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${
                  dbOk ? "bg-neon" : "bg-red-400"
                }`}
              />
              <span
                className={`text-lg font-semibold ${
                  dbOk ? "text-neon" : "text-red-400"
                }`}
              >
                {dbOk ? "Operational" : "Down"}
              </span>
            </div>
          </div>

          {/* API Server */}
          <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-white/5">
                <Server className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-400">API Server</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-neon" />
              <span className="text-lg font-semibold text-neon">
                Operational
              </span>
            </div>
          </div>

          {/* Version */}
          <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-white/5">
                <Tag className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-400">Version</h3>
            </div>
            <span className="text-lg font-semibold text-white">
              {health?.version || "—"}
            </span>
          </div>
        </div>

        {/* Row 2: Pipeline Status */}
        <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5">
                <Activity className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Pipeline Status
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${signalStatusColor(
                  pipeline?.last_signal_at ?? null
                )}`}
              />
              <span className="text-sm text-gray-400">
                {signalStatusLabel(pipeline?.last_signal_at ?? null)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Zap className="h-3.5 w-3.5" />
                Last Signal
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${signalStatusColor(
                    pipeline?.last_signal_at ?? null
                  )}`}
                />
                <span className="text-sm font-medium text-white">
                  {timeAgo(pipeline?.last_signal_at ?? null)}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Timer className="h-3.5 w-3.5" />
                Last Execution
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${signalStatusColor(
                    pipeline?.last_execution_at ?? null
                  )}`}
                />
                <span className="text-sm font-medium text-white">
                  {timeAgo(pipeline?.last_execution_at ?? null)}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <BarChart3 className="h-3.5 w-3.5" />
                Signals Today
              </div>
              <span className="text-2xl font-bold text-white">
                {pipeline?.total_signals_today ?? 0}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <BarChart3 className="h-3.5 w-3.5" />
                Executions Today
              </div>
              <span className="text-2xl font-bold text-white">
                {pipeline?.total_executions_today ?? 0}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Activity className="h-3.5 w-3.5" />
                Active Strategies
              </div>
              <span className="text-2xl font-bold text-neon">
                {pipeline?.active_strategies ?? 0}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <AlertCircle className="h-3.5 w-3.5" />
                Pending Executions
              </div>
              <span
                className={`text-2xl font-bold ${
                  (pipeline?.pending_executions ?? 0) > 0
                    ? "text-yellow-400"
                    : "text-white"
                }`}
              >
                {pipeline?.pending_executions ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Row 3: System Info */}
        <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-white/5">
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">System Info</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-gray-500">Server Timestamp</span>
              <p className="text-sm text-white">
                {health?.timestamp ? formatDateTime(health.timestamp) : "—"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-gray-500">Server Started</span>
              <p className="text-sm text-white">
                {health?.uptime_info?.server_started
                  ? formatDateTime(health.uptime_info.server_started)
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
