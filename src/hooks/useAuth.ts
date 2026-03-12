import { useState, useCallback } from "react";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";
import type { AuthResponse, User } from "@/types";

export default function useAuth() {
  const [loading, setLoading] = useState(false);
  const { setAuth, setUser, logout, user } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const { data } = await api.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, {
          email,
          password,
        });
        if (!data.user.is_admin) {
          toast.error("Access denied. This account is not an admin.");
          return null;
        }
        setAuth(data.user, data.access_token, data.refresh_token);
        toast.success("Authenticated as admin!");
        return data;
      } finally {
        setLoading(false);
      }
    },
    [setAuth]
  );

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get<User>(ENDPOINTS.AUTH.ME);
      setUser(data);
      return data;
    } catch {
      return null;
    }
  }, [setUser]);

  return { loading, user, login, fetchMe, logout };
}
