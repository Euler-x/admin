"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, BarChart3, Users, CreditCard, FileText, MessageSquare,
  Brain, Zap, Activity, ArrowLeftRight, Crown, Star, Wallet,
  ScrollText, Settings, Server, LogOut, ShieldAlert, Terminal, ListChecks,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Users", href: "/users", icon: Users },
      { label: "Plans", href: "/plans", icon: CreditCard },
      { label: "Subscriptions", href: "/subscriptions", icon: Crown },
      { label: "Payments", href: "/payments", icon: Wallet },
      { label: "Content", href: "/content", icon: FileText },
      { label: "Config", href: "/config", icon: Settings },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "Tickets", href: "/tickets", icon: MessageSquare },
    ],
  },
  {
    label: "Trading",
    items: [
      { label: "Strategies", href: "/strategies", icon: Brain },
      { label: "Signals", href: "/signals", icon: Zap },
      { label: "Trades", href: "/executions", icon: Activity },
      { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
      { label: "Ambassadors", href: "/ambassadors", icon: Star },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "System Health", href: "/system", icon: Server },
      { label: "Logs", href: "/logs", icon: Terminal },
      { label: "Tasks", href: "/tasks", icon: ListChecks },
      { label: "Audit Logs", href: "/audit-logs", icon: ScrollText },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-dark-200/50 backdrop-blur-xl border-r border-white/5 fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-neon/20 flex items-center justify-center">
            <ShieldAlert className="h-5 w-5 text-neon" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-gradient">EulerX</span>
            <span className="text-xs font-medium text-neon/60 uppercase tracking-wider">Admin</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-4 mb-2 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-neon/10 text-neon border border-neon/20 shadow-neon-sm"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
