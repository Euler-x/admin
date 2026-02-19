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
import type { Ambassador, AmbassadorRank } from "@/types";
import { Eye } from "lucide-react";

const rankOptions = [
  { value: "", label: "All Ranks" },
  { value: "bronze", label: "Bronze" },
  { value: "silver", label: "Silver" },
  { value: "gold", label: "Gold" },
  { value: "platinum", label: "Platinum" },
  { value: "diamond", label: "Diamond" },
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
];

const rankVariantMap: Record<AmbassadorRank, "neon" | "info" | "warning" | "default" | "danger"> = {
  diamond: "neon",
  platinum: "info",
  gold: "warning",
  silver: "default",
  bronze: "warning",
};

const rankColorMap: Record<AmbassadorRank, string> = {
  diamond: "bg-neon/20 text-neon border-neon/30",
  platinum: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  gold: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  silver: "bg-gray-400/10 text-gray-300 border-gray-400/20",
  bronze: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

const columns = [
  {
    key: "user_id",
    header: "User",
    render: (a: Ambassador) => (
      <span className="font-mono text-xs text-neon">{shortenAddress(a.user_id)}</span>
    ),
  },
  {
    key: "rank",
    header: "Rank",
    render: (a: Ambassador) => (
      <Badge className={rankColorMap[a.rank]}>
        {a.rank.charAt(0).toUpperCase() + a.rank.slice(1)}
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
    key: "team_size",
    header: "Team Size",
    render: (a: Ambassador) => <span className="text-gray-300">{a.team_size}</span>,
  },
  {
    key: "total_referrals",
    header: "Total Referrals",
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
  const { ambassadors, totalPages, loading, fetchAmbassadors } = useAdminAmbassadors();
  const { page, pageSize, setPage, reset } = usePagination();
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    search: "",
    rank: "",
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
    if (filterValues.rank) params.rank = filterValues.rank as AmbassadorRank;
    if (filterValues.search) params.search = filterValues.search;
    fetchAmbassadors(params);
  }, [page, pageSize, filterValues, fetchAmbassadors]);

  if (loading && ambassadors.length === 0) return <PageSpinner />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Ambassadors</h1>
          <p className="text-sm text-gray-400 mt-1">Manage ambassador program members</p>
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
