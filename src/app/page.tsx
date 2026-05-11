"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthHasHydrated, useAuthStore } from "@/stores/authStore";
import { PageSpinner } from "@/components/ui/Spinner";

export default function RootPage() {
  const hasHydrated = useAuthHasHydrated();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) return;
    if (isAuthenticated && user?.is_admin) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  return <PageSpinner />;
}
