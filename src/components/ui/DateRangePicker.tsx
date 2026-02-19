"use client";

import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
  label?: string;
  className?: string;
}

const inputClass =
  "bg-dark-200 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/20 transition-all duration-200";

export default function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  label,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <p className="text-sm font-medium text-gray-300">{label}</p>}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
          className={inputClass}
        />
        <span className="text-gray-500 text-sm">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndChange(e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  );
}
