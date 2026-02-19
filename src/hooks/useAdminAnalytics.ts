import { useState, useCallback } from "react";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import type { RevenueAnalytics, UserAnalytics, ExecutionAnalytics } from "@/types";

export default function useAdminAnalytics() {
  const [revenue, setRevenue] = useState<RevenueAnalytics | null>(null);
  const [userStats, setUserStats] = useState<UserAnalytics | null>(null);
  const [executionStats, setExecutionStats] = useState<ExecutionAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRevenue = useCallback(async (params?: Record<string, string>) => {
    setLoading(true);
    try {
      const { data } = await api.get<RevenueAnalytics>(ENDPOINTS.ANALYTICS.REVENUE, { params });
      setRevenue(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserStats = useCallback(async (params?: Record<string, string>) => {
    try {
      const { data } = await api.get<UserAnalytics>(ENDPOINTS.ANALYTICS.USERS, { params });
      setUserStats(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  const fetchExecutionStats = useCallback(async (params?: Record<string, string>) => {
    try {
      const { data } = await api.get<ExecutionAnalytics>(ENDPOINTS.ANALYTICS.EXECUTIONS, { params });
      setExecutionStats(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  return { revenue, userStats, executionStats, loading, fetchRevenue, fetchUserStats, fetchExecutionStats };
}
