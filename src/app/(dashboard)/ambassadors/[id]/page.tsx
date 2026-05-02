"use client";

import { useState, useEffect, useCallback } from "react";
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
import type {
  ActivityLog,
  Ambassador,
  AmbassadorBonus,
  AmbassadorCommission,
  AmbassadorPayout,
  AmbassadorRank,
  AmbassadorStatus,
  BonusType,
  CommissionStatus,
  DownlineNode,
  DownlineResponse,
  PayoutStatus,
  TravelIncentive,
  TravelStatus,
} from "@/types";
import { ArrowLeft, ChevronDown, ChevronUp, RefreshCw, Trash2, Edit2, CheckCircle, X } from "lucide-react";

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

const RANK_ORDER: AmbassadorRank[] = [
  "associate", "bronze_leader", "silver_leader", "gold_leader", "platinum_leader",
  "diamond_leader", "elite_diamond", "black_diamond", "crown_ambassador", "grand_crown",
];

const rankSelectOptions = RANK_ORDER.map((r) => ({
  value: r,
  label: RANK_INFO[r].label,
}));

const BONUS_TYPE_LABELS: Record<BonusType, string> = {
  rank_advancement:      "Rank Advancement",
  performance_milestone: "Performance Milestone",
  fast_start:            "Fast Start",
  loyalty_retention:     "Loyalty Retention",
  leadership_pool:       "Leadership Pool",
  generational_override: "Generational Override",
};

const COMM_STATUS_COLORS: Record<CommissionStatus, string> = {
  pending:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  paid:      "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const PAYOUT_STATUS_COLORS: Record<PayoutStatus, string> = {
  pending:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  paid:       "bg-green-500/10 text-green-400 border-green-500/20",
  failed:     "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled:  "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const TRAVEL_STATUS_COLORS: Record<TravelStatus, string> = {
  qualifying: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  qualified:  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  awarded:    "bg-green-500/10 text-green-400 border-green-500/20",
  expired:    "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

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

type Tab = "overview" | "commissions" | "bonuses" | "payouts" | "travel" | "activity" | "network";

export default function AmbassadorDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const {
    getAmbassador,
    updateAmbassador,
    promoteAmbassador,
    evaluateRank,
    createBonus,
    updateBonus,
    createPayout,
    cancelPayout,
    fetchAmbassadorCommissions,
    updateCommission,
    fetchAmbassadorBonuses,
    fetchAmbassadorPayouts,
    fetchTravel,
    awardTravel,
    updateTravel,
    fetchAmbassadorActivity,
    fetchDownline,
  } = useAdminAmbassadors();

  const [ambassador, setAmbassador] = useState<Ambassador | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Per-tab data
  const [commissions, setCommissions] = useState<AmbassadorCommission[]>([]);
  const [bonuses, setBonuses] = useState<AmbassadorBonus[]>([]);
  const [payouts, setPayouts] = useState<AmbassadorPayout[]>([]);
  const [travel, setTravel] = useState<TravelIncentive[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [downline, setDownline] = useState<DownlineResponse | null>(null);
  const [tabLoading, setTabLoading] = useState(false);
  const [expandedCommission, setExpandedCommission] = useState<string | null>(null);

  // Promote form
  const [promoteRank, setPromoteRank] = useState<AmbassadorRank>("associate");
  const [promoting, setPromoting] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  // Status / notes form
  const [editingStatus, setEditingStatus] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: "active" as AmbassadorStatus, admin_notes: "" });
  const [savingStatus, setSavingStatus] = useState(false);

  // Bonus form
  const [bonusForm, setBonusForm] = useState({ bonus_type: "rank_advancement" as BonusType, amount: "", description: "", period: "" });
  const [creatingBonus, setCreatingBonus] = useState(false);

  // Bonus override
  const [bonusEdit, setBonusEdit] = useState<{ id: string; status: CommissionStatus; amount: string; description: string } | null>(null);
  const [savingBonus, setSavingBonus] = useState(false);

  // Payout form
  const [payoutNotes, setPayoutNotes] = useState("");
  const [creatingPayout, setCreatingPayout] = useState(false);

  // Commission override
  const [commissionEdit, setCommissionEdit] = useState<{ id: string; status: CommissionStatus; amount: string } | null>(null);
  const [savingCommission, setSavingCommission] = useState(false);

  // Travel form
  const [travelNotes, setTravelNotes] = useState("");
  const [awardingTravel, setAwardingTravel] = useState(false);
  const [travelUpdate, setTravelUpdate] = useState<{ id: string; status: TravelStatus; admin_notes: string } | null>(null);
  const [updatingTravel, setUpdatingTravel] = useState(false);

  // Downline depth
  const [downlineDepth, setDownlineDepth] = useState(3);
  const [loadingDownline, setLoadingDownline] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAmbassador(id);
        setAmbassador(data);
        setPromoteRank(data.rank);
        setStatusForm({ status: data.status ?? "active", admin_notes: data.admin_notes ?? "" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, getAmbassador]);

  const loadTabData = useCallback(
    async (tab: Tab) => {
      setTabLoading(true);
      try {
        if (tab === "commissions") {
          const d = await fetchAmbassadorCommissions(id);
          setCommissions(d.items);
        } else if (tab === "bonuses") {
          const d = await fetchAmbassadorBonuses(id);
          setBonuses(d.items);
        } else if (tab === "payouts") {
          const d = await fetchAmbassadorPayouts(id);
          setPayouts(d.items);
        } else if (tab === "travel") {
          const d = await fetchTravel(id);
          setTravel(d);
        } else if (tab === "activity") {
          const d = await fetchAmbassadorActivity(id);
          setActivity(d.items);
        } else if (tab === "network") {
          setLoadingDownline(true);
          const d = await fetchDownline(id, downlineDepth);
          setDownline(d);
          setLoadingDownline(false);
        }
      } finally {
        setTabLoading(false);
      }
    },
    [id, fetchAmbassadorCommissions, fetchAmbassadorBonuses, fetchAmbassadorPayouts, fetchTravel, fetchAmbassadorActivity, fetchDownline, downlineDepth]
  );

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab !== "overview") loadTabData(tab);
  };

  const handlePromote = async () => {
    setPromoting(true);
    try {
      const result = await promoteAmbassador(id, promoteRank);
      setAmbassador(result.ambassador);
    } finally {
      setPromoting(false);
    }
  };

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const result = await evaluateRank(id);
      if (result.changed) {
        const updated = await getAmbassador(id);
        setAmbassador(updated);
      }
    } finally {
      setEvaluating(false);
    }
  };

  const handleSaveStatus = async () => {
    setSavingStatus(true);
    try {
      const updated = await updateAmbassador(id, statusForm);
      setAmbassador(updated);
      setEditingStatus(false);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleCreateBonus = async () => {
    if (!bonusForm.amount) return;
    setCreatingBonus(true);
    try {
      const bonus = await createBonus(id, {
        bonus_type: bonusForm.bonus_type,
        amount: Number(bonusForm.amount),
        description: bonusForm.description || undefined,
        period: bonusForm.period || undefined,
      });
      setBonuses((prev) => [bonus, ...prev]);
      setBonusForm({ bonus_type: "rank_advancement", amount: "", description: "", period: "" });
    } finally {
      setCreatingBonus(false);
    }
  };

  const handleSaveBonus = async () => {
    if (!bonusEdit) return;
    setSavingBonus(true);
    try {
      const updated = await updateBonus(id, bonusEdit.id, {
        status: bonusEdit.status,
        amount: bonusEdit.amount ? Number(bonusEdit.amount) : undefined,
        description: bonusEdit.description || undefined,
      });
      setBonuses((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setBonusEdit(null);
    } finally {
      setSavingBonus(false);
    }
  };

  const handleCreatePayout = async () => {
    setCreatingPayout(true);
    try {
      const payout = await createPayout(id, payoutNotes || undefined);
      setPayouts((prev) => [payout, ...prev]);
      setPayoutNotes("");
      const updated = await getAmbassador(id);
      setAmbassador(updated);
    } finally {
      setCreatingPayout(false);
    }
  };

  const handleCancelPayout = async (payoutId: string) => {
    if (!confirm("Cancel this payout? Commissions and bonuses will return to pending.")) return;
    await cancelPayout(id, payoutId);
    const d = await fetchAmbassadorPayouts(id);
    setPayouts(d.items);
  };

  const handleSaveCommission = async () => {
    if (!commissionEdit) return;
    setSavingCommission(true);
    try {
      const updated = await updateCommission(id, commissionEdit.id, {
        status: commissionEdit.status,
        commission_amount: commissionEdit.amount ? Number(commissionEdit.amount) : undefined,
      });
      setCommissions((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setCommissionEdit(null);
    } finally {
      setSavingCommission(false);
    }
  };

  const handleAwardTravel = async () => {
    setAwardingTravel(true);
    try {
      const incentive = await awardTravel(id, {
        admin_notes: travelNotes || undefined,
      });
      setTravel((prev) => {
        const idx = prev.findIndex((t) => t.id === incentive.id);
        return idx >= 0 ? prev.map((t, i) => (i === idx ? incentive : t)) : [incentive, ...prev];
      });
      setTravelNotes("");
    } finally {
      setAwardingTravel(false);
    }
  };

  const handleUpdateTravel = async () => {
    if (!travelUpdate) return;
    setUpdatingTravel(true);
    try {
      const updated = await updateTravel(id, travelUpdate.id, {
        status: travelUpdate.status,
        admin_notes: travelUpdate.admin_notes || undefined,
      });
      setTravel((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setTravelUpdate(null);
    } finally {
      setUpdatingTravel(false);
    }
  };

  const handleLoadDownline = async () => {
    setLoadingDownline(true);
    try {
      const d = await fetchDownline(id, downlineDepth);
      setDownline(d);
    } finally {
      setLoadingDownline(false);
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

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "commissions", label: "Commissions" },
    { key: "bonuses", label: "Bonuses" },
    { key: "payouts", label: "Payouts" },
    { key: "travel", label: "Travel" },
    { key: "activity", label: "Activity" },
    { key: "network", label: "Network" },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <Link
          href="/ambassadors"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-neon transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Ambassadors
        </Link>

        {/* Header */}
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <Badge className={RANK_INFO[ambassador.rank]?.color ?? ""}>
                  {RANK_INFO[ambassador.rank]?.label ?? ambassador.rank}
                </Badge>
                <Badge className={STATUS_COLORS[ambassador.status] ?? STATUS_COLORS.active}>
                  {ambassador.status?.replace(/_/g, " ") ?? "active"}
                </Badge>
                <span className="font-mono text-sm text-neon">{shortenAddress(ambassador.user_id)}</span>
              </div>
              {(ambassador.masked_email ?? ambassador.email) && <p className="text-sm text-gray-400">{ambassador.masked_email ?? ambassador.email}</p>}
              <p className="text-xs text-gray-500 mt-1">Joined {formatDate(ambassador.created_at)}</p>
              {ambassador.admin_notes && (
                <p className="text-xs text-yellow-400/80 mt-1 italic">Note: {ambassador.admin_notes}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-neon">{formatCurrency(ambassador.rewards_earned)}</p>
              <p className="text-xs text-gray-500">Total Rewards</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">PAR</p>
              <p className="text-lg font-semibold text-white">{ambassador.par_count}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">TAV</p>
              <p className="text-lg font-semibold text-white">{ambassador.tav_count}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Referrals</p>
              <p className="text-lg font-semibold text-white">{ambassador.total_referrals}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Fast Start</p>
              <p className="text-lg font-semibold text-white">{ambassador.fast_start_claimed} / 3</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Referral Code</p>
              <p className="font-mono text-sm text-gray-300">{ambassador.referral_code}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payout Address</p>
              <p className="font-mono text-sm text-gray-300">
                {ambassador.payout_address ? shortenAddress(ambassador.payout_address) : "—"}
              </p>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 bg-black/20 rounded-lg p-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === t.key
                  ? "bg-neon/10 text-neon border border-neon/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status / Admin Control */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white">Ambassador Status</h3>
                {!editingStatus && (
                  <button onClick={() => setEditingStatus(true)} className="text-xs text-neon hover:underline flex items-center gap-1">
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                )}
              </div>
              {editingStatus ? (
                <div className="space-y-3">
                  <Select
                    label="Status"
                    options={[
                      { value: "active", label: "Active" },
                      { value: "suspended", label: "Suspended" },
                      { value: "under_review", label: "Under Review" },
                    ]}
                    value={statusForm.status}
                    onChange={(e) => setStatusForm((f) => ({ ...f, status: e.target.value as AmbassadorStatus }))}
                  />
                  <Input
                    label="Admin Notes"
                    placeholder="Internal notes (not visible to ambassador)"
                    value={statusForm.admin_notes}
                    onChange={(e) => setStatusForm((f) => ({ ...f, admin_notes: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveStatus} loading={savingStatus}>
                      <CheckCircle className="h-3.5 w-3.5" />
                      Save
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditingStatus(false)}>
                      <X className="h-3.5 w-3.5" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={STATUS_COLORS[ambassador.status] ?? STATUS_COLORS.active}>
                      {ambassador.status?.replace(/_/g, " ") ?? "active"}
                    </Badge>
                  </div>
                  {ambassador.admin_notes && (
                    <p className="text-xs text-gray-400 italic">{ambassador.admin_notes}</p>
                  )}
                  {!ambassador.admin_notes && (
                    <p className="text-xs text-gray-600">No admin notes</p>
                  )}
                </div>
              )}
            </Card>

            {/* Promote */}
            <Card className="p-6">
              <h3 className="text-base font-semibold text-white mb-4">Promote Ambassador</h3>
              <div className="space-y-3">
                <Select
                  label="Target Rank"
                  options={rankSelectOptions}
                  value={promoteRank}
                  onChange={(e) => setPromoteRank(e.target.value as AmbassadorRank)}
                />
                <div className="flex gap-2">
                  <Button onClick={handlePromote} loading={promoting} className="flex-1">
                    Promote
                  </Button>
                  <Button variant="secondary" onClick={handleEvaluate} loading={evaluating} className="flex-1">
                    <RefreshCw className="h-3.5 w-3.5" />
                    Auto-Evaluate
                  </Button>
                </div>
              </div>
            </Card>

            {/* Create Bonus */}
            <Card className="p-6">
              <h3 className="text-base font-semibold text-white mb-4">Create Manual Bonus</h3>
              <div className="space-y-3">
                <Select
                  label="Bonus Type"
                  options={Object.entries(BONUS_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                  value={bonusForm.bonus_type}
                  onChange={(e) => setBonusForm((f) => ({ ...f, bonus_type: e.target.value as BonusType }))}
                />
                <Input
                  label="Amount (USD)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={bonusForm.amount}
                  onChange={(e) => setBonusForm((f) => ({ ...f, amount: e.target.value }))}
                />
                <Input
                  label="Period (optional)"
                  placeholder="e.g. 2026-05 or fast_start_1"
                  value={bonusForm.period}
                  onChange={(e) => setBonusForm((f) => ({ ...f, period: e.target.value }))}
                />
                <Input
                  label="Description (optional)"
                  value={bonusForm.description}
                  onChange={(e) => setBonusForm((f) => ({ ...f, description: e.target.value }))}
                />
                <Button onClick={handleCreateBonus} loading={creatingBonus} className="w-full">
                  Create Bonus
                </Button>
              </div>
            </Card>

            {/* Create Payout */}
            <Card className="p-6">
              <h3 className="text-base font-semibold text-white mb-4">Create Payout</h3>
              <p className="text-sm text-gray-400 mb-4">
                Marks all pending commissions and bonuses as paid and creates a payout record.
              </p>
              <div className="space-y-3">
                <Input
                  label="Admin Notes (optional)"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                />
                <Button onClick={handleCreatePayout} loading={creatingPayout} className="w-full">
                  Create Payout
                </Button>
              </div>
            </Card>

            {/* Award Travel */}
            <Card className="p-6">
              <h3 className="text-base font-semibold text-white mb-4">Award Travel Incentive</h3>
              <p className="text-sm text-gray-400 mb-4">
                Awards a travel incentive based on the ambassador&apos;s current rank. Destination is auto-determined.
              </p>
              <div className="space-y-3">
                <Input
                  label="Admin Notes (optional)"
                  value={travelNotes}
                  onChange={(e) => setTravelNotes(e.target.value)}
                />
                <Button onClick={handleAwardTravel} loading={awardingTravel} className="w-full">
                  Award Travel
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Commissions Tab */}
        {activeTab === "commissions" && (
          <Card className="p-6">
            <h3 className="text-base font-semibold text-white mb-4">Commission History</h3>
            {tabLoading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : commissions.length === 0 ? (
              <p className="text-gray-400 text-sm">No commissions found</p>
            ) : (
              <div className="space-y-2">
                {commissions.map((c) => (
                  <div key={c.id} className="border border-white/5 rounded-lg overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
                      onClick={() => setExpandedCommission(expandedCommission === c.id ? null : c.id)}
                    >
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-sm font-medium text-white">
                          {String(c.month).padStart(2, "0")}/{c.year}
                        </span>
                        <Badge className={COMM_STATUS_COLORS[c.status]}>{c.status}</Badge>
                        <span className="text-xs text-gray-500">TAV: {c.tav_count}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-neon font-semibold">{formatCurrency(c.commission_amount)}</span>
                        <button
                          className="text-xs text-blue-400 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCommissionEdit({ id: c.id, status: c.status, amount: String(c.commission_amount) });
                          }}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {expandedCommission === c.id ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {commissionEdit?.id === c.id && (
                      <div className="px-4 pb-4 border-t border-white/5 pt-3 bg-white/2">
                        <p className="text-xs text-gray-400 mb-2">Override commission</p>
                        <div className="flex flex-wrap gap-2 items-end">
                          <div className="w-32">
                            <Input
                              label="Amount"
                              type="number"
                              step="0.01"
                              value={commissionEdit.amount}
                              onChange={(e) => setCommissionEdit((prev) => prev && { ...prev, amount: e.target.value })}
                            />
                          </div>
                          <div className="w-32">
                            <Select
                              label="Status"
                              options={[
                                { value: "pending", label: "Pending" },
                                { value: "paid", label: "Paid" },
                                { value: "cancelled", label: "Cancelled" },
                              ]}
                              value={commissionEdit.status}
                              onChange={(e) => setCommissionEdit((prev) => prev && { ...prev, status: e.target.value as CommissionStatus })}
                            />
                          </div>
                          <Button size="sm" onClick={handleSaveCommission} loading={savingCommission}>Save</Button>
                          <Button size="sm" variant="secondary" onClick={() => setCommissionEdit(null)}>Cancel</Button>
                        </div>
                      </div>
                    )}

                    {expandedCommission === c.id && c.level_breakdown && (
                      <div className="px-4 pb-4 border-t border-white/5 pt-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          {Object.entries(c.level_breakdown).map(([level, amount]) => (
                            <div key={level} className="bg-white/5 rounded p-2">
                              <p className="text-gray-500 uppercase">{level.replace("_", " ")}</p>
                              <p className="text-white font-medium mt-0.5">{formatCurrency(amount)}</p>
                            </div>
                          ))}
                          {c.generational_override > 0 && (
                            <div className="bg-neon/5 rounded p-2 border border-neon/20">
                              <p className="text-gray-500 uppercase">Gen. Override</p>
                              <p className="text-neon font-medium mt-0.5">{formatCurrency(c.generational_override)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Bonuses Tab */}
        {activeTab === "bonuses" && (
          <Card className="p-6">
            <h3 className="text-base font-semibold text-white mb-4">Bonus History</h3>
            {tabLoading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : bonuses.length === 0 ? (
              <p className="text-gray-400 text-sm">No bonuses found</p>
            ) : (
              <div className="space-y-2">
                {bonuses.map((b) => (
                  <div key={b.id} className="border border-white/5 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium text-white">{BONUS_TYPE_LABELS[b.bonus_type]}</p>
                        {b.description && <p className="text-xs text-gray-400 mt-0.5">{b.description}</p>}
                        {b.period && <p className="text-xs text-gray-500">Period: {b.period}</p>}
                        <p className="text-xs text-gray-500 mt-1">{formatDate(b.created_at)}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-neon font-semibold">{formatCurrency(b.amount)}</p>
                        <Badge className={COMM_STATUS_COLORS[b.status]}>{b.status}</Badge>
                        <button
                          className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                          onClick={() => setBonusEdit({ id: b.id, status: b.status, amount: String(b.amount), description: b.description ?? "" })}
                        >
                          <Edit2 className="h-3 w-3" /> Override
                        </button>
                      </div>
                    </div>

                    {bonusEdit?.id === b.id && (
                      <div className="px-4 pb-4 border-t border-white/5 pt-3 bg-white/2">
                        <div className="flex flex-wrap gap-2 items-end">
                          <div className="w-28">
                            <Input
                              label="Amount"
                              type="number"
                              step="0.01"
                              value={bonusEdit.amount}
                              onChange={(e) => setBonusEdit((prev) => prev && { ...prev, amount: e.target.value })}
                            />
                          </div>
                          <div className="w-32">
                            <Select
                              label="Status"
                              options={[
                                { value: "pending", label: "Pending" },
                                { value: "paid", label: "Paid" },
                                { value: "cancelled", label: "Cancelled" },
                              ]}
                              value={bonusEdit.status}
                              onChange={(e) => setBonusEdit((prev) => prev && { ...prev, status: e.target.value as CommissionStatus })}
                            />
                          </div>
                          <div className="flex-1 min-w-[150px]">
                            <Input
                              label="Description"
                              value={bonusEdit.description}
                              onChange={(e) => setBonusEdit((prev) => prev && { ...prev, description: e.target.value })}
                            />
                          </div>
                          <Button size="sm" onClick={handleSaveBonus} loading={savingBonus}>Save</Button>
                          <Button size="sm" variant="secondary" onClick={() => setBonusEdit(null)}>Cancel</Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Payouts Tab */}
        {activeTab === "payouts" && (
          <Card className="p-6">
            <h3 className="text-base font-semibold text-white mb-4">Payout History</h3>
            {tabLoading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : payouts.length === 0 ? (
              <p className="text-gray-400 text-sm">No payouts found</p>
            ) : (
              <div className="space-y-2">
                {payouts.map((p) => (
                  <div key={p.id} className="p-4 border border-white/5 rounded-lg space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-white">{formatCurrency(p.total_amount)}</p>
                        {p.payout_address && (
                          <p className="font-mono text-xs text-gray-400">{shortenAddress(p.payout_address)}</p>
                        )}
                        <p className="text-xs text-gray-500">{formatDate(p.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={PAYOUT_STATUS_COLORS[p.status]}>{p.status}</Badge>
                        {(p.status === "pending" || p.status === "processing") && (
                          <button
                            onClick={() => handleCancelPayout(p.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                            title="Cancel payout"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    {p.admin_notes && <p className="text-xs text-gray-400">{p.admin_notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Travel Tab */}
        {activeTab === "travel" && (
          <Card className="p-6">
            <h3 className="text-base font-semibold text-white mb-4">Travel Incentives</h3>
            {tabLoading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : travel.length === 0 ? (
              <p className="text-gray-400 text-sm">No travel incentives found</p>
            ) : (
              <div className="space-y-3">
                {travel.map((t) => (
                  <div key={t.id} className="p-4 border border-white/5 rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{t.destination}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Required rank: {RANK_INFO[t.rank_required]?.label ?? t.rank_required}
                        </p>
                        <p className="text-xs text-gray-500">
                          Since {formatDate(t.qualification_start)}
                          {t.qualification_end && ` – ${formatDate(t.qualification_end)}`}
                        </p>
                        {t.admin_notes && <p className="text-xs text-gray-400 mt-1">{t.admin_notes}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={TRAVEL_STATUS_COLORS[t.status]}>{t.status}</Badge>
                        <button
                          className="text-xs text-neon hover:underline"
                          onClick={() =>
                            setTravelUpdate({ id: t.id, status: t.status, admin_notes: t.admin_notes ?? "" })
                          }
                        >
                          Update
                        </button>
                      </div>
                    </div>

                    {travelUpdate?.id === t.id && (
                      <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                        <Select
                          label="Status"
                          options={[
                            { value: "qualifying", label: "Qualifying" },
                            { value: "qualified", label: "Qualified" },
                            { value: "awarded", label: "Awarded" },
                            { value: "expired", label: "Expired" },
                          ]}
                          value={travelUpdate.status}
                          onChange={(e) =>
                            setTravelUpdate((prev) => prev && { ...prev, status: e.target.value as TravelStatus })
                          }
                        />
                        <Input
                          label="Admin Notes"
                          value={travelUpdate.admin_notes}
                          onChange={(e) =>
                            setTravelUpdate((prev) => prev && { ...prev, admin_notes: e.target.value })
                          }
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleUpdateTravel} loading={updatingTravel}>
                            Save
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setTravelUpdate(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <Card className="p-6">
            <h3 className="text-base font-semibold text-white mb-4">Activity Log</h3>
            {tabLoading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : activity.length === 0 ? (
              <p className="text-gray-400 text-sm">No activity recorded</p>
            ) : (
              <div className="space-y-1">
                {activity.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <span className="text-lg mt-0.5">{EVENT_ICONS[log.event_type] ?? "•"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{log.description}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-500">{formatDate(log.created_at)}</span>
                        <span className="text-xs text-gray-600">by {log.actor}</span>
                        {log.amount !== null && (
                          <span className="text-xs text-neon font-medium">{formatCurrency(log.amount)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Network / Downline Tab */}
        {activeTab === "network" && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h3 className="text-base font-semibold text-white">Downline Network</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Depth:</span>
                <select
                  value={downlineDepth}
                  onChange={(e) => setDownlineDepth(Number(e.target.value))}
                  className="bg-dark-200 border border-white/10 rounded px-2 py-1 text-sm text-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <Button size="sm" variant="secondary" onClick={handleLoadDownline} loading={loadingDownline}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Load
                </Button>
              </div>
            </div>

            {tabLoading || loadingDownline ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : !downline ? (
              <p className="text-gray-400 text-sm">Select depth and click Load to view downline</p>
            ) : downline.total_nodes === 0 ? (
              <p className="text-gray-400 text-sm">No downline members found</p>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-gray-500">
                  {downline.total_nodes} total member{downline.total_nodes !== 1 ? "s" : ""} across {Object.keys(downline.nodes_by_level).length} level{Object.keys(downline.nodes_by_level).length !== 1 ? "s" : ""}
                </p>
                {Object.entries(downline.nodes_by_level)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([level, nodes]) => (
                    <div key={level}>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                        Level {level} — {(nodes as DownlineNode[]).length} member{(nodes as DownlineNode[]).length !== 1 ? "s" : ""}
                      </p>
                      <div className="space-y-1">
                        {(nodes as DownlineNode[]).map((node) => (
                          <div
                            key={node.ambassador_id}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/8 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-1 self-stretch rounded-full"
                                style={{ marginLeft: `${(node.depth - 1) * 8}px`, background: "rgba(255,255,255,0.1)" }}
                              />
                              <div>
                                <p className="text-xs text-neon font-mono">{shortenAddress(node.user_id)}</p>
                                {node.masked_email && <p className="text-xs text-gray-500">{node.masked_email}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500">
                                PAR {node.par_count} / TAV {node.tav_count}
                              </span>
                              <Badge className={RANK_INFO[node.rank]?.color ?? ""}>
                                {RANK_INFO[node.rank]?.label ?? node.rank}
                              </Badge>
                              <Link href={`/ambassadors/${node.ambassador_id}`}>
                                <span className="text-xs text-neon hover:underline">View</span>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
