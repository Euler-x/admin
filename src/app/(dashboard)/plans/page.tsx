"use client";

import { useState, useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import ConfirmDialog from "@/components/ConfirmDialog";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import StatusBadge from "@/components/ui/StatusBadge";
import useAdminPlans from "@/hooks/useAdminPlans";
import { formatCurrency, capitalize } from "@/lib/utils";
import { Plus, Pencil, Archive, CreditCard } from "lucide-react";
import type { Plan, PlanCreate, PlanUpdate, BillingCycle } from "@/types";

interface PlanFormData {
  name: string;
  price_usd: string;
  billing_cycle: BillingCycle;
  max_strategies: string;
  max_allocation: string;
  trial_days: string;
  ate_access: boolean;
  features: string;
}

const EMPTY_FORM: PlanFormData = {
  name: "",
  price_usd: "",
  billing_cycle: "monthly",
  max_strategies: "",
  max_allocation: "",
  trial_days: "0",
  ate_access: false,
  features: "{}",
};

const billingCycleOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

export default function PlansPage() {
  const { plans, loading, fetchPlans, createPlan, updatePlan, archivePlan } =
    useAdminPlans();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Plan | null>(null);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const openCreate = () => {
    setEditingPlan(null);
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price_usd: String(plan.price_usd),
      billing_cycle: plan.billing_cycle,
      max_strategies: String(plan.max_strategies),
      max_allocation: String(plan.max_allocation),
      trial_days: String(plan.trial_days),
      ate_access: plan.ate_access,
      features: JSON.stringify(plan.features, null, 2),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPlan(null);
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    let parsedFeatures: Record<string, unknown>;
    try {
      parsedFeatures = JSON.parse(formData.features);
    } catch {
      return;
    }

    setSaving(true);
    try {
      if (editingPlan) {
        const payload: PlanUpdate = {
          name: formData.name,
          price_usd: Number(formData.price_usd),
          billing_cycle: formData.billing_cycle,
          max_strategies: Number(formData.max_strategies),
          max_allocation: Number(formData.max_allocation),
          trial_days: Number(formData.trial_days),
          ate_access: formData.ate_access,
          features: parsedFeatures,
        };
        await updatePlan(editingPlan.id, payload);
      } else {
        const payload: PlanCreate = {
          name: formData.name,
          price_usd: Number(formData.price_usd),
          billing_cycle: formData.billing_cycle,
          max_strategies: Number(formData.max_strategies),
          max_allocation: Number(formData.max_allocation),
          trial_days: Number(formData.trial_days),
          ate_access: formData.ate_access,
          features: parsedFeatures,
        };
        await createPlan(payload);
      }
      closeModal();
      fetchPlans();
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setArchiving(true);
    try {
      await archivePlan(archiveTarget.id);
      setArchiveTarget(null);
      fetchPlans();
    } finally {
      setArchiving(false);
    }
  };

  const updateField = (key: keyof PlanFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (plan: Plan) => (
        <span className="font-medium text-white">{plan.name}</span>
      ),
    },
    {
      key: "price_usd",
      header: "Price",
      render: (plan: Plan) => (
        <span className="text-neon font-semibold">
          {formatCurrency(plan.price_usd)}
        </span>
      ),
    },
    {
      key: "billing_cycle",
      header: "Cycle",
      render: (plan: Plan) => (
        <span className="text-gray-300">{capitalize(plan.billing_cycle)}</span>
      ),
    },
    {
      key: "max_strategies",
      header: "Max Strategies",
      render: (plan: Plan) => (
        <span className="text-gray-300">{plan.max_strategies}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (plan: Plan) => <StatusBadge status={plan.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (plan: Plan) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEdit(plan)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-neon hover:bg-white/5 transition-colors"
            title="Edit plan"
          >
            <Pencil className="h-4 w-4" />
          </button>
          {plan.status !== "archived" && (
            <button
              onClick={() => setArchiveTarget(plan)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
              title="Archive plan"
            >
              <Archive className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <CreditCard className="h-6 w-6 text-neon" />
              <h1 className="text-2xl font-bold text-white">Plans</h1>
            </div>
            <p className="text-sm text-gray-500">
              Manage subscription plans and pricing
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Create Plan
          </Button>
        </div>

        {/* Table */}
        <Table<Plan>
          columns={columns}
          data={plans}
          loading={loading}
          emptyMessage="No plans found"
        />
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingPlan ? "Edit Plan" : "Create Plan"}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="e.g. Pro Trader"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (USD)"
              type="number"
              placeholder="0.00"
              value={formData.price_usd}
              onChange={(e) => updateField("price_usd", e.target.value)}
            />
            <Select
              label="Billing Cycle"
              options={billingCycleOptions}
              value={formData.billing_cycle}
              onChange={(e) => updateField("billing_cycle", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Max Strategies"
              type="number"
              placeholder="5"
              value={formData.max_strategies}
              onChange={(e) => updateField("max_strategies", e.target.value)}
            />
            <Input
              label="Max Allocation"
              type="number"
              placeholder="10000"
              value={formData.max_allocation}
              onChange={(e) => updateField("max_allocation", e.target.value)}
            />
            <Input
              label="Trial Days"
              type="number"
              placeholder="0"
              value={formData.trial_days}
              onChange={(e) => updateField("trial_days", e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="ate_access"
              type="checkbox"
              checked={formData.ate_access}
              onChange={(e) => updateField("ate_access", e.target.checked)}
              className="h-4 w-4 rounded border-white/10 bg-dark-300 text-neon focus:ring-neon/20 focus:ring-offset-0"
            />
            <label htmlFor="ate_access" className="text-sm text-gray-300">
              ATE Access
            </label>
          </div>

          <Textarea
            label="Features (JSON)"
            placeholder='{"feature_1": true, "feature_2": false}'
            value={formData.features}
            onChange={(e) => updateField("features", e.target.value)}
            rows={4}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editingPlan ? "Update Plan" : "Create Plan"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Archive Confirm */}
      <ConfirmDialog
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchive}
        title="Archive Plan"
        message={`Are you sure you want to archive "${archiveTarget?.name}"? Users on this plan will remain active until their subscription expires.`}
        confirmText="Archive"
        confirmVariant="danger"
        loading={archiving}
      />
    </PageTransition>
  );
}
