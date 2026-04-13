"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, LogIn } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import useAuth from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const { loading, login } = useAuth();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated && user?.is_admin) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    await login(email.trim(), password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon/5 rounded-full blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-4 overflow-hidden">
            <img src="/icon.svg" alt="EulerX" className="h-12 w-12" />
          </div>
          <h1 className="text-2xl font-bold text-white">EulerX Admin</h1>
          <p className="text-sm text-gray-400 mt-2">Sign in with your admin credentials</p>
        </div>

        <div className="bg-dark-200/80 backdrop-blur-xl border border-white/5 rounded-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="admin@eulerx.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <Button type="submit" size="lg" className="w-full group" loading={loading}>
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
