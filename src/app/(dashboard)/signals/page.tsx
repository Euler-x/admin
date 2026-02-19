"use client";

import { useEffect, useState } from "react";
import { XCircle } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import FilterBar from "@/components/filters/FilterBar";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ConfirmDialog from "@/components/ConfirmDialog";
import useAdminSignals from "@/hooks/useAdminSignals";
import usePagination from "@/hooks/usePagination";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Signal, SignalDirection, SignalStatus } from "@/types";

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

export default function SignalsPage() {
  const { signals, totalPages, loading, fetchSignals, cancelSignal } = useAdminSignals();
  const { page, pageSize, setPage, reset } = usePagination();
  const [filters, setFilters] = useState<Record<string, string>>({
    search: "",
    direction: "",
    status: "",
  });
  const [cancelTarget, setCancelTarget] = useState<Signal | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const params: Record<string, unknown> = {
      page,
      page_size: pageSize,
    };
    if (filters.search) params.search = filters.search;
    if (filters.direction) params.direction = filters.direction;
    if (filters.status) params.status = filters.status;

    fetchSignals(params);
  }, [page, pageSize, filters, fetchSignals]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    reset();
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelSignal(cancelTarget.id);
      setCancelTarget(null);
      const params: Record<string, unknown> = { page, page_size: pageSize };
      if (filters.search) params.search = filters.search;
      if (filters.direction) params.direction = filters.direction;
      if (filters.status) params.status = filters.status;
      fetchSignals(params);
    } finally {
      setCancelling(false);
    }
  };

  const columns = [
    {
      key: "symbol",
      header: "Symbol",
      render: (signal: Signal) => (
        <span className="text-white font-semibold">{signal.symbol}</span>
      ),
    },
    {
      key: "direction",
      header: "Direction",
      render: (signal: Signal) => (
        <Badge variant={directionVariant[signal.direction]}>
          {signal.direction.charAt(0).toUpperCase() + signal.direction.slice(1)}
        </Badge>
      ),
    },
    {
      key: "confidence",
      header: "Confidence",
      render: (signal: Signal) => (
        <span className="text-neon font-medium">
          {(signal.confidence * 100).toFixed(0)}%
        </span>
      ),
    },
    {
      key: "entry_price",
      header: "Entry Price",
      render: (signal: Signal) => (
        <span className="text-gray-300">{formatCurrency(signal.entry_price)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (signal: Signal) => <StatusBadge status={signal.status} />,
    },
    {
      key: "created_at",
      header: "Created",
      render: (signal: Signal) => (
        <span className="text-gray-400">{formatDate(signal.created_at)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (signal: Signal) => {
        const canCancel = signal.status === "new" || signal.status === "executing";
        if (!canCancel) return <span className="text-gray-600">--</span>;
        return (
          <Button
            size="sm"
            variant="danger"
            onClick={() => setCancelTarget(signal)}
          >
            <XCircle className="h-3 w-3" />
            Cancel
          </Button>
        );
      },
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Signals</h1>
          <p className="text-sm text-gray-400 mt-1">
            Monitor and manage AI-generated trading signals
          </p>
        </div>

        {/* Filters */}
        <FilterBar
          filters={[
            {
              key: "search",
              label: "Search",
              type: "search",
              placeholder: "Search by symbol...",
            },
            {
              key: "direction",
              label: "Direction",
              type: "select",
              options: directionOptions,
            },
            {
              key: "status",
              label: "Status",
              type: "select",
              options: statusOptions,
            },
          ]}
          values={filters}
          onChange={handleFilterChange}
        />

        {/* Table */}
        <Table<Signal>
          columns={columns}
          data={signals}
          loading={loading}
          emptyMessage="No signals found"
        />

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

        {/* Cancel Confirm Dialog */}
        <ConfirmDialog
          isOpen={!!cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleCancel}
          title="Cancel Signal"
          message={`Are you sure you want to cancel the ${cancelTarget?.direction?.toUpperCase()} signal for ${cancelTarget?.symbol ?? "this asset"}? This action cannot be undone.`}
          confirmText="Cancel Signal"
          confirmVariant="danger"
          loading={cancelling}
        />
      </div>
    </PageTransition>
  );
}
