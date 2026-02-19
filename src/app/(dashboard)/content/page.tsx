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
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";
import useAdminContent from "@/hooks/useAdminContent";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import type { LearningContent, ContentCreate, ContentCategory, ContentType } from "@/types";

interface ContentFormData {
  title: string;
  description: string;
  category: ContentCategory;
  content_type: ContentType;
  content_url: string;
  display_order: string;
  is_published: boolean;
}

const EMPTY_FORM: ContentFormData = {
  title: "",
  description: "",
  category: "crypto_basics",
  content_type: "article",
  content_url: "",
  display_order: "0",
  is_published: false,
};

const categoryOptions = [
  { value: "crypto_basics", label: "Crypto Basics" },
  { value: "ai_trading", label: "AI Trading" },
  { value: "risk_management", label: "Risk Management" },
  { value: "automated_trading", label: "Automated Trading" },
  { value: "platform_guide", label: "Platform Guide" },
];

const contentTypeOptions = [
  { value: "video", label: "Video" },
  { value: "article", label: "Article" },
  { value: "pdf", label: "PDF" },
];

const categoryBadgeVariant: Record<ContentCategory, "info" | "neon" | "warning" | "success" | "default"> = {
  crypto_basics: "info",
  ai_trading: "neon",
  risk_management: "warning",
  automated_trading: "success",
  platform_guide: "default",
};

const typeBadgeVariant: Record<ContentType, "info" | "success" | "warning"> = {
  video: "info",
  article: "success",
  pdf: "warning",
};

export default function ContentPage() {
  const { content, loading, fetchContent, createContent, updateContent, deleteContent } =
    useAdminContent();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LearningContent | null>(null);
  const [formData, setFormData] = useState<ContentFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LearningContent | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const openCreate = () => {
    setEditingItem(null);
    setFormData(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (item: LearningContent) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      category: item.category,
      content_type: item.content_type,
      content_url: item.content_url || "",
      display_order: String(item.display_order),
      is_published: item.is_published,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload: ContentCreate = {
        title: formData.title,
        category: formData.category,
        content_type: formData.content_type,
        is_published: formData.is_published,
        display_order: Number(formData.display_order),
      };

      if (formData.description) payload.description = formData.description;
      if (formData.content_url) payload.content_url = formData.content_url;

      if (editingItem) {
        await updateContent(editingItem.id, payload);
      } else {
        await createContent(payload);
      }
      closeModal();
      fetchContent();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteContent(deleteTarget.id);
      setDeleteTarget(null);
      fetchContent();
    } finally {
      setDeleting(false);
    }
  };

  const updateField = (key: keyof ContentFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const formatCategoryLabel = (category: string) =>
    category
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const columns = [
    {
      key: "title",
      header: "Title",
      render: (item: LearningContent) => (
        <span className="font-medium text-white">{item.title}</span>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (item: LearningContent) => (
        <Badge variant={categoryBadgeVariant[item.category]}>
          {formatCategoryLabel(item.category)}
        </Badge>
      ),
    },
    {
      key: "content_type",
      header: "Type",
      render: (item: LearningContent) => (
        <Badge variant={typeBadgeVariant[item.content_type]}>
          {item.content_type.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: "is_published",
      header: "Published",
      render: (item: LearningContent) => (
        <StatusBadge status={item.is_published ? "active" : "inactive"} />
      ),
    },
    {
      key: "display_order",
      header: "Order",
      render: (item: LearningContent) => (
        <span className="text-gray-400">{item.display_order}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: LearningContent) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEdit(item)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-neon hover:bg-white/5 transition-colors"
            title="Edit content"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(item)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
            title="Delete content"
          >
            <Trash2 className="h-4 w-4" />
          </button>
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
              <BookOpen className="h-6 w-6 text-neon" />
              <h1 className="text-2xl font-bold text-white">Learning Content</h1>
            </div>
            <p className="text-sm text-gray-500">
              Manage educational resources and guides
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Content
          </Button>
        </div>

        {/* Table */}
        <Table<LearningContent>
          columns={columns}
          data={content}
          loading={loading}
          emptyMessage="No content found"
        />
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingItem ? "Edit Content" : "Add Content"}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g. Introduction to Crypto Trading"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
          />

          <Textarea
            label="Description"
            placeholder="Brief description of this content..."
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              options={categoryOptions}
              value={formData.category}
              onChange={(e) => updateField("category", e.target.value)}
            />
            <Select
              label="Content Type"
              options={contentTypeOptions}
              value={formData.content_type}
              onChange={(e) => updateField("content_type", e.target.value)}
            />
          </div>

          <Input
            label="Content URL"
            placeholder="https://..."
            value={formData.content_url}
            onChange={(e) => updateField("content_url", e.target.value)}
          />

          <Input
            label="Display Order"
            type="number"
            placeholder="0"
            value={formData.display_order}
            onChange={(e) => updateField("display_order", e.target.value)}
          />

          <div className="flex items-center gap-3">
            <input
              id="is_published"
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => updateField("is_published", e.target.checked)}
              className="h-4 w-4 rounded border-white/10 bg-dark-300 text-neon focus:ring-neon/20 focus:ring-offset-0"
            />
            <label htmlFor="is_published" className="text-sm text-gray-300">
              Published
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editingItem ? "Update Content" : "Add Content"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Content"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleting}
      />
    </PageTransition>
  );
}
