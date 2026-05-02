"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { PageSpinner } from "@/components/ui/Spinner";
import useAdminAmbassadors from "@/hooks/useAdminAmbassadors";
import { formatCurrency, shortenAddress } from "@/lib/utils";
import type { AmbassadorAnalytics, AmbassadorRank } from "@/types";
import { ArrowLeft, RefreshCw } from "lucide-react";

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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const now = new Date();

export default function AmbassadorAnalyticsPage() {
  const { fetchAmbassadorAnalytics } = useAdminAmbassadors();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [analytics, setAnalytics] = useState<AmbassadorAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAmbassadorAnalytics(month, year);
      setAnalytics(data);
    } finally {
      setLoading(false);
    }
  }, [month, year, fetchAmbassadorAnalytics]);

  useEffect(() => {
    load();
  }, [load]);

  const monthOptions = MONTHS.map((m, i) => (
    <option key={i + 1} value={i + 1}>{m}</option>
  ));

  const yearOptions = [];
  for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) {
    yearOptions.push(<option key={y} value={y}>{y}</option>);
  }

  if (loading && !analytics) return <PageSpinner />;

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
            <h1 className="text-2xl font-bold text-white">Ambassador Analytics</h1>
            <p className="text-sm text-gray-400 mt-1">Monthly programme metrics and performance</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            >
              {monthOptions}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="bg-dark-200 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
            >
              {yearOptions}
            </select>
            <Button variant="secondary" size="sm" onClick={load} loading={loading}>
              <RefreshCw className="h-3.5 w-3.5" />
              Load
            </Button>
          </div>
        </div>

        {analytics && (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Commissions</p>
                <p className="text-xl font-bold text-neon">{formatCurrency(analytics.total_commissions_this_month)}</p>
                <p className="text-xs text-gray-600 mt-1">this month</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bonuses</p>
                <p className="text-xl font-bold text-neon">{formatCurrency(analytics.total_bonuses_this_month)}</p>
                <p className="text-xs text-gray-600 mt-1">this month</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pool</p>
                <p className="text-xl font-bold text-neon">{formatCurrency(analytics.pool_amount_this_month)}</p>
                <p className="text-xs text-gray-600 mt-1">leadership pool</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pending Payouts</p>
                <p className="text-xl font-bold text-white">{analytics.pending_payouts_count}</p>
                <p className="text-xs text-gray-600 mt-1">{formatCurrency(analytics.pending_payouts_amount)}</p>
              </Card>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              <Card className="p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">New Ambassadors</p>
                <p className="text-2xl font-bold text-white">{analytics.new_ambassadors_this_month}</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">New Referrals</p>
                <p className="text-2xl font-bold text-white">{analytics.new_referrals_this_month}</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rank Distribution */}
              <Card className="p-6">
                <h3 className="text-base font-semibold text-white mb-4">Rank Distribution</h3>
                {analytics.rank_distribution.length === 0 ? (
                  <p className="text-gray-400 text-sm">No data</p>
                ) : (
                  <div className="space-y-2">
                    {analytics.rank_distribution.map((item) => {
                      const total = analytics.rank_distribution.reduce((s, r) => s + r.count, 0);
                      const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                      return (
                        <div key={item.rank} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Badge className={RANK_INFO[item.rank]?.color ?? ""}>
                                {RANK_INFO[item.rank]?.label ?? item.rank}
                              </Badge>
                            </div>
                            <span className="text-white font-medium">{item.count} <span className="text-gray-500 font-normal text-xs">({pct}%)</span></span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-neon/60 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* Top Earners */}
              <Card className="p-6">
                <h3 className="text-base font-semibold text-white mb-4">Top Earners</h3>
                {analytics.top_earners.length === 0 ? (
                  <p className="text-gray-400 text-sm">No data</p>
                ) : (
                  <div className="space-y-2">
                    {analytics.top_earners.map((earner, idx) => (
                      <div key={earner.ambassador_id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-600">#{idx + 1}</span>
                          <div>
                            <Link
                              href={`/ambassadors/${earner.ambassador_id}`}
                              className="text-xs text-neon hover:underline font-mono"
                            >
                              {shortenAddress(earner.ambassador_id)}
                            </Link>
                            {earner.masked_email && (
                              <p className="text-xs text-gray-500">{earner.masked_email}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={RANK_INFO[earner.rank]?.color ?? ""}>
                            {RANK_INFO[earner.rank]?.label ?? earner.rank}
                          </Badge>
                          <span className="text-neon font-semibold text-sm">
                            {formatCurrency(earner.commission_amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </>
        )}

        {!analytics && !loading && (
          <Card className="p-12 text-center">
            <p className="text-gray-400">Select a month and year to load analytics</p>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
