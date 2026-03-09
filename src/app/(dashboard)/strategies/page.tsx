"use client";

import { useEffect, useState } from "react";
import { Power, Trash2 } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import FilterBar from "@/components/filters/FilterBar";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ConfirmDialog from "@/components/ConfirmDialog";
import useAdminStrategies from "@/hooks/useAdminStrategies";
import usePagination from "@/hooks/usePagination";
import type { Strategy, StrategyType, RiskProfile } from "@/types";

const riskVariant: Record<RiskProfile, "success" | "warning" | "danger"> = {
  low: "success",
  medium: "warning",
  high: "danger",
};

const typeOptions = [
  { value: "", label: "All" },
  { value: "conservative", label: "Conservative" },
  { value: "moderate", label: "Moderate" },
  { value: "aggressive", label: "Aggressive" },
  { value: "custom", label: "Custom" },
];

const riskOptions = [
  { value: "", label: "All" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const activeOptions = [
  { value: "", label: "All" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export default function StrategiesPage() {
  const { strategies, totalPages, loading, fetchStrategies, deactivateStrategy, deleteStrategy } =
    useAdminStrategies();
  const { page, pageSize, setPage, reset } = usePagination();
  const [filters, setFilters] = useState<Record<string, string>>({
    search: "",
    strategy_type: "",
    risk_profile: "",
    is_active: "",
  });
  const [confirmAction, setConfirmAction] = useState<{
    type: "deactivate" | "delete";
    strategy: Strategy;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const params: Record<string, unknown> = {
      page,
      page_size: pageSize,
    };
    if (filters.search) params.search = filters.search;
    if (filters.strategy_type) params.strategy_type = filters.strategy_type;
    if (filters.risk_profile) params.risk_profile = filters.risk_profile;
    if (filters.is_active) params.is_active = filters.is_active === "true";

    fetchStrategies(params);
  }, [page, pageSize, filters, fetchStrategies]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    reset();
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      if (confirmAction.type === "deactivate") {
        await deactivateStrategy(confirmAction.strategy.id);
      } else {
        await deleteStrategy(confirmAction.strategy.id);
      }
      setConfirmAction(null);
      fetchStrategies({ page, page_size: pageSize, ...buildParams() });
    } finally {
      setActionLoading(false);
    }
  };

  const buildParams = (): Record<string, unknown> => {
    const params: Record<string, unknown> = {};
    if (filters.search) params.search = filters.search;
    if (filters.strategy_type) params.strategy_type = filters.strategy_type;
    if (filters.risk_profile) params.risk_profile = filters.risk_profile;
    if (filters.is_active) params.is_active = filters.is_active === "true";
    return params;
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (strategy: Strategy) => (
        <span className="text-white font-medium">{strategy.name}</span>
      ),
    },
    {
      key: "strategy_type",
      header: "Type",
      render: (strategy: Strategy) => (
        <Badge>
          {strategy.strategy_type.charAt(0).toUpperCase() + strategy.strategy_type.slice(1)}
        </Badge>
      ),
    },
    {
      key: "risk_profile",
      header: "Risk",
      render: (strategy: Strategy) => (
        <Badge variant={riskVariant[strategy.risk_profile]}>
          {strategy.risk_profile.charAt(0).toUpperCase() + strategy.risk_profile.slice(1)}
        </Badge>
      ),
    },
    {
      key: "allocation_pct",
      header: "Allocation %",
      render: (strategy: Strategy) => (
        <span className="text-gray-300">{strategy.allocation_pct}%</span>
      ),
    },
    {
      key: "leverage_limit",
      header: "Leverage",
      render: (strategy: Strategy) => (
        <span className="text-gray-300">{strategy.leverage_limit}x</span>
      ),
    },
    {
      key: "is_active",
      header: "Active",
      render: (strategy: Strategy) => (
        <StatusBadge status={strategy.is_active ? "active" : "inactive"} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (strategy: Strategy) => (
        <div className="flex items-center gap-2">
          {strategy.is_active && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setConfirmAction({ type: "deactivate", strategy })}
            >
              <Power className="h-3 w-3" />
              Deactivate
            </Button>
          )}
          <Button
            size="sm"
            variant="danger"
            onClick={() => setConfirmAction({ type: "delete", strategy })}
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Strategies</h1>
          <p className="text-sm text-gray-400 mt-1">
            View and manage all user trading strategies
          </p>
        </div>

        {/* Filters */}
        <FilterBar
          filters={[
            {
              key: "search",
              label: "Search",
              type: "search",
              placeholder: "Search by name...",
            },
            {
              key: "strategy_type",
              label: "Type",
              type: "select",
              options: typeOptions,
            },
            {
              key: "risk_profile",
              label: "Risk",
              type: "select",
              options: riskOptions,
            },
            {
              key: "is_active",
              label: "Active",
              type: "select",
              options: activeOptions,
            },
          ]}
          values={filters}
          onChange={handleFilterChange}
        />

        {/* Table */}
        <Table<Strategy>
          columns={columns}
          data={strategies}
          loading={loading}
          emptyMessage="No strategies found"
        />

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={handleConfirm}
          title={
            confirmAction?.type === "deactivate"
              ? "Deactivate Strategy"
              : "Delete Strategy"
          }
          message={
            confirmAction?.type === "deactivate"
              ? `Are you sure you want to deactivate "${confirmAction.strategy.name}"? This will stop all trading activity for this strategy.`
              : `Are you sure you want to permanently delete "${confirmAction?.strategy.name}"? This action cannot be undone.`
          }
          confirmText={confirmAction?.type === "deactivate" ? "Deactivate" : "Delete"}
          confirmVariant="danger"
          loading={actionLoading}
        />
      </div>
    </PageTransition>
  );
}
