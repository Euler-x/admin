import { useState, useCallback } from "react";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import toast from "react-hot-toast";
import type { TradingStatus } from "@/types";

export default function useAdminTrading() {
  const [status, setStatus] = useState<TradingStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await api.get<TradingStatus>(ENDPOINTS.TRADING.STATUS);
      setStatus(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  const haltTrading = useCallback(async (reason?: string) => {
    setLoading(true);
    try {
      const { data } = await api.post(ENDPOINTS.TRADING.HALT, { reason });
      toast.success(`Trading halted. ${data.strategies_halted} strategies stopped.`);
      await fetchStatus();
      return data;
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  const resumeTrading = useCallback(async (reason?: string) => {
    setLoading(true);
    try {
      const { data } = await api.post(ENDPOINTS.TRADING.RESUME, { reason });
      toast.success(`Trading resumed. ${data.strategies_resumed} strategies reactivated.`);
      await fetchStatus();
      return data;
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  return { status, loading, fetchStatus, haltTrading, resumeTrading };
}
