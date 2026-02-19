"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/ui/StatusBadge";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { PageSpinner } from "@/components/ui/Spinner";
import useAdminTickets from "@/hooks/useAdminTickets";
import { formatDate, formatDateTime, capitalize } from "@/lib/utils";
import type { TicketDetail, TicketStatus, TicketPriority } from "@/types";

const statusOptions = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const priorityVariant: Record<TicketPriority, "danger" | "warning" | "warning" | "success"> = {
  urgent: "danger",
  high: "warning",
  medium: "warning",
  low: "success",
};

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getTicket, updateStatus, reply } = useAdminTickets();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadTicket = async () => {
    try {
      const data = await getTicket(id);
      setTicket(data);
      setSelectedStatus(data.status);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === ticket?.status) return;
    setUpdatingStatus(true);
    try {
      await updateStatus(id, selectedStatus);
      await loadTicket();
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleReply = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await reply(id, message);
      setMessage("");
      await loadTicket();
    } finally {
      setSending(false);
    }
  };

  if (loading) return <PageSpinner />;
  if (!ticket) {
    return (
      <div className="text-center text-gray-500 py-20">Ticket not found</div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl">
        {/* Back link */}
        <Link
          href="/tickets"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tickets
        </Link>

        {/* Ticket info card */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white">{ticket.subject}</h1>
                <p className="text-sm text-gray-400 mt-1">
                  Created {formatDate(ticket.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Badge variant={priorityVariant[ticket.priority]}>
                  {capitalize(ticket.priority)}
                </Badge>
                <StatusBadge status={ticket.status} />
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <p className="text-sm text-gray-300 leading-relaxed">{ticket.description}</p>
            </div>
          </div>
        </Card>

        {/* Status update */}
        <Card>
          <h2 className="text-sm font-semibold text-white mb-3">Update Status</h2>
          <div className="flex items-end gap-3">
            <div className="flex-1 max-w-xs">
              <Select
                options={statusOptions}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              />
            </div>
            <Button
              onClick={handleStatusUpdate}
              loading={updatingStatus}
              disabled={selectedStatus === ticket.status}
              size="md"
            >
              Update
            </Button>
          </div>
        </Card>

        {/* Messages thread */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Messages</h2>
          <div className="space-y-3">
            {ticket.messages.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No messages yet</p>
            ) : (
              ticket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-xl px-4 py-3 border ${
                    msg.is_admin
                      ? "border-l-2 border-l-neon/60 border-t-white/5 border-r-white/5 border-b-white/5 bg-dark-200/80"
                      : "border-white/5 bg-dark-300/60"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-300">
                      {msg.is_admin ? (
                        <Badge variant="neon">Admin</Badge>
                      ) : (
                        <Badge variant="default">User</Badge>
                      )}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">{msg.message}</p>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Reply form */}
        <Card>
          <h2 className="text-sm font-semibold text-white mb-3">Reply</h2>
          <div className="space-y-3">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your reply..."
              rows={4}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleReply}
                loading={sending}
                disabled={!message.trim()}
              >
                <Send className="h-4 w-4" />
                Send Reply
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
}
