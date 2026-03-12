import { useState, useCallback } from "react";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import type {
  RevenueAnalytics, UserAnalytics, ExecutionAnalytics,
  DashboardAnalytics, TradingAnalytics, SignalAnalytics,
  UserGrowthPoint, RevenueChartPoint,
} from "@/types";

export default function useAdminAnalytics() {
  const [revenue, setRevenue] = useState<RevenueAnalytics | null>(null);
  const [userStats, setUserStats] = useState<UserAnalytics | null>(null);
  const [executionStats, setExecutionStats] = useState<ExecutionAnalytics | null>(null);
  const [dashboard, setDashboard] = useState<DashboardAnalytics | null>(null);
  const [trading, setTrading] = useState<TradingAnalytics | null>(null);
  const [signalAnalytics, setSignalAnalytics] = useState<SignalAnalytics | null>(null);
  const [userGrowth, setUserGrowth] = useState<UserGrowthPoint[]>([]);
  const [revenueChart, setRevenueChart] = useState<RevenueChartPoint[]>([]);
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

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<DashboardAnalytics>(ENDPOINTS.ANALYTICS.DASHBOARD);
      setDashboard(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrading = useCallback(async (days = 30) => {
    try {
      const { data } = await api.get<TradingAnalytics>(ENDPOINTS.ANALYTICS.TRADING, { params: { days } });
      setTrading(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  const fetchSignalAnalytics = useCallback(async (days = 30) => {
    try {
      const { data } = await api.get<SignalAnalytics>(ENDPOINTS.ANALYTICS.SIGNALS, { params: { days } });
      setSignalAnalytics(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  const fetchUserGrowth = useCallback(async (days = 90) => {
    try {
      const { data } = await api.get<UserGrowthPoint[]>(ENDPOINTS.ANALYTICS.USERS_CHART, { params: { days } });
      setUserGrowth(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  const fetchRevenueChart = useCallback(async (days = 90) => {
    try {
      const { data } = await api.get<RevenueChartPoint[]>(ENDPOINTS.ANALYTICS.REVENUE_CHART, { params: { days } });
      setRevenueChart(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  return {
    revenue, userStats, executionStats, dashboard, trading, signalAnalytics, userGrowth, revenueChart,
    loading,
    fetchRevenue, fetchUserStats, fetchExecutionStats, fetchDashboard, fetchTrading, fetchSignalAnalytics, fetchUserGrowth, fetchRevenueChart,
  };
}
