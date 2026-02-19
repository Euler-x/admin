import { useState, useCallback } from "react";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import type { Transaction, PaginatedResponse } from "@/types";

export default function useAdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<Transaction>>(ENDPOINTS.TRANSACTIONS.LIST, { params });
      setTransactions(data.items);
      setTotalPages(data.total_pages);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTransaction = useCallback(async (id: string) => {
    const { data } = await api.get<Transaction>(ENDPOINTS.TRANSACTIONS.GET(id));
    return data;
  }, []);

  return { transactions, totalPages, loading, fetchTransactions, getTransaction };
}
