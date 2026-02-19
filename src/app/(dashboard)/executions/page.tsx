"use client";

import { useState, useEffect, useCallback } from "react";
import PageTransition from "@/components/PageTransition";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import FilterBar from "@/components/filters/FilterBar";
import { PageSpinner } from "@/components/ui/Spinner";
import useAdminExecutions from "@/hooks/useAdminExecutions";
import usePagination from "@/hooks/usePagination";
import { formatCurrency, formatDate, formatPnl } from "@/lib/utils";
import type { Execution, ExecutionStatus, SignalDirection } from "@/types";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "filled", label: "Filled" },
  { value: "partially_filled", label: "Partially Filled" },
  { value: "closed", label: "Closed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "failed", label: "Failed" },
];

const directionOptions = [
  { value: "", label: "All Directions" },
  { value: "buy", label: "Buy" },
  { value: "sell", label: "Sell" },
  { value: "hold", label: "Hold" },
];

const filters = [
  {
    key: "search",
    label: "Search",
    type: "search" as const,
    placeholder: "Search executions...",
  },
  {
    key: "status",
    label: "Status",
    type: "select" as const,
    options: statusOptions,
  },
  {
    key: "direction",
    label: "Direction",
    type: "select" as const,
    options: directionOptions,
  },
];

const columns = [
  {
    key: "direction",
    header: "Direction",
    render: (e: Execution) => (
      <Badge variant={e.direction === "buy" ? "success" : e.direction === "sell" ? "danger" : "default"}>
        {e.direction.toUpperCase()}
      </Badge>
    ),
  },
  {
    key: "entry_price",
    header: "Entry Price",
    render: (e: Execution) => <span className="text-white font-medium">{formatCurrency(e.entry_price)}</span>,
  },
  {
    key: "exit_price",
    header: "Exit Price",
    render: (e: Execution) => (
      <span className="text-gray-300">{e.exit_price ? formatCurrency(e.exit_price) : "—"}</span>
    ),
  },
  {
    key: "quantity",
    header: "Quantity",
    render: (e: Execution) => <span className="text-gray-300">{e.quantity.toFixed(4)}</span>,
  },
  {
    key: "leverage",
    header: "Leverage",
    render: (e: Execution) => <span className="text-gray-300">{e.leverage}x</span>,
  },
  {
    key: "pnl",
    header: "PnL",
    render: (e: Execution) => {
      const { text, color } = formatPnl(e.pnl);
      return <span className={`font-medium ${color}`}>{text}</span>;
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
    render: (e: Execution) => <span className="text-gray-500 text-xs">{formatDate(e.created_at)}</span>,
  },
];

export default function ExecutionsPage() {
  const { executions, totalPages, loading, fetchExecutions } = useAdminExecutions();
  const { page, pageSize, setPage, reset } = usePagination();
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    search: "",
    status: "",
    direction: "",
  });

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      setFilterValues((prev) => ({ ...prev, [key]: value }));
      reset();
    },
    [reset]
  );

  useEffect(() => {
    const params: Record<string, unknown> = { page, page_size: pageSize };
    if (filterValues.status) params.status = filterValues.status as ExecutionStatus;
    if (filterValues.direction) params.direction = filterValues.direction as SignalDirection;
    if (filterValues.search) params.search = filterValues.search;
    fetchExecutions(params);
  }, [page, pageSize, filterValues, fetchExecutions]);

  if (loading && executions.length === 0) return <PageSpinner />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Executions</h1>
          <p className="text-sm text-gray-400 mt-1">All trade executions across the platform</p>
        </div>

        <FilterBar filters={filters} values={filterValues} onChange={handleFilterChange} />

        <Table<Execution>
          columns={columns}
          data={executions}
          loading={loading}
          emptyMessage="No executions found"
        />

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </PageTransition>
  );
}
