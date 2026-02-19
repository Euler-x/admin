"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, ShieldAlert, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ConfirmDialog";
import type { TradingStatus } from "@/types";

interface TradingHaltControlProps {
  status: TradingStatus | null;
  loading: boolean;
  onHalt: (reason?: string) => void;
  onResume: (reason?: string) => void;
}

export default function TradingHaltControl({
  status,
  loading,
  onHalt,
  onResume,
}: TradingHaltControlProps) {
  const [reason, setReason] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  if (!status) {
    return (
      <div className="bg-dark-200/60 border border-white/5 rounded-2xl p-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-white/5 rounded-xl" />
          <div className="space-y-2">
            <div className="h-4 w-40 bg-white/5 rounded" />
            <div className="h-3 w-64 bg-white/5 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const isHalted = status.halted;

  const handleHaltClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmHalt = () => {
    onHalt(reason || undefined);
    setShowConfirm(false);
    setReason("");
  };

  const handleResume = () => {
    onResume(reason || undefined);
    setReason("");
  };

  return (
    <>
      <div
        className={`rounded-2xl border p-6 transition-all duration-300 ${
          isHalted
            ? "bg-red-500/5 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.08)]"
            : "bg-neon/5 border-neon/20 shadow-[0_0_20px_rgba(57,255,20,0.06)]"
        }`}
      >
        {/* Status header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                isHalted ? "bg-red-500/10" : "bg-neon/10"
              }`}
            >
              {isHalted ? (
                <AlertTriangle className="h-6 w-6 text-red-400" />
              ) : (
                <CheckCircle className="h-6 w-6 text-neon" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {isHalted ? (
                  <>
                    <ShieldAlert className="h-4 w-4 text-red-400" />
                    Trading Halted
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 text-neon" />
                    Trading Active
                  </>
                )}
              </h3>
              {isHalted ? (
                <p className="text-sm text-red-300/70 mt-0.5">
                  {status.reason || "No reason provided"}{" "}
                  {status.halted_by && (
                    <span className="text-gray-500">
                      &mdash; halted by {status.halted_by}
                    </span>
                  )}
                  {status.strategies_halted > 0 && (
                    <span className="text-gray-500">
                      {" "}
                      &middot; {status.strategies_halted} strategies stopped
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-sm text-gray-400 mt-0.5">
                  All systems operational. Strategies are executing normally.
                </p>
              )}
            </div>
          </div>

          {/* Action area */}
          <div className="flex items-center gap-3 sm:flex-shrink-0">
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isHalted ? "Resume reason..." : "Halt reason..."}
              className="bg-dark-300/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 transition-colors w-48"
            />
            {isHalted ? (
              <Button
                variant="primary"
                onClick={handleResume}
                loading={loading}
                className="shadow-[0_0_16px_rgba(57,255,20,0.25)] hover:shadow-[0_0_24px_rgba(57,255,20,0.4)]"
              >
                Resume Trading
              </Button>
            ) : (
              <Button
                variant="danger"
                onClick={handleHaltClick}
                loading={loading}
                className="shadow-[0_0_16px_rgba(239,68,68,0.2)] hover:shadow-[0_0_24px_rgba(239,68,68,0.35)]"
              >
                Halt Trading
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Confirm dialog for halt action */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmHalt}
        title="Halt All Trading"
        message={`This will immediately stop all active strategies and prevent new executions across the platform.${
          reason ? ` Reason: "${reason}"` : ""
        } Are you sure you want to proceed?`}
        confirmText="Halt Trading"
        confirmVariant="danger"
        loading={loading}
      />
    </>
  );
}
