import { useState, useCallback } from "react";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import toast from "react-hot-toast";
import type { SupportTicket, TicketDetail, SupportMessage, PaginatedResponse } from "@/types";

export default function useAdminTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchTickets = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<SupportTicket>>(ENDPOINTS.TICKETS.LIST, { params });
      setTickets(data.items);
      setTotalPages(data.total_pages);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTicket = useCallback(async (id: string) => {
    const { data } = await api.get<TicketDetail>(ENDPOINTS.TICKETS.GET(id));
    return data;
  }, []);

  const updateStatus = useCallback(async (id: string, status: string) => {
    const { data } = await api.put<SupportTicket>(ENDPOINTS.TICKETS.UPDATE_STATUS(id), { status });
    toast.success("Ticket status updated");
    return data;
  }, []);

  const reply = useCallback(async (id: string, message: string) => {
    const { data } = await api.post<SupportMessage>(ENDPOINTS.TICKETS.REPLY(id), { message });
    toast.success("Reply sent");
    return data;
  }, []);

  return { tickets, totalPages, loading, fetchTickets, getTicket, updateStatus, reply };
}
