"use client";

import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
};

export default function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          "rounded-full border-neon/20 border-t-neon animate-spin",
          sizes[size],
          className
        )}
      />
    </div>
  );
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}
