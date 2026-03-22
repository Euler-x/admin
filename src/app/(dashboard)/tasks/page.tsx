"use client";

import { useState, useEffect, useCallback } from "react";
import PageTransition from "@/components/PageTransition";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { PageSpinner } from "@/components/ui/Spinner";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import { RefreshCw, CalendarClock, Layers } from "lucide-react";
import toast from "react-hot-toast";

interface CeleryTask {
  name: string;
  task: string;
  schedule: string;
  queue: string;
  enabled: boolean;
  description: string;
}

const QUEUE_COLORS: Record<string, string> = {
  analysis:
    "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  execution:
    "bg-neon/10 text-neon border border-neon/20",
  maintenance:
    "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  notifications:
    "bg-amber-500/10 text-amber-400 border border-amber-500/20",
};

function QueueBadge({ queue }: { queue: string }) {
  const colorClass =
    QUEUE_COLORS[queue] ||
    "bg-white/5 text-gray-400 border border-white/10";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg ${colorClass}`}
    >
      {queue}
    </span>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<CeleryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingTask, setTogglingTask] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(ENDPOINTS.SYSTEM.TASKS);
      setTasks(data);
    } catch {
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleToggle = async (task: CeleryTask) => {
    setTogglingTask(task.name);
    try {
      await api.put(ENDPOINTS.SYSTEM.TOGGLE_TASK(task.name), {
        enabled: !task.enabled,
      });
      setTasks((prev) =>
        prev.map((t) =>
          t.name === task.name ? { ...t, enabled: !t.enabled } : t
        )
      );
      toast.success(
        `${task.name} ${!task.enabled ? "enabled" : "disabled"} successfully`
      );
    } catch {
      toast.error(`Failed to toggle ${task.name}`);
    } finally {
      setTogglingTask(null);
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Scheduled Tasks</h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage Celery Beat periodic tasks
            </p>
          </div>
          <button
            onClick={fetchTasks}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-dark-200 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white hover:border-neon/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-dark-200/60 border border-white/5 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500">Total Tasks</p>
            <p className="text-xl font-bold text-white mt-1">{tasks.length}</p>
          </div>
          <div className="bg-dark-200/60 border border-white/5 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500">Enabled</p>
            <p className="text-xl font-bold text-neon mt-1">
              {tasks.filter((t) => t.enabled).length}
            </p>
          </div>
          <div className="bg-dark-200/60 border border-white/5 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500">Disabled</p>
            <p className="text-xl font-bold text-red-400 mt-1">
              {tasks.filter((t) => !t.enabled).length}
            </p>
          </div>
          <div className="bg-dark-200/60 border border-white/5 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500">Queues</p>
            <p className="text-xl font-bold text-white mt-1">
              {new Set(tasks.map((t) => t.queue)).size}
            </p>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-dark-200/60 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Queue
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tasks.map((task) => (
                  <tr
                    key={task.name}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {task.name}
                        </p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">
                          {task.task}
                        </p>
                      </div>
                    </td>

                    {/* Schedule */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-sm text-gray-300 font-mono">
                          {task.schedule}
                        </span>
                      </div>
                    </td>

                    {/* Queue */}
                    <td className="px-6 py-4">
                      <QueueBadge queue={task.queue} />
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            task.enabled ? "bg-neon" : "bg-red-400"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            task.enabled ? "text-neon" : "text-red-400"
                          }`}
                        >
                          {task.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-400 max-w-xs truncate">
                        {task.description}
                      </p>
                    </td>

                    {/* Toggle Action */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggle(task)}
                        disabled={togglingTask === task.name}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                          task.enabled ? "bg-neon/30" : "bg-white/10"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ${
                            task.enabled
                              ? "translate-x-6 bg-neon"
                              : "translate-x-1 bg-gray-500"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Layers className="h-10 w-10 mb-3 text-gray-600" />
              <p className="text-sm">No scheduled tasks found</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
