import { useState, useCallback } from "react";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";
import type { AuthResponse, SignMessageResponse, User } from "@/types";

export default function useAuth() {
  const [loading, setLoading] = useState(false);
  const { setAuth, setUser, logout, user } = useAuthStore();

  const getSignMessage = useCallback(async (walletAddress: string): Promise<string | null> => {
    setLoading(true);
    try {
      const { data } = await api.get<SignMessageResponse>(ENDPOINTS.AUTH.SIGN_MESSAGE, {
        params: { wallet_address: walletAddress },
      });
      return data.message;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const connectWallet = useCallback(
    async (walletAddress: string, message: string, signature: string) => {
      setLoading(true);
      try {
        const { data } = await api.post<AuthResponse>(ENDPOINTS.AUTH.CONNECT, {
          wallet_address: walletAddress,
          message,
          signature,
        });
        if (!data.user.is_admin) {
          toast.error("Access denied. This wallet is not an admin.");
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

  return { loading, user, connectWallet, getSignMessage, fetchMe, logout };
}
