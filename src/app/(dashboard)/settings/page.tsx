"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Save, RotateCcw, CheckCircle, Database, FileText } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import Button from "@/components/ui/Button";
import { PageSpinner } from "@/components/ui/Spinner";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import toast from "react-hot-toast";

interface SettingMeta {
  value: unknown;
  type: string;
  category: string;
  label: string;
  description: string;
  source: "default" | "database";
}

type SettingsMap = Record<string, SettingMeta>;

const CATEGORY_ORDER = ["Trading", "Pipeline", "AI", "Billing", "Email"];
const CATEGORY_COLORS: Record<string, string> = {
  Trading: "border-neon/20 bg-neon/5",
  Pipeline: "border-purple-500/20 bg-purple-500/5",
  AI: "border-cyan-500/20 bg-cyan-500/5",
  Billing: "border-amber-500/20 bg-amber-500/5",
  Email: "border-blue-500/20 bg-blue-500/5",
};
const CATEGORY_LABEL_COLORS: Record<string, string> = {
  Trading: "text-neon",
  Pipeline: "text-purple-400",
  AI: "text-cyan-400",
  Billing: "text-amber-400",
  Email: "text-blue-400",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<SettingsMap>(ENDPOINTS.SETTINGS.LIST);
      setSettings(data);
      // Init edit values from current values
      const vals: Record<string, string> = {};
      for (const [key, meta] of Object.entries(data)) {
        vals[key] = String(meta.value);
      }
      setEditValues(vals);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (key: string) => {
    const meta = settings[key];
    if (!meta) return;

    let parsedValue: unknown = editValues[key];
    if (meta.type === "int") parsedValue = parseInt(editValues[key], 10);
    else if (meta.type === "float") parsedValue = parseFloat(editValues[key]);

    if (meta.type === "int" && isNaN(parsedValue as number)) {
      toast.error("Must be a whole number");
      return;
    }
    if (meta.type === "float" && isNaN(parsedValue as number)) {
      toast.error("Must be a number");
      return;
    }

    setSaving(key);
    try {
      await api.put(ENDPOINTS.SETTINGS.SET(key), {
        value: { value: parsedValue },
      });
      toast.success(`${meta.label} updated`);
      // Mark as DB-sourced
      setSettings((prev) => ({
        ...prev,
        [key]: { ...prev[key], value: parsedValue, source: "database" },
      }));
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(null);
    }
  };

  const handleReset = (key: string) => {
    const meta = settings[key];
    if (meta) {
      setEditValues((prev) => ({ ...prev, [key]: String(meta.value) }));
    }
  };

  const isChanged = (key: string) => {
    const meta = settings[key];
    return meta && String(meta.value) !== editValues[key];
  };

  // Group settings by category
  const grouped: Record<string, [string, SettingMeta][]> = {};
  for (const [key, meta] of Object.entries(settings)) {
    if (!grouped[meta.category]) grouped[meta.category] = [];
    grouped[meta.category].push([key, meta]);
  }

  if (loading) return <PageSpinner />;

  return (
    <PageTransition>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-neon" /> Platform Settings
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Configure trading engine, pipeline, and platform parameters. Changes take effect on the next pipeline run.
          </p>
        </div>

        {/* Category Groups */}
        {CATEGORY_ORDER.filter((cat) => grouped[cat]).map((category) => (
          <div
            key={category}
            className={`rounded-2xl border p-6 ${CATEGORY_COLORS[category] || "border-white/5 bg-dark-200/60"}`}
          >
            <h2 className={`text-lg font-semibold mb-4 ${CATEGORY_LABEL_COLORS[category] || "text-white"}`}>
              {category}
            </h2>
            <div className="space-y-5">
              {grouped[category].map(([key, meta]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Label + description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-white">{meta.label}</label>
                      {meta.source === "database" ? (
                        <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-neon/10 text-neon">
                          <Database className="h-2.5 w-2.5" /> Custom
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-gray-500/10 text-gray-500">
                          <FileText className="h-2.5 w-2.5" /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{meta.description}</p>
                  </div>

                  {/* Input + actions */}
                  <div className="flex items-center gap-2 sm:w-64 shrink-0">
                    {meta.type === "str" && (key === "openrouter_models" || key === "buy_symbol_blocklist") ? (
                      <textarea
                        value={editValues[key] || ""}
                        onChange={(e) =>
                          setEditValues((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        rows={2}
                        className="flex-1 bg-dark-50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/20 font-mono text-xs"
                      />
                    ) : key === "buy_signals_enabled" ? (
                      <select
                        value={editValues[key] || "0"}
                        onChange={(e) =>
                          setEditValues((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        className="flex-1 bg-dark-50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/20"
                      >
                        <option value="0">Disabled (SELL only)</option>
                        <option value="1">Enabled</option>
                      </select>
                    ) : (
                      <input
                        type={meta.type === "int" || meta.type === "float" ? "number" : "text"}
                        step={meta.type === "float" ? "0.01" : "1"}
                        value={editValues[key] || ""}
                        onChange={(e) =>
                          setEditValues((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        className="flex-1 bg-dark-50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/20"
                      />
                    )}

                    {isChanged(key) && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSave(key)}
                          loading={saving === key}
                          className="shrink-0"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <button
                          onClick={() => handleReset(key)}
                          className="text-gray-500 hover:text-gray-300 transition-colors shrink-0"
                          title="Reset"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}

                    {!isChanged(key) && meta.source === "database" && (
                      <CheckCircle className="h-4 w-4 text-neon/50 shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageTransition>
  );
}
