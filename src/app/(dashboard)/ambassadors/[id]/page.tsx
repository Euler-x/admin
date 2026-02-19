"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { PageSpinner } from "@/components/ui/Spinner";
import useAdminAmbassadors from "@/hooks/useAdminAmbassadors";
import { formatCurrency, formatDate, shortenAddress } from "@/lib/utils";
import type { Ambassador, AmbassadorRank, AmbassadorUpdate } from "@/types";
import { ArrowLeft } from "lucide-react";

const rankOptions = [
  { value: "bronze", label: "Bronze" },
  { value: "silver", label: "Silver" },
  { value: "gold", label: "Gold" },
  { value: "platinum", label: "Platinum" },
  { value: "diamond", label: "Diamond" },
];

const rankColorMap: Record<AmbassadorRank, string> = {
  diamond: "bg-neon/20 text-neon border-neon/30",
  platinum: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  gold: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  silver: "bg-gray-400/10 text-gray-300 border-gray-400/20",
  bronze: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export default function AmbassadorDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { getAmbassador, updateAmbassador } = useAdminAmbassadors();

  const [ambassador, setAmbassador] = useState<Ambassador | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AmbassadorUpdate>({
    rank: undefined,
    rewards_earned: undefined,
    team_size: undefined,
    total_referrals: undefined,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAmbassador(id);
        setAmbassador(data);
        setForm({
          rank: data.rank,
          rewards_earned: data.rewards_earned,
          team_size: data.team_size,
          total_referrals: data.total_referrals,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, getAmbassador]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateAmbassador(id, form);
      setAmbassador(updated);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageSpinner />;
  if (!ambassador) {
    return (
      <PageTransition>
        <div className="text-center py-20">
          <p className="text-gray-400">Ambassador not found</p>
          <Link href="/ambassadors" className="text-neon hover:underline text-sm mt-2 inline-block">
            Back to Ambassadors
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Back Link */}
        <Link
          href="/ambassadors"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-neon transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Ambassadors
        </Link>

        {/* Ambassador Info Card */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Ambassador Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">User ID</p>
              <p className="font-mono text-sm text-neon">{shortenAddress(ambassador.user_id)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Rank</p>
              <Badge className={rankColorMap[ambassador.rank]}>
                {ambassador.rank.charAt(0).toUpperCase() + ambassador.rank.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Referral Code</p>
              <p className="font-mono text-sm text-gray-300">{ambassador.referral_code}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Team Size</p>
              <p className="text-sm text-white font-medium">{ambassador.team_size}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Referrals</p>
              <p className="text-sm text-white font-medium">{ambassador.total_referrals}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Rewards Earned</p>
              <p className="text-sm text-neon font-medium">{formatCurrency(ambassador.rewards_earned)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Joined</p>
              <p className="text-sm text-gray-400">{formatDate(ambassador.created_at)}</p>
            </div>
          </div>
        </Card>

        {/* Edit Form */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Edit Ambassador</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Rank"
              options={rankOptions}
              value={form.rank || ""}
              onChange={(e) => setForm((f) => ({ ...f, rank: e.target.value as AmbassadorRank }))}
            />
            <Input
              label="Rewards Earned"
              type="number"
              step="0.01"
              min="0"
              value={form.rewards_earned ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, rewards_earned: e.target.value ? Number(e.target.value) : undefined }))
              }
            />
            <Input
              label="Team Size"
              type="number"
              min="0"
              value={form.team_size ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, team_size: e.target.value ? Number(e.target.value) : undefined }))
              }
            />
            <Input
              label="Total Referrals"
              type="number"
              min="0"
              value={form.total_referrals ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, total_referrals: e.target.value ? Number(e.target.value) : undefined }))
              }
            />
          </div>
          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
}
