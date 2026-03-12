"use client";

import { useState, useEffect, useCallback } from "react";
import PageTransition from "@/components/PageTransition";
import Table from "@/components/ui/Table";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import FilterBar from "@/components/filters/FilterBar";
import { PageSpinner } from "@/components/ui/Spinner";
import useAdminPayments from "@/hooks/useAdminPayments";
import usePagination from "@/hooks/usePagination";
import { formatCurrency, formatDateTime, shortenAddress } from "@/lib/utils";
import type { Payment } from "@/types";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "waiting", label: "Waiting" },
  { value: "confirming", label: "Confirming" },
  { value: "confirmed", label: "Confirmed" },
  { value: "finished", label: "Finished" },
  { value: "failed", label: "Failed" },
  { value: "expired", label: "Expired" },
];

const filters = [
  {
    key: "search",
    label: "Search",
    type: "search" as const,
    placeholder: "Search by email or payment ID...",
  },
  {
    key: "status",
    label: "Status",
    type: "select" as const,
    options: statusOptions,
  },
];

export default function PaymentsPage() {
  const { payments, loading, fetchPayments } = useAdminPayments();
  const { page, pageSize, setPage, reset } = usePagination();
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    search: "",
    status: "",
  });

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      setFilterValues((prev) => ({ ...prev, [key]: value }));
      reset();
    },
    [reset]
  );

  const reload = useCallback(() => {
    const params: Record<string, string | number> = {
      page,
      page_size: pageSize,
    };
    if (filterValues.status) params.status = filterValues.status;
    if (filterValues.search) params.search = filterValues.search;
    fetchPayments(params);
  }, [page, pageSize, filterValues, fetchPayments]);

  useEffect(() => {
    reload();
  }, [reload]);

  const columns = [
    {
      key: "created_at",
      header: "Date",
      render: (p: Payment) => (
        <span className="text-gray-400 text-xs">
          {formatDateTime(p.created_at)}
        </span>
      ),
    },
    {
      key: "user_email",
      header: "User",
      render: (p: Payment) => (
        <span className="text-white text-sm">
          {p.user_email || "N/A"}
        </span>
      ),
    },
    {
      key: "plan_name",
      header: "Plan",
      render: (p: Payment) => (
        <span className="text-white">{p.plan_name || "—"}</span>
      ),
    },
    {
      key: "amount_usd",
      header: "Amount",
      render: (p: Payment) => (
        <span className="text-white font-medium">
          {formatCurrency(p.amount_usd)}
        </span>
      ),
    },
    {
      key: "crypto",
      header: "Crypto",
      render: (p: Payment) => (
        <span className="text-gray-400 text-sm font-mono">
          {p.amount_crypto && p.crypto_currency
            ? `${p.amount_crypto} ${p.crypto_currency.toUpperCase()}`
            : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p: Payment) => <StatusBadge status={p.status} />,
    },
    {
      key: "nowpayments_payment_id",
      header: "Payment ID",
      render: (p: Payment) => (
        <span className="font-mono text-xs text-gray-500">
          {p.nowpayments_payment_id
            ? shortenAddress(p.nowpayments_payment_id, 6)
            : "—"}
        </span>
      ),
    },
  ];

  const items = payments?.items ?? [];
  const totalPages = payments?.total_pages ?? 1;

  if (loading && items.length === 0) return <PageSpinner />;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Payments</h1>
            <p className="text-sm text-gray-400 mt-1">
              View and track all payment transactions
            </p>
          </div>
        </div>

        {/* Filters */}
        <FilterBar
          filters={filters}
          values={filterValues}
          onChange={handleFilterChange}
        />

        {/* Table */}
        <Table<Payment>
          columns={columns}
          data={items}
          loading={loading}
          emptyMessage="No payments found"
        />

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </PageTransition>
  );
}
