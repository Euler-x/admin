import { useState, useCallback } from "react";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import type { AuditLog, PaginatedResponse } from "@/types";

export default function useAdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<AuditLog>>(ENDPOINTS.AUDIT_LOGS.LIST, { params });
      setLogs(data.items);
      setTotalPages(data.total_pages);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const getLog = useCallback(async (id: string) => {
    const { data } = await api.get<AuditLog>(ENDPOINTS.AUDIT_LOGS.GET(id));
    return data;
  }, []);

  return { logs, totalPages, loading, fetchLogs, getLog };
}
