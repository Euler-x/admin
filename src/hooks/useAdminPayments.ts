import { useState, useCallback } from "react";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import type { Payment, PaginatedResponse } from "@/types";

export default function useAdminPayments() {
  const [payments, setPayments] = useState<PaginatedResponse<Payment> | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPayments = useCallback(async (params?: Record<string, string | number>) => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<Payment>>(ENDPOINTS.PAYMENTS.LIST, { params });
      setPayments(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPayment = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { data } = await api.get<Payment>(ENDPOINTS.PAYMENTS.GET(id));
      setPayment(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  return { payments, payment, loading, fetchPayments, getPayment };
}
