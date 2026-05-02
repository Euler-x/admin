"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import FilterBar from "@/components/filters/FilterBar";
import { PageSpinner } from "@/components/ui/Spinner";
import useAdminAmbassadors from "@/hooks/useAdminAmbassadors";
import usePagination from "@/hooks/usePagination";
import { formatCurrency, shortenAddress } from "@/lib/utils";
import type { Ambassador, AmbassadorRank, AmbassadorStatus } from "@/types";
import { Activity, BarChart2, Eye, Play, RefreshCw, Users } from "lucide-react";

const RANK_INFO: Record<AmbassadorRank, { label: string; color: string }> = {
  associate:        { label: "Associate",        color: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
  bronze_leader:    { label: "Bronze Leader",    color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  silver_leader:    { label: "Silver Leader",    color: "bg-gray-300/10 text-gray-200 border-gray-300/20" },
  gold_leader:      { label: "Gold Leader",      color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  platinum_leader:  { label: "Platinum Leader",  color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  diamond_leader:   { label: "Diamond Leader",   color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  elite_diamond:    { label: "Elite Diamond",    color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  black_diamond:    { label: "Black Diamond",    color: "bg-slate-400/10 text-slate-300 border-slate-400/20" },
  crown_ambassador: { label: "Crown Ambassador", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  grand_crown:      { label: "Grand Crown",      color: "bg-neon/20 text-neon border-neon/30" },
};

const STATUS_COLORS: Record<AmbassadorStatus, string> = {
  active:       "bg-green-500/10 text-green-400 border-green-500/20",
  suspended:    "bg-red-500/10 text-red-400 border-red-500/20",
  under_review: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

const rankOptions = [
  { value: "", label: "All Ranks" },
  { value: "associate", label: "Associate" },
  { value: "bronze_leader", label: "Bronze Leader" },
  { value: "silver_leader", label: "Silver Leader" },
  { value: "gold_leader", label: "Gold Leader" },
  { value: "platinum_leader", label: "Platinum Leader" },
  { value: "diamond_leader", label: "Diamond Leader" },
  { value: "elite_diamond", label: "Elite Diamond" },
  { value: "black_diamond", label: "Black Diamond" },
  { value: "crown_ambassador", label: "Crown Ambassador" },
  { value: "grand_crown", label: "Grand Crown" },
];

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "under_review", label: "Under Review" },
];

const filters = [
  {
    key: "search",
    label: "Search",
    type: "search" as const,
    placeholder: "Search ambassadors...",
  },
  {
    key: "rank",
    label: "Rank",
    type: "select" as const,
    options: rankOptions,
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
    key: "user_id",
    header: "User",
    render: (a: Ambassador) => (
      <div>
        <p className="font-mono text-xs text-neon">{shortenAddress(a.user_id)}</p>
        {(a.masked_email ?? a.email) && <p className="text-xs text-gray-500 mt-0.5">{a.masked_email ?? a.email}</p>}
      </div>
    ),
  },
  {
    key: "rank",
    header: "Rank",
    render: (a: Ambassador) => (
      <Badge className={RANK_INFO[a.rank]?.color ?? ""}>
        {RANK_INFO[a.rank]?.label ?? a.rank}
      </Badge>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (a: Ambassador) => (
      <Badge className={STATUS_COLORS[a.status] ?? STATUS_COLORS.active}>
        {a.status?.replace(/_/g, " ") ?? "active"}
      </Badge>
    ),
  },
  {
    key: "referral_code",
    header: "Referral Code",
    render: (a: Ambassador) => (
      <span className="font-mono text-xs text-gray-300">{a.referral_code}</span>
    ),
  },
  {
    key: "par_tav",
    header: "PAR / TAV",
    render: (a: Ambassador) => (
      <span className="text-gray-300">
        {a.par_count} / {a.tav_count}
      </span>
    ),
  },
  {
    key: "total_referrals",
    header: "Referrals",
    render: (a: Ambassador) => <span className="text-gray-300">{a.total_referrals}</span>,
  },
  {
    key: "rewards_earned",
    header: "Rewards",
    render: (a: Ambassador) => (
      <span className="text-white font-medium">{formatCurrency(a.rewards_earned)}</span>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    render: (a: Ambassador) => (
      <Link href={`/ambassadors/${a.id}`}>
        <Button size="sm" variant="secondary">
          <Eye className="h-3.5 w-3.5" />
          View
        </Button>
      </Link>
    ),
  },
];

export default function AmbassadorsPage() {
  const { ambassadors, totalPages, loading, fetchAmbassadors, runMonthlyCycle, recalculateCommissions, evaluateAll } =
    useAdminAmbassadors();
  const { page, pageSize, setPage, reset } = usePagination();
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    search: "",
    rank: "",
    status: "",
  });
  const [cycling, setCycling] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      setFilterValues((prev) => ({ ...prev, [key]: value }));
      reset();
    },
    [reset]
  );

  useEffect(() => {
    const params: Record<string, unknown> = { page, page_size: pageSize };
    if (filterValues.rank) params.rank = filterValues.rank as AmbassadorRank;
    if (filterValues.search) params.search = filterValues.search;
    if (filterValues.status) params.status = filterValues.status;
    fetchAmbassadors(params);
  }, [page, pageSize, filterValues, fetchAmbassadors]);

  const handleRunCycle = async () => {
    const now = new Date();
    setCycling(true);
    try {
      await runMonthlyCycle(now.getMonth() + 1, now.getFullYear());
    } finally {
      setCycling(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await recalculateCommissions();
    } finally {
      setRecalculating(false);
    }
  };

  const handleEvaluateAll = async () => {
    setEvaluating(true);
    try {
      await evaluateAll();
    } finally {
      setEvaluating(false);
    }
  };

  if (loading && ambassadors.length === 0) return <PageSpinner />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">Ambassadors</h1>
            <p className="text-sm text-gray-400 mt-1">Manage ambassador programme members</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/ambassadors/activity">
              <Button variant="secondary" size="sm">
                <Activity className="h-3.5 w-3.5" />
                Activity Feed
              </Button>
            </Link>
            <Link href="/ambassadors/analytics">
              <Button variant="secondary" size="sm">
                <BarChart2 className="h-3.5 w-3.5" />
                Analytics
              </Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={handleEvaluateAll} loading={evaluating}>
              <Users className="h-3.5 w-3.5" />
              Evaluate All
            </Button>
            <Button variant="secondary" size="sm" onClick={handleRecalculate} loading={recalculating}>
              <RefreshCw className="h-3.5 w-3.5" />
              Recalculate
            </Button>
            <Button size="sm" onClick={handleRunCycle} loading={cycling}>
              <Play className="h-3.5 w-3.5" />
              Run Monthly Cycle
            </Button>
          </div>
        </div>

        <FilterBar filters={filters} values={filterValues} onChange={handleFilterChange} />

        <Table<Ambassador>
          columns={columns}
          data={ambassadors}
          loading={loading}
          emptyMessage="No ambassadors found"
        />

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </PageTransition>
  );
}
