"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, LayoutDashboard, BarChart3, Users, CreditCard, FileText, MessageSquare, Brain, Zap, Activity, ArrowLeftRight, Crown, Star, Wallet, ScrollText, Settings, Server, Terminal, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Users", href: "/users", icon: Users },
  { label: "Plans", href: "/plans", icon: CreditCard },
  { label: "Subscriptions", href: "/subscriptions", icon: Crown },
  { label: "Payments", href: "/payments", icon: Wallet },
  { label: "Content", href: "/content", icon: FileText },
  { label: "Tickets", href: "/tickets", icon: MessageSquare },
  { label: "Strategies", href: "/strategies", icon: Brain },
  { label: "Signals", href: "/signals", icon: Zap },
  { label: "Executions", href: "/executions", icon: Activity },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Ambassadors", href: "/ambassadors", icon: Star },
  { label: "System Health", href: "/system", icon: Server },
  { label: "Logs", href: "/logs", icon: Terminal },
  { label: "Tasks", href: "/tasks", icon: ListChecks },
  { label: "Audit Logs", href: "/audit-logs", icon: ScrollText },
  { label: "Config", href: "/config", icon: Settings },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-dark-200 border-r border-white/5 z-50 lg:hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-neon/20 flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5 text-neon" />
                </div>
                <span className="text-xl font-bold text-gradient">EulerX</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)]">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-neon/10 text-neon border border-neon/20"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
