"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import PageTransition from "@/components/PageTransition";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import { PageSpinner } from "@/components/ui/Spinner";
import useAdminExecutions from "@/hooks/useAdminExecutions";
import useAdminAnalytics from "@/hooks/useAdminAnalytics";
import usePagination from "@/hooks/usePagination";
import { formatCurrency, formatDate, formatPnl, shortenAddress } from "@/lib/utils";
import type { Execution, ExecutionStatus, SignalDirection } from "@/types";
import {
  TrendingUp, TrendingDown, Activity, DollarSign,
  RefreshCw, Target, XCircle, CheckCircle, Clock, X,
} from "lucide-react";

type Tab = "open" | "closed" | "failed" | "all";

const TAB_CONFIG: { key: Tab; label: string; icon: typeof Activity; statuses: string[] }[] = [
  { key: "open", label: "Open Trades", icon: Activity, statuses: ["filled", "pending"] },
  { key: "closed", label: "Closed", icon: CheckCircle, statuses: ["closed"] },
  { key: "failed", label: "Failed", icon: XCircle, statuses: ["failed", "cancelled"] },
  { key: "all", label: "All Trades", icon: Target, statuses: [] },
];

export default function TradesPage() {
  const { executions, totalPages, loading, fetchExecutions, closeExecution } = useAdminExecutions();
  const { trading, fetchTrading } = useAdminAnalytics();
  const { page, pageSize, setPage, reset } = usePagination();
  const [tab, setTab] = useState<Tab>("open");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const loadData = useCallback(() => {
    const tabConfig = TAB_CONFIG.find((t) => t.key === tab);
    const params: Record<string, unknown> = { page, page_size: pageSize };
    if (tabConfig && tabConfig.statuses.length > 0) {
      params.status = tabConfig.statuses[0] as ExecutionStatus;
    }
    fetchExecutions(params);
  }, [tab, page, pageSize, fetchExecutions]);

  // Initial load + tab/page change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fetch trading analytics once
  useEffect(() => {
    fetchTrading(30);
  }, [fetchTrading]);

  // Auto-refresh for open trades
  useEffect(() => {
    if (autoRefresh && tab === "open") {
      intervalRef.current = setInterval(loadData, 15000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, tab, loadData]);

  // Stats from trading analytics
  const winRate = trading?.win_rate ?? 0;
  const totalTrades = trading?.total_trades ?? 0;
  const totalWins = trading?.by_direction
    ? (trading.by_direction.buy?.wins ?? 0) + (trading.by_direction.sell?.wins ?? 0)
    : 0;
  const totalLosses = totalTrades - totalWins;
  const totalPnl = trading?.pnl_by_day?.reduce(
    (sum: number, d: { pnl: number }) => sum + d.pnl, 0
  ) ?? 0;
  const openCount = executions.filter(
    (e) => e.status === "filled" || e.status === "pending"
  ).length;

  const columns = [
    {
      key: "exchange",
      header: "Exchange",
      render: (e: Execution) => (
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
          e.exchange === "bybit" ? "bg-orange-500/10 text-orange-400" : "bg-emerald-500/10 text-emerald-400"
        }`}>
          {e.exchange === "bybit" ? "Bybit" : "HL"}
        </span>
      ),
    },
    {
      key: "direction",
      header: "Side",
      render: (e: Execution) => (
        <div className="flex items-center gap-1.5">
          {e.direction === "buy" ? (
            <TrendingUp className="h-3.5 w-3.5 text-neon" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-red-400" />
          )}
          <Badge variant={e.direction === "buy" ? "success" : "danger"}>
            {e.direction.toUpperCase()}
          </Badge>
        </div>
      ),
    },
    {
      key: "user",
      header: "User",
      render: (e: Execution) => (
        <span className="text-xs text-gray-400">
          {e.user_email || shortenAddress(e.user_id)}
        </span>
      ),
    },
    {
      key: "entry_price",
      header: "Entry",
      render: (e: Execution) => (
        <span className="text-white font-medium text-sm">{formatCurrency(e.entry_price)}</span>
      ),
    },
    {
      key: "exit_price",
      header: "Exit",
      render: (e: Execution) => (
        <span className="text-gray-300 text-sm">
          {e.exit_price ? formatCurrency(e.exit_price) : "—"}
        </span>
      ),
    },
    {
      key: "quantity",
      header: "Qty",
      render: (e: Execution) => (
        <span className="text-gray-300 text-sm">{e.quantity.toFixed(4)}</span>
      ),
    },
    {
      key: "leverage",
      header: "Lev",
      render: (e: Execution) => (
        <span className="text-gray-400 text-sm">{e.leverage}x</span>
      ),
    },
    {
      key: "pnl",
      header: "PnL",
      render: (e: Execution) => {
        const { text, color } = formatPnl(e.pnl);
        return <span className={`font-semibold text-sm ${color}`}>{text}</span>;
      },
    },
    {
      key: "status",
      header: "Status",
      render: (e: Execution) => <StatusBadge status={e.status} />,
    },
    {
      key: "created_at",
      header: "Date",
      render: (e: Execution) => (
        <span className="text-gray-600 text-xs">{formatDate(e.created_at)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (e: Execution) => {
        if (e.status !== "filled") return null;
        return (
          <button
            onClick={() => setConfirmId(e.id)}
            disabled={closingId === e.id}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            <X className="h-3 w-3" />
            {closingId === e.id ? "Closing…" : "Close"}
          </button>
        );
      },
    },
  ];

  const handleClose = async (id: string) => {
    setConfirmId(null);
    setClosingId(id);
    try {
      await closeExecution(id);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to close position";
      alert(msg);
    } finally {
      setClosingId(null);
    }
  };

  if (loading && executions.length === 0) return <PageSpinner />;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Trades</h1>
            <p className="text-sm text-gray-400 mt-1">
              All trade executions across exchanges
            </p>
          </div>
          <div className="flex items-center gap-3">
            {tab === "open" && (
              <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="accent-emerald-500"
                />
                Auto-refresh
              </label>
            )}
            <Button size="sm" variant="secondary" onClick={loadData}>
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-dark-200/60 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-neon" />
              <span className="text-xs text-gray-500">Total Trades (30d)</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalTrades}</p>
          </div>
          <div className="bg-dark-200/60 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-cyan-400" />
              <span className="text-xs text-gray-500">Win Rate</span>
            </div>
            <p className={`text-2xl font-bold ${winRate >= 50 ? "text-neon" : "text-red-400"}`}>
              {winRate.toFixed(1)}%
            </p>
            <p className="text-[10px] text-gray-600 mt-0.5">
              {totalWins}W / {totalLosses}L
            </p>
          </div>
          <div className="bg-dark-200/60 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-gray-500">Total PnL (30d)</span>
            </div>
            <p className={`text-2xl font-bold ${totalPnl >= 0 ? "text-neon" : "text-red-400"}`}>
              {totalPnl >= 0 ? "+" : ""}{formatCurrency(totalPnl)}
            </p>
          </div>
          <div className="bg-dark-200/60 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-gray-500">Open Positions</span>
            </div>
            <p className="text-2xl font-bold text-white">{openCount}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-dark-200/60 rounded-xl border border-white/5 w-fit">
          {TAB_CONFIG.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); reset(); }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tab === t.key
                  ? "bg-neon/10 text-neon border border-neon/20"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <t.icon className="h-3 w-3" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <Table<Execution>
          columns={columns}
          data={executions}
          loading={loading}
          emptyMessage={`No ${tab} trades found`}
        />

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Close confirmation dialog */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-200 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-semibold text-white mb-2">Close Position?</h3>
            <p className="text-sm text-gray-400 mb-6">
              This will place a market close order on the exchange and mark the execution as closed. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 px-4 py-2 text-sm text-gray-400 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleClose(confirmId)}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500/20 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-colors"
              >
                Close Position
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
