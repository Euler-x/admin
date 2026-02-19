import { useState, useCallback } from "react";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import toast from "react-hot-toast";
import type { Plan, PlanCreate, PlanUpdate } from "@/types";

export default function useAdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Plan[]>(ENDPOINTS.PLANS.LIST);
      setPlans(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPlan = useCallback(async (payload: PlanCreate) => {
    const { data } = await api.post<Plan>(ENDPOINTS.PLANS.CREATE, payload);
    toast.success("Plan created");
    return data;
  }, []);

  const updatePlan = useCallback(async (id: string, payload: PlanUpdate) => {
    const { data } = await api.put<Plan>(ENDPOINTS.PLANS.UPDATE(id), payload);
    toast.success("Plan updated");
    return data;
  }, []);

  const archivePlan = useCallback(async (id: string) => {
    await api.delete(ENDPOINTS.PLANS.DELETE(id));
    toast.success("Plan archived");
  }, []);

  return { plans, loading, fetchPlans, createPlan, updatePlan, archivePlan };
}
