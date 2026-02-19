"use client";

import { Toaster } from "react-hot-toast";
import AppErrorBoundary from "../ErrorBoundary";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppErrorBoundary>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#111111",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            fontSize: "14px",
          },
          success: {
            iconTheme: { primary: "#39FF14", secondary: "#000" },
          },
          error: {
            iconTheme: { primary: "#f87171", secondary: "#000" },
          },
        }}
      />
    </AppErrorBoundary>
  );
}
