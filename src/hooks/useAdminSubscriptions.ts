import { useState, useCallback } from "react";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import toast from "react-hot-toast";
import type { Subscription, SubscriptionGrant, SubscriptionOverride, PaginatedResponse } from "@/types";

export default function useAdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchSubscriptions = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<Subscription>>(ENDPOINTS.SUBSCRIPTIONS.LIST, { params });
      setSubscriptions(data.items);
      setTotalPages(data.total_pages);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const grantSubscription = useCallback(async (payload: SubscriptionGrant) => {
    const { data } = await api.post<Subscription>(ENDPOINTS.SUBSCRIPTIONS.CREATE, payload);
    toast.success("Subscription granted");
    return data;
  }, []);

  const overrideSubscription = useCallback(async (id: string, payload: SubscriptionOverride) => {
    const { data } = await api.put<Subscription>(ENDPOINTS.SUBSCRIPTIONS.OVERRIDE(id), payload);
    toast.success("Subscription updated");
    return data;
  }, []);

  const cancelSubscription = useCallback(async (id: string) => {
    await api.delete(ENDPOINTS.SUBSCRIPTIONS.CANCEL(id));
    toast.success("Subscription cancelled");
  }, []);

  return { subscriptions, totalPages, loading, fetchSubscriptions, grantSubscription, overrideSubscription, cancelSubscription };
}
