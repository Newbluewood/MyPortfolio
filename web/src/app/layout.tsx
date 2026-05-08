import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { clientEnv } from "@/lib/env/client";

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
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#0b0f14] font-sans text-zinc-100">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <ChatDock />
      </body>
    </html>
  );
}
