"use client";

import { useEffect, useState, useCallback } from "react";
import { XCircle } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import FilterBar from "@/components/filters/FilterBar";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ConfirmDialog from "@/components/ConfirmDialog";
import { PageSpinner } from "@/components/ui/Spinner";
import usePagination from "@/hooks/usePagination";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import toast from "react-hot-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Signal, SignalDirection, SignalStatus, PaginatedResponse } from "@/types";

type ExchangeTab = "hyperliquid" | "bybit" | "binance";

const HL_LOGO = "https://res.cloudinary.com/dpwddkw5t/image/upload/v1774120519/hyprliquid_orr9vl.webp";
const BYBIT_LOGO = "https://res.cloudinary.com/dpwddkw5t/image/upload/v1774120520/bybit_obnhd8.webp";
const BN_LOGO = "https://assets.coingecko.com/markets/images/52/large/binance.jpg";

const EXCHANGE_LOGOS: Record<ExchangeTab, string> = {
  hyperliquid: HL_LOGO,
  bybit: BYBIT_LOGO,
  binance: BN_LOGO,
};

const EXCHANGE_LABELS: Record<ExchangeTab, string> = {
  hyperliquid: "HyperLiquid",
  bybit: "Bybit",
  binance: "Binance",
};

const directionVariant: Record<SignalDirection, "success" | "danger" | "warning"> = {
  buy: "success",
  sell: "danger",
  hold: "warning",
};

const directionOptions = [
  { value: "", label: "All" },
  { value: "buy", label: "Buy" },
  { value: "sell", label: "Sell" },
  { value: "hold", label: "Hold" },
];

const statusOptions = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "executing", label: "Executing" },
  { value: "filled", label: "Filled" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

function getEndpoints(exchange: ExchangeTab) {
  if (exchange === "bybit") return ENDPOINTS.BYBIT_SIGNALS;
  if (exchange === "binance") return ENDPOINTS.BINANCE_SIGNALS;
  return ENDPOINTS.SIGNALS;
}

export default function SignalsPage() {
  const { page, pageSize, setPage, reset } = usePagination();
  const [exchange, setExchange] = useState<ExchangeTab>("hyperliquid");
  const [signals, setSignals] = useState<Signal[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({
    search: "",
    direction: "",
    status: "",
  });
  const [cancelTarget, setCancelTarget] = useState<Signal | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchSignals = useCallback(async () => {
    setLoading(true);
    try {
      const ep = getEndpoints(exchange);
      const params: Record<string, unknown> = { page, page_size: pageSize };
      if (filters.search) params.symbol = filters.search;
      if (filters.direction) params.direction = filters.direction;
      if (filters.status) params.signal_status = filters.status;

      const { data } = await api.get<PaginatedResponse<Signal>>(ep.LIST, { params });
      setSignals(data.items.map((s) => ({ ...s, exchange: s.exchange || exchange })));
      setTotalPages(data.total_pages);
    } finally {
      setLoading(false);
    }
  }, [exchange, page, pageSize, filters]);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    reset();
  };

  const handleSwitchExchange = (ex: ExchangeTab) => {
    setExchange(ex);
    reset();
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const ep = getEndpoints(exchange);
      await api.put(ep.CANCEL(cancelTarget.id));
      toast.success("Signal cancelled");
      setCancelTarget(null);
      fetchSignals();
    } finally {
      setCancelling(false);
    }
  };

  const columns = [
    {
      key: "exchange",
      header: "Exchange",
      render: (s: Signal) => (
        <div className="flex items-center gap-1.5">
          <img
            src={EXCHANGE_LOGOS[(s.exchange as ExchangeTab) || "hyperliquid"]}
            alt=""
            className="h-4 w-4 rounded-sm"
          />
          <span className={`text-[10px] font-medium ${
            s.exchange === "bybit" ? "text-orange-400" : s.exchange === "binance" ? "text-yellow-400" : "text-emerald-400"
          }`}>
            {s.exchange === "bybit" ? "Bybit" : s.exchange === "binance" ? "Binance" : "HL"}
          </span>
        </div>
      ),
    },
    {
      key: "symbol",
      header: "Symbol",
      render: (s: Signal) => (
        <span className="text-white font-semibold">{s.symbol}</span>
      ),
    },
    {
      key: "direction",
      header: "Direction",
      render: (s: Signal) => (
        <Badge variant={directionVariant[s.direction]}>
          {s.direction.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "confidence",
      header: "Confidence",
      render: (s: Signal) => (
        <span className="text-neon font-medium">
          {(s.confidence * 100).toFixed(0)}%
        </span>
      ),
    },
    {
      key: "entry_price",
      header: "Entry",
      render: (s: Signal) => (
        <span className="text-gray-300">{formatCurrency(s.entry_price)}</span>
      ),
    },
    {
      key: "sl_tp",
      header: "SL / TP",
      render: (s: Signal) => (
        <div className="text-xs">
          <span className="text-red-400">{s.stop_loss ? formatCurrency(s.stop_loss) : "—"}</span>
          <span className="text-gray-600 mx-1">/</span>
          <span className="text-neon">{s.take_profit ? formatCurrency(s.take_profit) : "—"}</span>
        </div>
      ),
    },
    {
      key: "rr",
      header: "R:R",
      render: (s: Signal) => (
        <span className="text-gray-400 text-sm">
          {s.risk_reward_ratio ? s.risk_reward_ratio.toFixed(1) : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (s: Signal) => <StatusBadge status={s.status} />,
    },
    {
      key: "created_at",
      header: "Created",
      render: (s: Signal) => (
        <span className="text-gray-500 text-xs">{formatDate(s.created_at)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (s: Signal) => {
        const canCancel = s.status === "new" || s.status === "executing";
        if (!canCancel) return null;
        return (
          <Button size="sm" variant="danger" onClick={() => setCancelTarget(s)}>
            <XCircle className="h-3 w-3" /> Cancel
          </Button>
        );
      },
    },
  ];

  const exchangeLabel = EXCHANGE_LABELS[exchange];
  const exchangeLogo = EXCHANGE_LOGOS[exchange];

  if (loading && signals.length === 0) return <PageSpinner />;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={exchangeLogo} alt="" className="h-7 w-7 rounded" />
            <div>
              <h1 className="text-2xl font-bold text-white">{exchangeLabel} Signals</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                AI-generated trading signals on {exchangeLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Exchange Tabs */}
        <div className="flex items-center gap-1 p-1 bg-dark-200/60 rounded-xl border border-white/5 w-fit">
          {(["hyperliquid", "bybit", "binance"] as ExchangeTab[]).map((ex) => (
            <button
              key={ex}
              onClick={() => handleSwitchExchange(ex)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                exchange === ex
                  ? "bg-neon/10 text-neon border border-neon/20"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <img
                src={EXCHANGE_LOGOS[ex]}
                alt=""
                className="h-4 w-4 rounded-sm"
              />
              {EXCHANGE_LABELS[ex]}
            </button>
          ))}
        </div>

        {/* Filters */}
        <FilterBar
          filters={[
            { key: "search", label: "Search", type: "search", placeholder: "Search by symbol..." },
            { key: "direction", label: "Direction", type: "select", options: directionOptions },
            { key: "status", label: "Status", type: "select", options: statusOptions },
          ]}
          values={filters}
          onChange={handleFilterChange}
        />

        {/* Table */}
        <Table<Signal>
          columns={columns}
          data={signals}
          loading={loading}
          emptyMessage={`No ${exchangeLabel} signals found`}
        />

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

        {/* Cancel Confirm */}
        <ConfirmDialog
          isOpen={!!cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleCancel}
          title="Cancel Signal"
          message={`Cancel the ${cancelTarget?.direction?.toUpperCase()} signal for ${cancelTarget?.symbol ?? "this asset"} on ${exchangeLabel}?`}
          confirmText="Cancel Signal"
          confirmVariant="danger"
          loading={cancelling}
        />
      </div>
    </PageTransition>
  );
}
