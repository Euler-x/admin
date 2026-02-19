"use client";

import { useState, useEffect, useCallback } from "react";
import PageTransition from "@/components/PageTransition";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import FilterBar from "@/components/filters/FilterBar";
import { PageSpinner } from "@/components/ui/Spinner";
import useAdminTransactions from "@/hooks/useAdminTransactions";
import usePagination from "@/hooks/usePagination";
import { formatCurrency, formatDate, shortenAddress, capitalize } from "@/lib/utils";
import type { Transaction, TransactionCategory, TransactionStatus } from "@/types";

const categoryOptions = [
  { value: "", label: "All Categories" },
  { value: "deposit", label: "Deposit" },
  { value: "execution", label: "Execution" },
  { value: "subscription", label: "Subscription" },
  { value: "reward", label: "Reward" },
];

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "failed", label: "Failed" },
];

const filters = [
  {
    key: "search",
    label: "Search",
    type: "search" as const,
    placeholder: "Search transactions...",
  },
  {
    key: "category",
    label: "Category",
    type: "select" as const,
    options: categoryOptions,
  },
  {
    key: "status",
    label: "Status",
    type: "select" as const,
    options: statusOptions,
  },
];

const columns = [
  {
    key: "category",
    header: "Category",
    render: (t: Transaction) => <Badge>{capitalize(t.category)}</Badge>,
  },
  {
    key: "amount",
    header: "Amount",
    render: (t: Transaction) => (
      <span className="font-medium text-white">{formatCurrency(t.amount)}</span>
    ),
  },
  {
    key: "asset",
    header: "Asset",
    render: (t: Transaction) => <span className="text-gray-300 uppercase">{t.asset}</span>,
  },
  {
    key: "status",
    header: "Status",
    render: (t: Transaction) => <StatusBadge status={t.status} />,
  },
  {
    key: "tx_hash",
    header: "TX Hash",
    render: (t: Transaction) =>
      t.tx_hash ? (
        <span className="font-mono text-xs text-neon">{shortenAddress(t.tx_hash, 6)}</span>
      ) : (
        <span className="text-gray-600">&mdash;</span>
      ),
  },
  {
    key: "created_at",
    header: "Date",
    render: (t: Transaction) => <span className="text-gray-500 text-xs">{formatDate(t.created_at)}</span>,
  },
];

export default function TransactionsPage() {
  const { transactions, totalPages, loading, fetchTransactions } = useAdminTransactions();
  const { page, pageSize, setPage, reset } = usePagination();
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    search: "",
    category: "",
    status: "",
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
    if (filterValues.category) params.category = filterValues.category as TransactionCategory;
    if (filterValues.status) params.status = filterValues.status as TransactionStatus;
    if (filterValues.search) params.search = filterValues.search;
    fetchTransactions(params);
  }, [page, pageSize, filterValues, fetchTransactions]);

  if (loading && transactions.length === 0) return <PageSpinner />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-sm text-gray-400 mt-1">All financial transactions across the platform</p>
        </div>

        <FilterBar filters={filters} values={filterValues} onChange={handleFilterChange} />

        <Table<Transaction>
          columns={columns}
          data={transactions}
          loading={loading}
          emptyMessage="No transactions found"
        />

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </PageTransition>
  );
}
