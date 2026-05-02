"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import FilterBar from "@/components/filters/FilterBar";
import { PageSpinner } from "@/components/ui/Spinner";
import useAdminAmbassadors from "@/hooks/useAdminAmbassadors";
import usePagination from "@/hooks/usePagination";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ActivityLog, ActivityEventType } from "@/types";
import { ArrowLeft } from "lucide-react";

const EVENT_ICONS: Record<string, string> = {
  registered:             "🎉",
  rank_changed:           "⬆️",
  commission_calculated:  "🧮",
  commission_paid:        "✅",
  bonus_awarded:          "🎁",
  bonus_paid:             "💰",
  payout_created:         "📤",
  payout_status_changed:  "🔄",
  payout_cancelled:       "❌",
  referral_joined:        "👥",
  travel_awarded:         "✈️",
  travel_status_changed:  "🗺️",
  training_completed:     "🎓",
  training_removed:       "🗑️",
  status_changed:         "🔒",
  admin_note_added:       "📝",
  pool_calculated:        "🏊",
};

const EVENT_TYPE_OPTIONS = [
  { value: "", label: "All Events" },
  { value: "registered", label: "Registered" },
  { value: "rank_changed", label: "Rank Changed" },
  { value: "commission_calculated", label: "Commission Calculated" },
  { value: "commission_paid", label: "Commission Paid" },
  { value: "bonus_awarded", label: "Bonus Awarded" },
  { value: "bonus_paid", label: "Bonus Paid" },
  { value: "payout_created", label: "Payout Created" },
  { value: "payout_status_changed", label: "Payout Status Changed" },
  { value: "payout_cancelled", label: "Payout Cancelled" },
  { value: "referral_joined", label: "Referral Joined" },
  { value: "travel_awarded", label: "Travel Awarded" },
  { value: "travel_status_changed", label: "Travel Status Changed" },
  { value: "training_completed", label: "Training Completed" },
  { value: "training_removed", label: "Training Removed" },
  { value: "status_changed", label: "Status Changed" },
  { value: "admin_note_added", label: "Admin Note Added" },
  { value: "pool_calculated", label: "Pool Calculated" },
];

const ACTOR_COLORS: Record<string, string> = {
  system: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  user:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const filters = [
  {
    key: "ambassador_id",
    label: "Ambassador ID",
    type: "search" as const,
    placeholder: "Filter by ambassador ID...",
  },
  {
    key: "event_type",
    label: "Event Type",
    type: "select" as const,
    options: EVENT_TYPE_OPTIONS,
  },
  {
    key: "date_from",
    label: "From",
    type: "search" as const,
    placeholder: "YYYY-MM-DD",
  },
  {
    key: "date_to",
    label: "To",
    type: "search" as const,
    placeholder: "YYYY-MM-DD",
  },
];

function getActorColor(actor: string) {
  if (actor.startsWith("admin:")) return "bg-neon/10 text-neon border-neon/20";
  return ACTOR_COLORS[actor] ?? ACTOR_COLORS.system;
}

function formatActor(actor: string) {
  if (actor.startsWith("admin:")) return "admin";
  return actor;
}

export default function AmbassadorActivityPage() {
  const { fetchGlobalActivity } = useAdminAmbassadors();
  const { page, pageSize, setPage, reset } = usePagination();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    ambassador_id: "",
    event_type: "",
    date_from: "",
    date_to: "",
  });

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      setFilterValues((prev) => ({ ...prev, [key]: value }));
      reset();
    },
    [reset]
  );

  const loadActivity = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, page_size: pageSize };
      if (filterValues.ambassador_id) params.ambassador_id = filterValues.ambassador_id;
      if (filterValues.event_type) params.event_type = filterValues.event_type as ActivityEventType;
      if (filterValues.date_from) params.date_from = filterValues.date_from;
      if (filterValues.date_to) params.date_to = filterValues.date_to;

      const data = await fetchGlobalActivity(params);
      setLogs(data.items);
      setTotalPages(data.total_pages);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterValues, fetchGlobalActivity]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  if (loading && logs.length === 0) return <PageSpinner />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link
              href="/ambassadors"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-neon transition-colors mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Ambassadors
            </Link>
            <h1 className="text-2xl font-bold text-white">Activity Feed</h1>
            <p className="text-sm text-gray-400 mt-1">All ambassador events and admin actions</p>
          </div>
          <Button variant="secondary" size="sm" onClick={loadActivity} loading={loading}>
            Refresh
          </Button>
        </div>

        <FilterBar filters={filters} values={filterValues} onChange={handleFilterChange} />

        <Card className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-400 text-sm">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No activity found</div>
          ) : (
            <div className="divide-y divide-white/5">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-white/5 transition-colors">
                  <span className="text-xl mt-0.5 flex-shrink-0">{EVENT_ICONS[log.event_type] ?? "•"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">{log.description}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <Link
                            href={`/ambassadors/${log.ambassador_id}`}
                            className="text-xs text-neon hover:underline font-mono"
                          >
                            {log.ambassador_id.slice(0, 8)}...
                          </Link>
                          <span className="text-xs text-gray-500">{formatDate(log.created_at)}</span>
                          <Badge className={getActorColor(log.actor)}>
                            {formatActor(log.actor)}
                          </Badge>
                          {log.amount !== null && (
                            <span className="text-xs text-neon font-medium">{formatCurrency(log.amount)}</span>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-white/5 text-gray-400 border-white/10 text-xs whitespace-nowrap">
                        {log.event_type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </PageTransition>
  );
}
