"use client";

import { useState, useEffect, useCallback } from "react";
import PageTransition from "@/components/PageTransition";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import ConfirmDialog from "@/components/ConfirmDialog";
import { PageSpinner } from "@/components/ui/Spinner";
import useAdminConfig from "@/hooks/useAdminConfig";
import { formatDateTime } from "@/lib/utils";
import type { ConfigEntry, ConfigUpdate } from "@/types";
import toast from "react-hot-toast";

export default function ConfigPage() {
  const { configs, loading, fetchConfigs, upsertConfig, deleteConfig } = useAdminConfig();

  // Create/Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formKey, setFormKey] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  // Delete confirm state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ConfigEntry | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const openCreate = () => {
    setEditingKey(null);
    setFormKey("");
    setFormValue("{}");
    setFormDescription("");
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (config: ConfigEntry) => {
    setEditingKey(config.key);
    setFormKey(config.key);
    setFormValue(JSON.stringify(config.value, null, 2));
    setFormDescription(config.description || "");
    setFormError("");
    setModalOpen(true);
  };

  const openDelete = (config: ConfigEntry) => {
    setDeleteTarget(config);
    setDeleteOpen(true);
  };

  const handleSave = async () => {
    // Validate JSON
    let parsedValue: Record<string, unknown>;
    try {
      parsedValue = JSON.parse(formValue);
    } catch {
      setFormError("Invalid JSON. Please check your input.");
      toast.error("Invalid JSON format");
      return;
    }

    const key = editingKey || formKey;
    if (!key.trim()) {
      setFormError("Key is required");
      return;
    }

    setSaveLoading(true);
    try {
      const payload: ConfigUpdate = { value: parsedValue };
      if (formDescription.trim()) payload.description = formDescription.trim();
      await upsertConfig(key, payload);
      setModalOpen(false);
      fetchConfigs();
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteConfig(deleteTarget.key);
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchConfigs();
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      key: "key",
      header: "Key",
      render: (c: ConfigEntry) => (
        <span className="font-mono text-sm text-neon font-medium">{c.key}</span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (c: ConfigEntry) => (
        <span className="text-gray-400 text-sm">{c.description || "—"}</span>
      ),
    },
    {
      key: "value",
      header: "Value",
      render: (c: ConfigEntry) => (
        <span className="font-mono text-xs text-gray-500 truncate max-w-[200px] block">
          {JSON.stringify(c.value).slice(0, 50)}
          {JSON.stringify(c.value).length > 50 ? "..." : ""}
        </span>
      ),
    },
    {
      key: "updated_at",
      header: "Updated",
      render: (c: ConfigEntry) => (
        <span className="text-gray-500 text-xs">{formatDateTime(c.updated_at)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (c: ConfigEntry) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => openEdit(c)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => openDelete(c)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (loading && configs.length === 0) return <PageSpinner />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Configuration</h1>
            <p className="text-sm text-gray-400 mt-1">Manage system configuration entries</p>
          </div>
          <Button onClick={openCreate}>Add Config</Button>
        </div>

        <Table<ConfigEntry>
          columns={columns}
          data={configs}
          loading={loading}
          emptyMessage="No configuration entries found"
        />
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingKey ? "Edit Configuration" : "Add Configuration"}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Key"
            placeholder="e.g. trading.limits"
            value={formKey}
            onChange={(e) => {
              setFormKey(e.target.value);
              setFormError("");
            }}
            disabled={!!editingKey}
          />
          <Textarea
            label="Value (JSON)"
            placeholder='{"key": "value"}'
            value={formValue}
            onChange={(e) => {
              setFormValue(e.target.value);
              setFormError("");
            }}
            error={formError}
            className="font-mono text-xs min-h-[160px]"
          />
          <Textarea
            label="Description"
            placeholder="Optional description of this config entry"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={saveLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saveLoading}>
              {editingKey ? "Save Changes" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Configuration"
        message={`Are you sure you want to delete the configuration key "${deleteTarget?.key}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleteLoading}
      />
    </PageTransition>
  );
}
