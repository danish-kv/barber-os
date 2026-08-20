import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { DemoProvider } from "@/lib/demo-provider";
import { PwaClient } from "@/components/pwa/pwa-client";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: {
    default: "Royal Cuts — Barbershop OS",
    template: "%s · Royal Cuts",
  },
  description:
    "The operating system for modern barbershops and salons in Kerala. Bookings, queue, staff, payments, inventory and analytics in one place.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Royal Cuts",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // No maximumScale: pinch-zoom stays available (a11y). Double-tap zoom on
  // controls is prevented per-element via touch-action in globals.css.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#211a13" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh-full flex flex-col bg-background text-foreground">
        <DemoProvider>
          <TooltipProvider delayDuration={150}>
            {children}
            <Toaster position="top-center" richColors closeButton />
            <PwaClient />
          </TooltipProvider>
        </DemoProvider>
      </body>
    </html>
  );
}
