"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";
import FilterBar from "@/components/filters/FilterBar";
import Table from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";
import useAdminUsers from "@/hooks/useAdminUsers";
import { formatDate, getSafeUserLabel } from "@/lib/utils";
import { Eye, Users as UsersIcon } from "lucide-react";
import type { User } from "@/types";

const PAGE_SIZE = 20;

const filterConfig = [
  {
    key: "search",
    label: "Search",
    type: "search" as const,
    placeholder: "Search by wallet or email...",
  },
  {
    key: "is_active",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "", label: "All" },
      { value: "true", label: "Active" },
      { value: "false", label: "Inactive" },
    ],
  },
  {
    key: "is_admin",
    label: "Role",
    type: "select" as const,
    options: [
      { value: "", label: "All" },
      { value: "true", label: "Admin" },
      { value: "false", label: "User" },
    ],
  },
];

export default function UsersPage() {
  const { users, totalPages, loading, fetchUsers } = useAdminUsers();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({
    search: "",
    is_active: "",
    is_admin: "",
  });

  const loadUsers = useCallback(() => {
    const params: Record<string, unknown> = {
      page,
      page_size: PAGE_SIZE,
    };

    if (filters.search) params.search = filters.search;
    if (filters.is_active) params.is_active = filters.is_active;
    if (filters.is_admin) params.is_admin = filters.is_admin;

    fetchUsers(params);
  }, [page, filters, fetchUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const columns = [
    {
      key: "email",
      header: "User",
      render: (user: User) => (
        <div>
          <span className="text-gray-200">
            {getSafeUserLabel({
              email: user.email,
              walletAddressHash: user.wallet_address_hash,
              userId: user.id,
            })}
          </span>
          {user.email && (
            <span className="block text-xs text-gray-500 font-mono mt-0.5">
              {getSafeUserLabel({
                walletAddressHash: user.wallet_address_hash,
                userId: user.id,
              })}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (user: User) => (
        <StatusBadge status={user.is_active ? "active" : "inactive"} />
      ),
    },
    {
      key: "is_admin",
      header: "Role",
      render: (user: User) => (
        <Badge variant={user.is_admin ? "neon" : "default"}>
          {user.is_admin ? "Admin" : "User"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Joined",
      render: (user: User) => (
        <span className="text-gray-400">{formatDate(user.created_at)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user: User) => (
        <Link
          href={`/users/${user.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-neon hover:text-neon/80 transition-colors"
        >
          <Eye className="h-4 w-4" />
          View
        </Link>
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <UsersIcon className="h-6 w-6 text-neon" />
            <h1 className="text-2xl font-bold text-white">Users</h1>
          </div>
          <p className="text-sm text-gray-500">
            {loading ? "Loading..." : `${users.length} users on this page`}
          </p>
        </div>

        {/* Filters */}
        <FilterBar
          filters={filterConfig}
          values={filters}
          onChange={handleFilterChange}
        />

        {/* Table */}
        <Table<User> columns={columns} data={users} loading={loading} emptyMessage="No users found" />

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </PageTransition>
  );
}
