"use client";

import Badge from "./Badge";

const statusVariantMap: Record<string, "success" | "warning" | "danger" | "info" | "default" | "neon"> = {
  active: "success",
  filled: "success",
  confirmed: "success",
  finished: "success",
  resolved: "success",
  new: "neon",
  executing: "info",
  in_progress: "info",
  sending: "info",
  confirming: "info",
  pending: "warning",
  pending_payment: "warning",
  expiring_soon: "warning",
  waiting: "warning",
  partially_filled: "warning",
  partially_paid: "warning",
  open: "info",
  failed: "danger",
  cancelled: "danger",
  expired: "danger",
  refunded: "danger",
  inactive: "default",
  closed: "default",
  archived: "default",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = statusVariantMap[status] || "default";
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
