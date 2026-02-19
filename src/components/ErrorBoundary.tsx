"use client";

import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import Button from "./ui/Button";
import { AlertTriangle } from "lucide-react";

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-400 mb-6">{error.message || "An unexpected error occurred."}</p>
        <Button variant="secondary" onClick={resetErrorBoundary}>
          Try Again
        </Button>
      </div>
    </div>
  );
}

export default function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ReactErrorBoundary>
  );
}
