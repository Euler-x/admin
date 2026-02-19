"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface RevenueChartProps {
  data: Array<{ plan_name: string; subscriptions: number; revenue_usd: number }>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: { plan_name: string; subscriptions: number; revenue_usd: number };
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-dark-200 border border-dark-300 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-sm font-medium text-white mb-1">{label}</p>
      <p className="text-sm text-neon">
        Revenue: {formatCurrency(data.revenue_usd)}
      </p>
      <p className="text-xs text-gray-400 mt-0.5">
        {data.subscriptions} subscription{data.subscriptions !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export default function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
        No data available
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis
            dataKey="plan_name"
            tick={{ fill: "#888", fontSize: 12 }}
            axisLine={{ stroke: "#333" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#888", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) =>
              value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`
            }
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Bar
            dataKey="revenue_usd"
            fill="#39FF14"
            radius={[6, 6, 0, 0]}
            maxBarSize={56}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
