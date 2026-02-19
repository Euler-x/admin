import { useState, useCallback } from "react";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import toast from "react-hot-toast";
import type { Ambassador, AmbassadorUpdate, PaginatedResponse } from "@/types";

export default function useAdminAmbassadors() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchAmbassadors = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<Ambassador>>(ENDPOINTS.AMBASSADORS.LIST, { params });
      setAmbassadors(data.items);
      setTotalPages(data.total_pages);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAmbassador = useCallback(async (id: string) => {
    const { data } = await api.get<Ambassador>(ENDPOINTS.AMBASSADORS.GET(id));
    return data;
  }, []);

  const updateAmbassador = useCallback(async (id: string, payload: AmbassadorUpdate) => {
    const { data } = await api.put<Ambassador>(ENDPOINTS.AMBASSADORS.UPDATE(id), payload);
    toast.success("Ambassador updated");
    return data;
  }, []);

  return { ambassadors, totalPages, loading, fetchAmbassadors, getAmbassador, updateAmbassador };
}
