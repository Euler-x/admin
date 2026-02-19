"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminTopbar from "@/components/layout/AdminTopbar";
import MobileNav from "@/components/layout/MobileNav";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user && !user.is_admin) {
      toast.error("Access denied. Admin privileges required.");
      logout();
      router.replace("/login");
    }
  }, [isAuthenticated, user, router, logout]);

  if (!isAuthenticated || !user?.is_admin) return null;

  return (
    <div className="min-h-screen">
      <AdminSidebar />
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="lg:pl-64">
        <AdminTopbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
