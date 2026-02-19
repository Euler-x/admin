import { useState, useCallback } from "react";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import toast from "react-hot-toast";
import type { Strategy, AdminStrategyUpdate, PaginatedResponse } from "@/types";

export default function useAdminStrategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchStrategies = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<Strategy>>(ENDPOINTS.STRATEGIES.LIST, { params });
      setStrategies(data.items);
      setTotalPages(data.total_pages);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStrategy = useCallback(async (id: string) => {
    const { data } = await api.get<Strategy>(ENDPOINTS.STRATEGIES.GET(id));
    return data;
  }, []);

  const updateStrategy = useCallback(async (id: string, payload: AdminStrategyUpdate) => {
    const { data } = await api.put<Strategy>(ENDPOINTS.STRATEGIES.UPDATE(id), payload);
    toast.success("Strategy updated");
    return data;
  }, []);

  const deactivateStrategy = useCallback(async (id: string) => {
    const { data } = await api.post<Strategy>(ENDPOINTS.STRATEGIES.DEACTIVATE(id));
    toast.success("Strategy deactivated");
    return data;
  }, []);

  const deleteStrategy = useCallback(async (id: string) => {
    await api.delete(ENDPOINTS.STRATEGIES.DELETE(id));
    toast.success("Strategy deleted");
  }, []);

  return { strategies, totalPages, loading, fetchStrategies, getStrategy, updateStrategy, deactivateStrategy, deleteStrategy };
}
