"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import PageTransition from "@/components/PageTransition";
import Button from "@/components/ui/Button";
import { PageSpinner } from "@/components/ui/Spinner";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import { RefreshCw, Terminal, MonitorCheck } from "lucide-react";
import toast from "react-hot-toast";

const SERVICES = [
  { key: "api", label: "API Error" },
  { key: "api-access", label: "API Access" },
  { key: "worker", label: "Celery Worker" },
  { key: "beat", label: "Celery Beat" },
] as const;

const LINE_COUNTS = [50, 100, 200, 500] as const;

type ServiceKey = (typeof SERVICES)[number]["key"];
type ServiceStatuses = Record<string, string>;

export default function LogsPage() {
  const [selectedService, setSelectedService] = useState<ServiceKey>("api");
  const [logs, setLogs] = useState<string[]>([]);
  const [lineCount, setLineCount] = useState<number>(100);
  const [totalLines, setTotalLines] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [serviceStatuses, setServiceStatuses] = useState<ServiceStatuses>({});
  const [initialLoading, setInitialLoading] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchServiceStatuses = useCallback(async () => {
    try {
      const { data } = await api.get(ENDPOINTS.SYSTEM.SERVICES);
      setServiceStatuses(data);
    } catch {
      // silently fail
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `${ENDPOINTS.SYSTEM.LOGS(selectedService)}?lines=${lineCount}`
      );
      setLogs(data.lines || []);
      setTotalLines(data.total_lines || 0);
    } catch {
      toast.error("Failed to fetch logs");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [selectedService, lineCount]);

  // Scroll to bottom when logs change
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Fetch on mount and when service/lineCount changes
  useEffect(() => {
    fetchLogs();
    fetchServiceStatuses();
  }, [fetchLogs, fetchServiceStatuses]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchLogs, 10_000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, fetchLogs]);

  const statusColor = (status: string) => {
    if (status === "active") return "bg-neon";
    if (status === "inactive") return "bg-red-400";
    return "bg-yellow-400";
  };

  if (initialLoading) return <PageSpinner />;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">System Logs</h1>
            <p className="text-sm text-gray-400 mt-1">
              View real-time logs from all services
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh((v) => !v)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                autoRefresh
                  ? "border-neon/30 text-neon bg-neon/5"
                  : "border-white/10 text-gray-400 bg-dark-200"
              }`}
            >
              Auto-refresh {autoRefresh ? "ON" : "OFF"}
            </button>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-dark-200 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white hover:border-neon/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Service Status Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(serviceStatuses).map(([name, status]) => (
            <div
              key={name}
              className="bg-dark-200/60 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <div className="p-1.5 rounded-lg bg-white/5">
                <MonitorCheck className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 capitalize">{name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div
                    className={`h-2 w-2 rounded-full ${statusColor(status)}`}
                  />
                  <span className="text-sm font-medium text-white capitalize">
                    {status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Service Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {SERVICES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedService(key)}
              className={`px-4 py-2 text-sm rounded-xl border transition-all duration-200 ${
                selectedService === key
                  ? "bg-neon/10 border-neon/30 text-neon font-medium"
                  : "bg-dark-200 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
              }`}
            >
              {label}
            </button>
          ))}

          {/* Line Count Selector */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-500">Lines:</span>
            {LINE_COUNTS.map((count) => (
              <button
                key={count}
                onClick={() => setLineCount(count)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  lineCount === count
                    ? "border-neon/30 text-neon bg-neon/5"
                    : "border-white/10 text-gray-500 bg-dark-200 hover:text-gray-300"
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Log Viewer */}
        <div className="bg-dark-200/60 border border-white/5 rounded-2xl overflow-hidden">
          {/* Log Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-neon" />
              <span className="text-sm font-medium text-gray-300">
                {SERVICES.find((s) => s.key === selectedService)?.label} Logs
              </span>
            </div>
            <span className="text-xs text-gray-500">
              Showing {logs.length} / {totalLines} total lines
            </span>
          </div>

          {/* Terminal Container */}
          <div
            className="bg-black/80 overflow-auto max-h-[600px] p-4 font-mono text-xs leading-relaxed"
            style={{ minHeight: "300px" }}
          >
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[200px] text-gray-600">
                No logs available for this service
              </div>
            ) : (
              logs.map((line, idx) => (
                <pre
                  key={idx}
                  className="text-green-400 whitespace-pre-wrap break-all hover:bg-white/5 px-2 py-0.5 rounded"
                >
                  <span className="text-gray-600 select-none mr-3">
                    {String(idx + 1).padStart(4, " ")}
                  </span>
                  {line}
                </pre>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
