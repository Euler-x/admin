import { useState, useCallback } from "react";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import toast from "react-hot-toast";
import type {
  ActivityLog,
  AdminBonus,
  AdminCommission,
  AdminPayout,
  AdminTravel,
  Ambassador,
  AmbassadorAnalytics,
  AmbassadorBonus,
  AmbassadorCommission,
  AmbassadorPayout,
  AmbassadorRank,
  AmbassadorStatus,
  AmbassadorUpdate,
  ActivityEventType,
  BonusType,
  CommissionStatus,
  DownlineResponse,
  LeadershipPool,
  PaginatedResponse,
  PayoutStatus,
  TrainingCompletion,
  TravelIncentive,
  TravelStatus,
  UpdateBonusRequest,
  UpdateCommissionRequest,
} from "@/types";

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
    const { data } = await api.patch<Ambassador>(ENDPOINTS.AMBASSADORS.UPDATE(id), payload);
    toast.success("Ambassador updated");
    return data;
  }, []);

  const promoteAmbassador = useCallback(async (id: string, rank: AmbassadorRank) => {
    const { data } = await api.post<{ ambassador: Ambassador; bonus_created: boolean; bonus_amount: number }>(
      ENDPOINTS.AMBASSADORS.PROMOTE(id),
      { rank }
    );
    toast.success(`Promoted to ${rank.replace(/_/g, " ")}`);
    return data;
  }, []);

  const evaluateRank = useCallback(async (id: string) => {
    const { data } = await api.post<{ old_rank: AmbassadorRank; new_rank: AmbassadorRank; changed: boolean }>(
      ENDPOINTS.AMBASSADORS.EVALUATE_RANK(id)
    );
    if (data.changed) {
      toast.success(`Rank updated: ${data.old_rank} → ${data.new_rank}`);
    } else {
      toast.success("No rank change needed");
    }
    return data;
  }, []);

  const evaluateAll = useCallback(async () => {
    const { data } = await api.post<{ evaluated: number; promoted: number }>(ENDPOINTS.AMBASSADORS.EVALUATE_ALL);
    toast.success(`Evaluated ${data.evaluated} ambassadors, ${data.promoted} promoted`);
    return data;
  }, []);

  const createBonus = useCallback(
    async (id: string, payload: { bonus_type: BonusType; amount: number; description?: string; period?: string }) => {
      const { data } = await api.post<AmbassadorBonus>(ENDPOINTS.AMBASSADORS.CREATE_BONUS(id), payload);
      toast.success("Bonus created");
      return data;
    },
    []
  );

  const updateBonus = useCallback(async (ambassadorId: string, bonusId: string, payload: UpdateBonusRequest) => {
    const { data } = await api.patch<AmbassadorBonus>(
      ENDPOINTS.AMBASSADORS.UPDATE_BONUS(ambassadorId, bonusId),
      payload
    );
    toast.success("Bonus updated");
    return data;
  }, []);

  const createPayout = useCallback(async (id: string, admin_notes?: string) => {
    const { data } = await api.post<AmbassadorPayout>(ENDPOINTS.AMBASSADORS.PAYOUT(id), { admin_notes });
    toast.success("Payout created");
    return data;
  }, []);

  const cancelPayout = useCallback(async (ambassadorId: string, payoutId: string) => {
    await api.delete(ENDPOINTS.AMBASSADORS.CANCEL_PAYOUT(ambassadorId, payoutId));
    toast.success("Payout cancelled");
  }, []);

  const fetchPayouts = useCallback(async (params?: { page?: number; page_size?: number; status?: string }) => {
    const { data } = await api.get<PaginatedResponse<AmbassadorPayout>>(ENDPOINTS.AMBASSADORS.PAYOUTS, { params });
    return data;
  }, []);

  const updatePayout = useCallback(async (payoutId: string, payload: { status: PayoutStatus; admin_notes?: string }) => {
    const { data } = await api.patch<AmbassadorPayout>(ENDPOINTS.AMBASSADORS.UPDATE_PAYOUT(payoutId), payload);
    toast.success("Payout updated");
    return data;
  }, []);

  const bulkUpdatePayouts = useCallback(
    async (payout_ids: string[], status: PayoutStatus, admin_notes?: string) => {
      const { data } = await api.post<{ updated: number }>(ENDPOINTS.AMBASSADORS.BULK_UPDATE_PAYOUTS, {
        payout_ids,
        status,
        admin_notes,
      });
      toast.success(`Updated ${data.updated} payout(s)`);
      return data;
    },
    []
  );

  const bulkApproveCommissions = useCallback(async (commission_ids: string[]) => {
    const { data } = await api.post<{ approved: number }>(ENDPOINTS.AMBASSADORS.BULK_APPROVE_COMMISSIONS, {
      commission_ids,
    });
    toast.success(`Approved ${data.approved} commission(s)`);
    return data;
  }, []);

  const fetchAmbassadorCommissions = useCallback(
    async (id: string, params?: { page?: number; page_size?: number }) => {
      const { data } = await api.get<PaginatedResponse<AmbassadorCommission>>(
        ENDPOINTS.AMBASSADORS.COMMISSIONS(id),
        { params }
      );
      return data;
    },
    []
  );

  const updateCommission = useCallback(
    async (ambassadorId: string, commissionId: string, payload: UpdateCommissionRequest) => {
      const { data } = await api.patch<AmbassadorCommission>(
        ENDPOINTS.AMBASSADORS.UPDATE_COMMISSION(ambassadorId, commissionId),
        payload
      );
      toast.success("Commission updated");
      return data;
    },
    []
  );

  const fetchAmbassadorBonuses = useCallback(
    async (id: string, params?: { page?: number; page_size?: number }) => {
      const { data } = await api.get<PaginatedResponse<AmbassadorBonus>>(
        `${ENDPOINTS.AMBASSADORS.GET(id)}/bonuses`,
        { params }
      );
      return data;
    },
    []
  );

  const fetchAmbassadorPayouts = useCallback(
    async (id: string, params?: { page?: number; page_size?: number }) => {
      const { data } = await api.get<PaginatedResponse<AmbassadorPayout>>(
        ENDPOINTS.AMBASSADORS.PAYOUTS_LIST(id),
        { params }
      );
      return data;
    },
    []
  );

  const fetchTravel = useCallback(async (id: string) => {
    const { data } = await api.get<TravelIncentive[]>(ENDPOINTS.AMBASSADORS.TRAVEL_LIST(id));
    return data;
  }, []);

  const awardTravel = useCallback(
    async (id: string, payload: { admin_notes?: string }) => {
      const { data } = await api.post<TravelIncentive>(ENDPOINTS.AMBASSADORS.TRAVEL_LIST(id), payload);
      toast.success("Travel incentive awarded");
      return data;
    },
    []
  );

  const updateTravel = useCallback(
    async (id: string, incentiveId: string, payload: { status: TravelStatus; admin_notes?: string }) => {
      const { data } = await api.patch<TravelIncentive>(
        ENDPOINTS.AMBASSADORS.TRAVEL_UPDATE(id, incentiveId),
        payload
      );
      toast.success("Travel incentive updated");
      return data;
    },
    []
  );

  const fetchAmbassadorTraining = useCallback(async (id: string) => {
    const { data } = await api.get<{ modules: { key: string; name: string; rank: AmbassadorRank; duration_min: number; completed: boolean; completed_at: string | null }[]; completed_count: number; total_count: number }>(
      ENDPOINTS.AMBASSADORS.TRAINING_LIST(id)
    );
    return data;
  }, []);

  const completeTraining = useCallback(async (id: string, module: string, notes?: string) => {
    const { data } = await api.post<TrainingCompletion>(ENDPOINTS.AMBASSADORS.TRAINING_COMPLETE(id, module), { notes });
    toast.success("Module marked complete");
    return data;
  }, []);

  const removeTraining = useCallback(async (id: string, module: string) => {
    await api.delete(ENDPOINTS.AMBASSADORS.TRAINING_REMOVE(id, module));
    toast.success("Training completion removed");
  }, []);

  const fetchAmbassadorActivity = useCallback(
    async (
      id: string,
      params?: { page?: number; page_size?: number; event_type?: ActivityEventType }
    ) => {
      const { data } = await api.get<PaginatedResponse<ActivityLog>>(
        ENDPOINTS.AMBASSADORS.ACTIVITY(id),
        { params }
      );
      return data;
    },
    []
  );

  const fetchDownline = useCallback(async (id: string, depth?: number) => {
    const { data } = await api.get<DownlineResponse>(ENDPOINTS.AMBASSADORS.DOWNLINE(id), {
      params: depth ? { depth } : undefined,
    });
    return data;
  }, []);

  const fetchGlobalActivity = useCallback(
    async (params?: {
      page?: number;
      page_size?: number;
      ambassador_id?: string;
      event_type?: ActivityEventType;
      date_from?: string;
      date_to?: string;
    }) => {
      const { data } = await api.get<PaginatedResponse<ActivityLog>>(
        ENDPOINTS.AMBASSADORS.GLOBAL_ACTIVITY,
        { params }
      );
      return data;
    },
    []
  );

  const fetchGlobalCommissions = useCallback(
    async (params?: {
      page?: number;
      page_size?: number;
      ambassador_id?: string;
      month?: number;
      year?: number;
      status?: CommissionStatus;
    }) => {
      const { data } = await api.get<PaginatedResponse<AdminCommission>>(
        ENDPOINTS.AMBASSADORS.GLOBAL_COMMISSIONS,
        { params }
      );
      return data;
    },
    []
  );

  const fetchGlobalBonuses = useCallback(
    async (params?: {
      page?: number;
      page_size?: number;
      ambassador_id?: string;
      bonus_type?: BonusType;
      status?: CommissionStatus;
    }) => {
      const { data } = await api.get<PaginatedResponse<AdminBonus>>(
        ENDPOINTS.AMBASSADORS.GLOBAL_BONUSES,
        { params }
      );
      return data;
    },
    []
  );

  const fetchGlobalTravel = useCallback(
    async (params?: {
      page?: number;
      page_size?: number;
      status?: TravelStatus;
      rank_required?: AmbassadorRank;
    }) => {
      const { data } = await api.get<PaginatedResponse<AdminTravel>>(
        ENDPOINTS.AMBASSADORS.GLOBAL_TRAVEL,
        { params }
      );
      return data;
    },
    []
  );

  const fetchGlobalTraining = useCallback(
    async (params?: {
      page?: number;
      page_size?: number;
      ambassador_id?: string;
      module_name?: string;
    }) => {
      const { data } = await api.get<PaginatedResponse<TrainingCompletion>>(
        ENDPOINTS.AMBASSADORS.GLOBAL_TRAINING,
        { params }
      );
      return data;
    },
    []
  );

  const fetchAmbassadorAnalytics = useCallback(async (month: number, year: number) => {
    const { data } = await api.get<AmbassadorAnalytics>(ENDPOINTS.AMBASSADORS.AMBASSADOR_ANALYTICS, {
      params: { month, year },
    });
    return data;
  }, []);

  const recalculateCommissions = useCallback(async (ambassadorId?: string) => {
    const payload = ambassadorId ? { ambassador_id: ambassadorId } : {};
    const { data } = await api.post<{ recalculated: number }>(ENDPOINTS.AMBASSADORS.RECALCULATE, payload);
    toast.success(`Recalculated ${data.recalculated} commission(s)`);
    return data;
  }, []);

  const runMonthlyCycle = useCallback(async (month: number, year: number) => {
    const { data } = await api.post<{ processed: number; month: number; year: number }>(
      ENDPOINTS.AMBASSADORS.RUN_CYCLE,
      { month, year }
    );
    toast.success(`Monthly cycle complete — ${data.processed} ambassador(s) processed`);
    return data;
  }, []);

  const fetchPool = useCallback(async (params?: { page?: number; page_size?: number }) => {
    const { data } = await api.get<PaginatedResponse<LeadershipPool>>(ENDPOINTS.AMBASSADORS.POOL, { params });
    return data;
  }, []);

  const calculatePool = useCallback(async (month: number, year: number) => {
    const { data } = await api.post<LeadershipPool>(ENDPOINTS.AMBASSADORS.CALCULATE_POOL, { month, year });
    toast.success(`Pool calculated: $${data.total_pool_amount}`);
    return data;
  }, []);

  return {
    ambassadors,
    totalPages,
    loading,
    fetchAmbassadors,
    getAmbassador,
    updateAmbassador,
    promoteAmbassador,
    evaluateRank,
    evaluateAll,
    createBonus,
    updateBonus,
    createPayout,
    cancelPayout,
    fetchPayouts,
    updatePayout,
    bulkUpdatePayouts,
    bulkApproveCommissions,
    fetchAmbassadorCommissions,
    updateCommission,
    fetchAmbassadorBonuses,
    fetchAmbassadorPayouts,
    fetchTravel,
    awardTravel,
    updateTravel,
    fetchAmbassadorTraining,
    completeTraining,
    removeTraining,
    fetchAmbassadorActivity,
    fetchDownline,
    fetchGlobalActivity,
    fetchGlobalCommissions,
    fetchGlobalBonuses,
    fetchGlobalTravel,
    fetchGlobalTraining,
    fetchAmbassadorAnalytics,
    recalculateCommissions,
    runMonthlyCycle,
    fetchPool,
    calculatePool,
  };
}
