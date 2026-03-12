import { useState, useCallback } from "react";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import type { SystemHealth, PipelineStatus } from "@/types";

export default function useAdminSystem() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [pipeline, setPipeline] = useState<PipelineStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<SystemHealth>(ENDPOINTS.SYSTEM.HEALTH);
      setHealth(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPipeline = useCallback(async () => {
    try {
      const { data } = await api.get<PipelineStatus>(ENDPOINTS.SYSTEM.PIPELINE);
      setPipeline(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  return { health, pipeline, loading, fetchHealth, fetchPipeline };
}
