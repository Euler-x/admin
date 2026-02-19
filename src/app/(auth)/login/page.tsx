"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, Wallet, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import useAuth from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const { loading, connectWallet, getSignMessage } = useAuth();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState("");
  const [step, setStep] = useState<"address" | "sign">("address");
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");

  useEffect(() => {
    if (isAuthenticated && user?.is_admin) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleGetMessage = async () => {
    if (!walletAddress.trim()) return;
    const msg = await getSignMessage(walletAddress.trim());
    if (msg) {
      setMessage(msg);
      setStep("sign");
    }
  };

  const handleLogin = async () => {
    if (!signature.trim()) return;
    await connectWallet(walletAddress.trim(), message, signature.trim());
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
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-neon/10 border border-neon/20 mb-4">
            <ShieldAlert className="h-8 w-8 text-neon" />
          </div>
          <h1 className="text-2xl font-bold text-white">EulerX Admin</h1>
          <p className="text-sm text-gray-400 mt-2">Sign in with your admin wallet</p>
        </div>

        <div className="bg-dark-200/80 backdrop-blur-xl border border-white/5 rounded-2xl p-8">
          {step === "address" ? (
            <div className="space-y-4">
              <Input
                label="Wallet Address"
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
              <Button size="lg" className="w-full" onClick={handleGetMessage} loading={loading}>
                <Wallet className="h-4 w-4" />
                Get Sign Message
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-neon/5 border border-neon/20">
                <p className="text-xs text-gray-400 mb-1">Message to sign:</p>
                <p className="text-sm text-neon font-mono break-all">{message}</p>
              </div>
              <Input
                label="Signature"
                placeholder="Paste your signature here..."
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
              />
              <Button size="lg" className="w-full group" onClick={handleLogin} loading={loading}>
                Sign In
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <button
                onClick={() => setStep("address")}
                className="w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Back to wallet address
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
