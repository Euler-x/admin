"use client";

import { useState, useEffect, useCallback } from "react";
import PageTransition from "@/components/PageTransition";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import FilterBar from "@/components/filters/FilterBar";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ConfirmDialog from "@/components/ConfirmDialog";
import { PageSpinner } from "@/components/ui/Spinner";
import useAdminSubscriptions from "@/hooks/useAdminSubscriptions";
import useAdminUsers from "@/hooks/useAdminUsers";
import useAdminPlans from "@/hooks/useAdminPlans";
import usePagination from "@/hooks/usePagination";
import { formatDate, shortenAddress } from "@/lib/utils";
import type { Subscription, SubscriptionStatus, SubscriptionGrant, SubscriptionOverride } from "@/types";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "inactive", label: "Inactive" },
  { value: "pending_payment", label: "Pending Payment" },
  { value: "active", label: "Active" },
  { value: "expiring_soon", label: "Expiring Soon" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

const overrideStatusOptions = [
  { value: "inactive", label: "Inactive" },
  { value: "pending_payment", label: "Pending Payment" },
  { value: "active", label: "Active" },
  { value: "expiring_soon", label: "Expiring Soon" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

const filters = [
  {
    key: "search",
    label: "Search",
    type: "search" as const,
    placeholder: "Search subscriptions...",
  },
  {
    key: "status",
    label: "Status",
    type: "select" as const,
    options: statusOptions,
  },
];

export default function SubscriptionsPage() {
  const {
    subscriptions,
    totalPages,
    loading,
    fetchSubscriptions,
    grantSubscription,
    overrideSubscription,
    cancelSubscription,
  } = useAdminSubscriptions();
  const { page, pageSize, setPage, reset } = usePagination();
  const { users: allUsers, fetchUsers: fetchAllUsers } = useAdminUsers();
  const { plans: allPlans, fetchPlans: fetchAllPlans } = useAdminPlans();
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    search: "",
    status: "",
  });

  // Grant modal state
  const [grantOpen, setGrantOpen] = useState(false);
  const [grantForm, setGrantForm] = useState<SubscriptionGrant>({
    user_id: "",
    plan_id: "",
    expires_at: "",
  });
  const [grantLoading, setGrantLoading] = useState(false);

  // Override modal state
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideTarget, setOverrideTarget] = useState<Subscription | null>(null);
  const [overrideForm, setOverrideForm] = useState<SubscriptionOverride>({
    status: "active",
    expires_at: "",
    grace_until: "",
  });
  const [overrideLoading, setOverrideLoading] = useState(false);

  // Cancel confirm state
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Subscription | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Fetch users & plans when grant modal opens
  useEffect(() => {
    if (grantOpen) {
      fetchAllUsers({ page: 1, page_size: 200 });
      fetchAllPlans();
    }
  }, [grantOpen, fetchAllUsers, fetchAllPlans]);

  const userOptions = allUsers.map((u) => ({
    value: u.id,
    label: u.email ? `${u.email} (${shortenAddress(u.id)})` : shortenAddress(u.id),
  }));

  const planOptions = allPlans.map((p) => ({
    value: p.id,
    label: `${p.name} — $${p.price_usd}/${p.billing_cycle}`,
  }));

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      setFilterValues((prev) => ({ ...prev, [key]: value }));
      reset();
    },
    [reset]
  );

  const reload = useCallback(() => {
    const params: Record<string, unknown> = { page, page_size: pageSize };
    if (filterValues.status) params.status = filterValues.status as SubscriptionStatus;
    if (filterValues.search) params.search = filterValues.search;
    fetchSubscriptions(params);
  }, [page, pageSize, filterValues, fetchSubscriptions]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleGrant = async () => {
    setGrantLoading(true);
    try {
      const payload: SubscriptionGrant = {
        user_id: grantForm.user_id,
        plan_id: grantForm.plan_id,
      };
      if (grantForm.expires_at) payload.expires_at = grantForm.expires_at;
      await grantSubscription(payload);
      setGrantOpen(false);
      setGrantForm({ user_id: "", plan_id: "", expires_at: "" });
      reload();
    } finally {
      setGrantLoading(false);
    }
  };

  const handleOverride = async () => {
    if (!overrideTarget) return;
    setOverrideLoading(true);
    try {
      const payload: SubscriptionOverride = {
        status: overrideForm.status,
      };
      if (overrideForm.expires_at) payload.expires_at = overrideForm.expires_at;
      if (overrideForm.grace_until) payload.grace_until = overrideForm.grace_until;
      await overrideSubscription(overrideTarget.id, payload);
      setOverrideOpen(false);
      setOverrideTarget(null);
      reload();
    } finally {
      setOverrideLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await cancelSubscription(cancelTarget.id);
      setCancelOpen(false);
      setCancelTarget(null);
      reload();
    } finally {
      setCancelLoading(false);
    }
  };

  const openOverride = (sub: Subscription) => {
    setOverrideTarget(sub);
    setOverrideForm({
      status: sub.status,
      expires_at: sub.expires_at ? sub.expires_at.split("T")[0] : "",
      grace_until: sub.grace_until ? sub.grace_until.split("T")[0] : "",
    });
    setOverrideOpen(true);
  };

  const openCancel = (sub: Subscription) => {
    setCancelTarget(sub);
    setCancelOpen(true);
  };

  const columns = [
    {
      key: "user_id",
      header: "User",
      render: (s: Subscription) => (
        <span className="font-mono text-xs text-neon">{shortenAddress(s.user_id)}</span>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      render: (s: Subscription) => (
        <span className="text-white">{s.plan?.name || "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (s: Subscription) => <StatusBadge status={s.status} />,
    },
    {
      key: "expires_at",
      header: "Expires",
      render: (s: Subscription) => (
        <span className="text-gray-400 text-xs">
          {s.expires_at ? formatDate(s.expires_at) : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (s: Subscription) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => openOverride(s)}>
            Override
          </Button>
          <Button size="sm" variant="danger" onClick={() => openCancel(s)}>
            Cancel
          </Button>
        </div>
      ),
    },
  ];

  if (loading && subscriptions.length === 0) return <PageSpinner />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
            <p className="text-sm text-gray-400 mt-1">Manage user subscriptions</p>
          </div>
          <Button onClick={() => setGrantOpen(true)}>Grant Subscription</Button>
        </div>

        <FilterBar filters={filters} values={filterValues} onChange={handleFilterChange} />

        <Table<Subscription>
          columns={columns}
          data={subscriptions}
          loading={loading}
          emptyMessage="No subscriptions found"
        />

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Grant Subscription Modal */}
      <Modal isOpen={grantOpen} onClose={() => setGrantOpen(false)} title="Grant Subscription" size="md">
        <div className="space-y-4">
          <Select
            label="User"
            placeholder="Select a user..."
            options={userOptions}
            value={grantForm.user_id}
            onChange={(e) => setGrantForm((f) => ({ ...f, user_id: e.target.value }))}
          />
          <Select
            label="Plan"
            placeholder="Select a plan..."
            options={planOptions}
            value={grantForm.plan_id}
            onChange={(e) => setGrantForm((f) => ({ ...f, plan_id: e.target.value }))}
          />
          <Input
            label="Expires At"
            type="date"
            value={grantForm.expires_at || ""}
            onChange={(e) => setGrantForm((f) => ({ ...f, expires_at: e.target.value }))}
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setGrantOpen(false)} disabled={grantLoading}>
              Cancel
            </Button>
            <Button onClick={handleGrant} loading={grantLoading} disabled={!grantForm.user_id || !grantForm.plan_id}>
              Grant
            </Button>
          </div>
        </div>
      </Modal>

      {/* Override Subscription Modal */}
      <Modal isOpen={overrideOpen} onClose={() => setOverrideOpen(false)} title="Override Subscription" size="md">
        <div className="space-y-4">
          <Select
            label="Status"
            options={overrideStatusOptions}
            value={overrideForm.status}
            onChange={(e) => setOverrideForm((f) => ({ ...f, status: e.target.value as SubscriptionStatus }))}
          />
          <Input
            label="Expires At"
            type="date"
            value={overrideForm.expires_at || ""}
            onChange={(e) => setOverrideForm((f) => ({ ...f, expires_at: e.target.value }))}
          />
          <Input
            label="Grace Until"
            type="date"
            value={overrideForm.grace_until || ""}
            onChange={(e) => setOverrideForm((f) => ({ ...f, grace_until: e.target.value }))}
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setOverrideOpen(false)} disabled={overrideLoading}>
              Cancel
            </Button>
            <Button onClick={handleOverride} loading={overrideLoading}>
              Save Override
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Subscription"
        message={`Are you sure you want to cancel this subscription for user ${cancelTarget ? shortenAddress(cancelTarget.user_id) : ""}? This action cannot be undone.`}
        confirmText="Cancel Subscription"
        confirmVariant="danger"
        loading={cancelLoading}
      />
    </PageTransition>
  );
}
