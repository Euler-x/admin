"use client";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Search } from "lucide-react";

interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "search";
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function FilterBar({ filters, values, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      {filters.map((filter) => {
        if (filter.type === "search") {
          return (
            <div key={filter.key} className="relative flex-1 min-w-[200px]">
              <Input
                placeholder={filter.placeholder || "Search..."}
                value={values[filter.key] || ""}
                onChange={(e) => onChange(filter.key, e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
          );
        }

        return (
          <div key={filter.key} className="min-w-[160px]">
            <Select
              label={filter.label}
              options={filter.options || []}
              placeholder={filter.placeholder || `All ${filter.label}`}
              value={values[filter.key] || ""}
              onChange={(e) => onChange(filter.key, e.target.value)}
            />
          </div>
        );
      })}
    </div>
  );
}
