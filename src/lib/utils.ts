import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number, decimals = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function isUuid(value: string): boolean {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function toSafeUserRef(value: string): string {
  const compact = value.replace(/[^a-zA-Z0-9]/g, "");
  return compact ? `user_${compact.slice(0, 8).toLowerCase()}` : "Unknown user";
}

export function getSafeUserLabel(input: {
  email?: string | null;
  walletAddressHash?: string | null;
  userId?: string | null;
}): string {
  const email = input.email?.trim();
  if (email) return email;

  const wallet = input.walletAddressHash?.trim();
  if (wallet && !isUuid(wallet)) return shortenAddress(wallet);

  const userId = input.userId?.trim();
  if (userId) return toSafeUserRef(userId);
  if (wallet) return toSafeUserRef(wallet);
  return "Unknown user";
}

export function formatPnl(pnl: number | null | undefined): {
  text: string;
  color: string;
} {
  if (pnl == null) return { text: "—", color: "text-gray-400" };
  const prefix = pnl >= 0 ? "+" : "";
  return {
    text: `${prefix}${formatCurrency(pnl)}`,
    color: pnl >= 0 ? "text-neon" : "text-red-400",
  };
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
