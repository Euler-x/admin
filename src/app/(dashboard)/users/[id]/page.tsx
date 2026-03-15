"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import ConfirmDialog from "@/components/ConfirmDialog";
import GlowCard from "@/components/ui/GlowCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import Spinner from "@/components/ui/Spinner";
import useAdminUsers from "@/hooks/useAdminUsers";
import { shortenAddress, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Shield,
  ShieldOff,
  UserCheck,
  UserX,
  BarChart3,
  Zap,
  CreditCard,
  ArrowRightLeft,
} from "lucide-react";
import type { AdminUserDetail } from "@/types";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getUser, toggleAdmin, toggleActive } = useAdminUsers();

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "admin" | "active";
  }>({ open: false, type: "admin" });

  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUser(id);
      setUser(data);
    } finally {
      setLoading(false);
    }
  }, [id, getUser]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleToggleAdmin = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await toggleAdmin(user.id);
      await loadUser();
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, type: "admin" });
    }
  };

  const handleToggleActive = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await toggleActive(user.id);
      await loadUser();
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, type: "active" });
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner />
        </div>
      </PageTransition>
    );
  }

  if (!user) {
    return (
      <PageTransition>
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">User not found</p>
          <Link href="/users">
            <Button variant="secondary">Back to Users</Button>
          </Link>
        </div>
      </PageTransition>
    );
  }

  const stats = [
    {
      label: "Strategies",
      value: user.strategy_count,
      icon: BarChart3,
      color: "text-blue-400",
    },
    {
      label: "Executions",
      value: user.execution_count,
      icon: Zap,
      color: "text-neon",
    },
    {
      label: "Subscriptions",
      value: user.subscription_count,
      icon: CreditCard,
      color: "text-purple-400",
    },
    {
      label: "Transactions",
      value: user.transaction_count,
      icon: ArrowRightLeft,
      color: "text-yellow-400",
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          href="/users"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-neon transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>

        {/* User Info Card */}
        <div className="rounded-2xl bg-dark-200/80 border border-white/5 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white">
                  {user.email || shortenAddress(user.wallet_address_hash, 8)}
                </h1>
                <Badge variant={user.is_admin ? "neon" : "default"}>
                  {user.is_admin ? "Admin" : "User"}
                </Badge>
                <StatusBadge status={user.is_active ? "active" : "inactive"} />
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
                {user.email && (
                  <span>
                    <span className="text-gray-500">Email:</span>{" "}
                    {user.email}
                    <span className="ml-1.5">
                      {user.email_verified ? (
                        <Badge variant="success">Verified</Badge>
                      ) : (
                        <Badge variant="warning">Unverified</Badge>
                      )}
                    </span>
                  </span>
                )}
                <span>
                  <span className="text-gray-500">Wallet:</span>{" "}
                  {user.wallet_type}
                </span>
                <span>
                  <span className="text-gray-500">Telegram:</span>{" "}
                  {user.telegram_configured ? "Connected" : "Not connected"}
                </span>
                <span>
                  <span className="text-gray-500">Joined:</span>{" "}
                  {formatDate(user.created_at)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant={user.is_admin ? "danger" : "secondary"}
                size="sm"
                onClick={() =>
                  setConfirmDialog({ open: true, type: "admin" })
                }
              >
                {user.is_admin ? (
                  <>
                    <ShieldOff className="h-4 w-4" />
                    Revoke Admin
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Grant Admin
                  </>
                )}
              </Button>
              <Button
                variant={user.is_active ? "danger" : "primary"}
                size="sm"
                onClick={() =>
                  setConfirmDialog({ open: true, type: "active" })
                }
              >
                {user.is_active ? (
                  <>
                    <UserX className="h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    Activate
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <GlowCard key={stat.label}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-dark-300">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      </div>

      {/* Toggle Admin Confirm */}
      <ConfirmDialog
        isOpen={confirmDialog.open && confirmDialog.type === "admin"}
        onClose={() => setConfirmDialog({ open: false, type: "admin" })}
        onConfirm={handleToggleAdmin}
        title={user.is_admin ? "Revoke Admin Access" : "Grant Admin Access"}
        message={
          user.is_admin
            ? `Are you sure you want to revoke admin privileges from ${user.email || shortenAddress(user.wallet_address_hash)}?`
            : `Are you sure you want to grant admin privileges to ${user.email || shortenAddress(user.wallet_address_hash)}?`
        }
        confirmText={user.is_admin ? "Revoke" : "Grant"}
        confirmVariant={user.is_admin ? "danger" : "primary"}
        loading={actionLoading}
      />

      {/* Toggle Active Confirm */}
      <ConfirmDialog
        isOpen={confirmDialog.open && confirmDialog.type === "active"}
        onClose={() => setConfirmDialog({ open: false, type: "active" })}
        onConfirm={handleToggleActive}
        title={user.is_active ? "Deactivate User" : "Activate User"}
        message={
          user.is_active
            ? `Are you sure you want to deactivate ${user.email || shortenAddress(user.wallet_address_hash)}? They will lose access to the platform.`
            : `Are you sure you want to activate ${user.email || shortenAddress(user.wallet_address_hash)}? They will regain access to the platform.`
        }
        confirmText={user.is_active ? "Deactivate" : "Activate"}
        confirmVariant={user.is_active ? "danger" : "primary"}
        loading={actionLoading}
      />
    </PageTransition>
  );
}
