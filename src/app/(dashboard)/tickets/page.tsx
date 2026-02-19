"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import FilterBar from "@/components/filters/FilterBar";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import useAdminTickets from "@/hooks/useAdminTickets";
import usePagination from "@/hooks/usePagination";
import { formatDate } from "@/lib/utils";
import type { SupportTicket, TicketStatus, TicketPriority } from "@/types";

const priorityVariant: Record<TicketPriority, "danger" | "warning" | "warning" | "success"> = {
  urgent: "danger",
  high: "warning",
  medium: "warning",
  low: "success",
};

const priorityLabel: Record<TicketPriority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const statusOptions = [
  { value: "", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const priorityOptions = [
  { value: "", label: "All" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function TicketsPage() {
  const { tickets, totalPages, loading, fetchTickets } = useAdminTickets();
  const { page, pageSize, setPage, reset } = usePagination();
  const [filters, setFilters] = useState<Record<string, string>>({
    search: "",
    status: "",
    priority: "",
  });

  useEffect(() => {
    const params: Record<string, unknown> = {
      page,
      page_size: pageSize,
    };
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;

    fetchTickets(params);
  }, [page, pageSize, filters, fetchTickets]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    reset();
  };

  const columns = [
    {
      key: "subject",
      header: "Subject",
      render: (ticket: SupportTicket) => (
        <span className="text-white font-medium">{ticket.subject}</span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (ticket: SupportTicket) => (
        <Badge variant={priorityVariant[ticket.priority]}>
          {priorityLabel[ticket.priority]}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (ticket: SupportTicket) => (
        <StatusBadge status={ticket.status} />
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (ticket: SupportTicket) => (
        <span className="text-gray-400">{formatDate(ticket.created_at)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (ticket: SupportTicket) => (
        <Link
          href={`/tickets/${ticket.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-neon hover:text-neon/80 transition-colors"
        >
          <Eye className="h-4 w-4" />
          View
        </Link>
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Support Tickets</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage and respond to user support requests
          </p>
        </div>

        {/* Filters */}
        <FilterBar
          filters={[
            {
              key: "search",
              label: "Search",
              type: "search",
              placeholder: "Search by subject...",
            },
            {
              key: "status",
              label: "Status",
              type: "select",
              options: statusOptions,
            },
            {
              key: "priority",
              label: "Priority",
              type: "select",
              options: priorityOptions,
            },
          ]}
          values={filters}
          onChange={handleFilterChange}
        />

        {/* Table */}
        <Table<SupportTicket>
          columns={columns}
          data={tickets}
          loading={loading}
          emptyMessage="No support tickets found"
        />

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </PageTransition>
  );
}
