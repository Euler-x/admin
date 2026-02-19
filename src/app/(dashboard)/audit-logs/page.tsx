"use client";

import { useState, useEffect, useCallback } from "react";
import PageTransition from "@/components/PageTransition";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import FilterBar from "@/components/filters/FilterBar";
import Modal from "@/components/ui/Modal";
import { PageSpinner } from "@/components/ui/Spinner";
import useAdminAuditLogs from "@/hooks/useAdminAuditLogs";
import usePagination from "@/hooks/usePagination";
import { formatDateTime, shortenAddress } from "@/lib/utils";
import type { AuditLog } from "@/types";

const resourceTypeOptions = [
  { value: "", label: "All Resources" },
  { value: "user", label: "User" },
  { value: "plan", label: "Plan" },
  { value: "subscription", label: "Subscription" },
  { value: "strategy", label: "Strategy" },
  { value: "config", label: "Config" },
  { value: "ticket", label: "Ticket" },
];

const filters = [
  {
    key: "search",
    label: "Search",
    type: "search" as const,
    placeholder: "Search by action...",
  },
  {
    key: "resource_type",
    label: "Resource Type",
    type: "select" as const,
    options: resourceTypeOptions,
  },
];

export default function AuditLogsPage() {
  const { logs, totalPages, loading, fetchLogs } = useAdminAuditLogs();
  const { page, pageSize, setPage, reset } = usePagination();
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    search: "",
    resource_type: "",
  });

  // Detail modal state
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      setFilterValues((prev) => ({ ...prev, [key]: value }));
      reset();
    },
    [reset]
  );

  useEffect(() => {
    const params: Record<string, unknown> = { page, page_size: pageSize };
    if (filterValues.resource_type) params.resource_type = filterValues.resource_type;
    if (filterValues.search) params.search = filterValues.search;
    fetchLogs(params);
  }, [page, pageSize, filterValues, fetchLogs]);

  const handleRowClick = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailOpen(true);
  };

  const columns = [
    {
      key: "action",
      header: "Action",
      render: (log: AuditLog) => <Badge variant="info">{log.action}</Badge>,
    },
    {
      key: "resource_type",
      header: "Resource Type",
      render: (log: AuditLog) => (
        <span className="text-gray-300 capitalize">{log.resource_type || "—"}</span>
      ),
    },
    {
      key: "resource_id",
      header: "Resource ID",
      render: (log: AuditLog) => (
        <span className="font-mono text-xs text-gray-400">
          {log.resource_id ? shortenAddress(log.resource_id) : "—"}
        </span>
      ),
    },
    {
      key: "user_id",
      header: "User",
      render: (log: AuditLog) => (
        <span className="font-mono text-xs text-neon">
          {log.user_id ? shortenAddress(log.user_id) : "System"}
        </span>
      ),
    },
    {
      key: "ip_address",
      header: "IP Address",
      render: (log: AuditLog) => (
        <span className="font-mono text-xs text-gray-400">{log.ip_address || "—"}</span>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      render: (log: AuditLog) => (
        <span className="text-gray-500 text-xs">{formatDateTime(log.created_at)}</span>
      ),
    },
    {
      key: "details",
      header: "Details",
      render: (log: AuditLog) => (
        <span className="text-xs text-gray-500 truncate max-w-[120px] block">
          {log.details ? JSON.stringify(log.details).slice(0, 40) + "..." : "—"}
        </span>
      ),
    },
  ];

  if (loading && logs.length === 0) return <PageSpinner />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-sm text-gray-400 mt-1">System activity and change history</p>
        </div>

        <FilterBar filters={filters} values={filterValues} onChange={handleFilterChange} />

        <Table<AuditLog>
          columns={columns}
          data={logs}
          loading={loading}
          onRowClick={handleRowClick}
          emptyMessage="No audit logs found"
        />

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Detail Modal */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Audit Log Details" size="lg">
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Action</p>
                <Badge variant="info">{selectedLog.action}</Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">User</p>
                <p className="font-mono text-sm text-neon">
                  {selectedLog.user_id ? shortenAddress(selectedLog.user_id) : "System"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Resource Type</p>
                <p className="text-sm text-gray-300 capitalize">{selectedLog.resource_type || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Resource ID</p>
                <p className="font-mono text-sm text-gray-300">{selectedLog.resource_id || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">IP Address</p>
                <p className="font-mono text-sm text-gray-300">{selectedLog.ip_address || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date</p>
                <p className="text-sm text-gray-300">{formatDateTime(selectedLog.created_at)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Details</p>
              <pre className="bg-dark-300 rounded-xl p-4 text-xs text-gray-300 overflow-auto max-h-[300px] font-mono border border-white/5">
                {selectedLog.details
                  ? JSON.stringify(selectedLog.details, null, 2)
                  : "No additional details"}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </PageTransition>
  );
}
