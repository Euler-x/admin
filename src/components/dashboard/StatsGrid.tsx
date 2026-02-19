"use client";

import { DollarSign, Users, Crown, Activity } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { RevenueAnalytics, UserAnalytics, ExecutionAnalytics } from "@/types";

interface StatsGridProps {
  revenue: RevenueAnalytics | null;
  userStats: UserAnalytics | null;
  executionStats: ExecutionAnalytics | null;
}

interface StatCardProps {
  title: string;
  value: string | null;
  icon: React.ReactNode;
  iconBg: string;
}

function StatCardSkeleton() {
  return (
    <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-24 bg-white/5 rounded" />
        <div className="h-10 w-10 bg-white/5 rounded-xl" />
      </div>
      <div className="h-8 w-32 bg-white/5 rounded mt-2" />
    </div>
  );
}

function StatCard({ title, value, icon, iconBg }: StatCardProps) {
  if (value === null) return <StatCardSkeleton />;

  return (
    <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6 transition-all duration-200 hover:border-neon/10 hover:shadow-neon-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-400 font-medium">{title}</span>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    </div>
  );
}

export default function StatsGrid({ revenue, userStats, executionStats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Revenue"
        value={revenue ? formatCurrency(revenue.total_revenue_usd) : null}
        icon={<DollarSign className="h-5 w-5 text-neon" />}
        iconBg="bg-neon/10"
      />
      <StatCard
        title="Total Users"
        value={userStats ? formatNumber(userStats.total_users, 0) : null}
        icon={<Users className="h-5 w-5 text-blue-400" />}
        iconBg="bg-blue-500/10"
      />
      <StatCard
        title="Active Subscriptions"
        value={revenue ? formatNumber(revenue.active_subscriptions, 0) : null}
        icon={<Crown className="h-5 w-5 text-yellow-400" />}
        iconBg="bg-yellow-500/10"
      />
      <StatCard
        title="Total Executions"
        value={executionStats ? formatNumber(executionStats.total_executions, 0) : null}
        icon={<Activity className="h-5 w-5 text-purple-400" />}
        iconBg="bg-purple-500/10"
      />
    </div>
  );
}
