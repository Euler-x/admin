import type { Metadata } from "next";
import Providers from "@/components/providers/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "EulerX Admin — Dashboard",
  description: "EulerX admin dashboard for managing the trading platform.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
