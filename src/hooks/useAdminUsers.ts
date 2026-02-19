import { useState, useCallback } from "react";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import toast from "react-hot-toast";
import type { User, AdminUserDetail, AdminUserUpdate, PaginatedResponse } from "@/types";

export default function useAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<User>>(ENDPOINTS.USERS.LIST, { params });
      setUsers(data.items);
      setTotalPages(data.total_pages);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUser = useCallback(async (id: string) => {
    const { data } = await api.get<AdminUserDetail>(ENDPOINTS.USERS.GET(id));
    return data;
  }, []);

  const updateUser = useCallback(async (id: string, payload: AdminUserUpdate) => {
    const { data } = await api.put<User>(ENDPOINTS.USERS.UPDATE(id), payload);
    toast.success("User updated");
    return data;
  }, []);

  const toggleAdmin = useCallback(async (id: string) => {
    const { data } = await api.post<User>(ENDPOINTS.USERS.TOGGLE_ADMIN(id));
    toast.success(data.is_admin ? "Admin access granted" : "Admin access revoked");
    return data;
  }, []);

  const toggleActive = useCallback(async (id: string) => {
    const { data } = await api.post<User>(ENDPOINTS.USERS.TOGGLE_ACTIVE(id));
    toast.success(data.is_active ? "User activated" : "User deactivated");
    return data;
  }, []);

  return { users, totalPages, loading, fetchUsers, getUser, updateUser, toggleAdmin, toggleActive };
}
