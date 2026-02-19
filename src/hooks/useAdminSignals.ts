import { useState, useCallback } from "react";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import toast from "react-hot-toast";
import type { Signal, SignalDetail, PaginatedResponse } from "@/types";

export default function useAdminSignals() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchSignals = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<Signal>>(ENDPOINTS.SIGNALS.LIST, { params });
      setSignals(data.items);
      setTotalPages(data.total_pages);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSignal = useCallback(async (id: string) => {
    const { data } = await api.get<SignalDetail>(ENDPOINTS.SIGNALS.GET(id));
    return data;
  }, []);

  const cancelSignal = useCallback(async (id: string) => {
    const { data } = await api.put<Signal>(ENDPOINTS.SIGNALS.CANCEL(id));
    toast.success("Signal cancelled");
    return data;
  }, []);

  return { signals, totalPages, loading, fetchSignals, getSignal, cancelSignal };
}
