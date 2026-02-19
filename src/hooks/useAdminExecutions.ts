import { useState, useCallback } from "react";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import type { Execution, PaginatedResponse } from "@/types";

export default function useAdminExecutions() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchExecutions = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<Execution>>(ENDPOINTS.EXECUTIONS.LIST, { params });
      setExecutions(data.items);
      setTotalPages(data.total_pages);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const getExecution = useCallback(async (id: string) => {
    const { data } = await api.get<Execution>(ENDPOINTS.EXECUTIONS.GET(id));
    return data;
  }, []);

  return { executions, totalPages, loading, fetchExecutions, getExecution };
}
