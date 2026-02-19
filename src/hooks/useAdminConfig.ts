import { useState, useCallback } from "react";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import toast from "react-hot-toast";
import type { ConfigEntry, ConfigUpdate } from "@/types";

export default function useAdminConfig() {
  const [configs, setConfigs] = useState<ConfigEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<ConfigEntry[]>(ENDPOINTS.CONFIG.LIST);
      setConfigs(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const getConfig = useCallback(async (key: string) => {
    const { data } = await api.get<ConfigEntry>(ENDPOINTS.CONFIG.GET(key));
    return data;
  }, []);

  const upsertConfig = useCallback(async (key: string, payload: ConfigUpdate) => {
    const { data } = await api.put<ConfigEntry>(ENDPOINTS.CONFIG.SET(key), payload);
    toast.success("Config saved");
    return data;
  }, []);

  const deleteConfig = useCallback(async (key: string) => {
    await api.delete(ENDPOINTS.CONFIG.DELETE(key));
    toast.success("Config deleted");
  }, []);

  return { configs, loading, fetchConfigs, getConfig, upsertConfig, deleteConfig };
}
