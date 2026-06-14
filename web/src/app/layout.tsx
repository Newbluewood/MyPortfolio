import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { clientEnv } from "@/lib/env/client";
import { LanguageProvider } from "@/lib/i18n/context";

import "./globals.css";

const ChatDock = dynamic(() =>
  import("@/components/chat-dock").then((m) => ({ default: m.ChatDock })),
);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${clientEnv.NEXT_PUBLIC_DISPLAY_NAME} — Portfolio`,
    template: `%s — ${clientEnv.NEXT_PUBLIC_DISPLAY_NAME}`,
  },
  description:
    "Portfolio with GitHub projects and a retrieval-augmented assistant.",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 45 32'%3E%3Cdefs%3E%3ClinearGradient id='nbw-grad' x1='0%25' y1='0%25' x2='100%25' y2='0%25'%3E%3Cstop offset='0%25' stop-color='%238b6eff' /%3E%3Cstop offset='50%25' stop-color='%2358adff' /%3E%3Cstop offset='100%25' stop-color='%233ee6df' /%3E%3C/linearGradient%3E%3C/defs%3E%3Ctext x='50%25' y='55%25' font-family='sans-serif' font-weight='900' font-size='15px' fill='url(%23nbw-grad)' dominant-baseline='middle' text-anchor='middle'%3ENBW%3C/text%3E%3C/svg%3E",
        type: "image/svg+xml",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0f14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased overflow-x-hidden`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-[#0b0f14] font-sans text-zinc-100">
        <LanguageProvider>
          <SiteHeader />
          <main className="min-w-0 flex-1">{children}</main>
          <SiteFooter />
          <ChatDock />
        </LanguageProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
