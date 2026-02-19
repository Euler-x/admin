import { useState, useCallback } from "react";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import toast from "react-hot-toast";
import type { LearningContent, ContentCreate, ContentUpdate } from "@/types";

export default function useAdminContent() {
  const [content, setContent] = useState<LearningContent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<LearningContent[]>(ENDPOINTS.CONTENT.LIST);
      setContent(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const createContent = useCallback(async (payload: ContentCreate) => {
    const { data } = await api.post<LearningContent>(ENDPOINTS.CONTENT.CREATE, payload);
    toast.success("Content created");
    return data;
  }, []);

  const updateContent = useCallback(async (id: string, payload: ContentUpdate) => {
    const { data } = await api.put<LearningContent>(ENDPOINTS.CONTENT.UPDATE(id), payload);
    toast.success("Content updated");
    return data;
  }, []);

  const deleteContent = useCallback(async (id: string) => {
    await api.delete(ENDPOINTS.CONTENT.DELETE(id));
    toast.success("Content deleted");
  }, []);

  return { content, loading, fetchContent, createContent, updateContent, deleteContent };
}
