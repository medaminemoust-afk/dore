import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";
import { PlayerProvider } from "@/components/PlayerProvider";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "InnerSound — free music streaming",
  description:
    "InnerSound streams real music from YouTube Music: region-aware artist picks, playlists, favourites, offline library, synced lyrics and multi-language UI.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "InnerSound" },
  openGraph: {
    title: "InnerSound",
    description: "Your music, your region, your vibe.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0812",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0b0812] text-white antialiased">
        <AppProvider>
          <PlayerProvider>
            <Shell>{children}</Shell>
          </PlayerProvider>
        </AppProvider>
      </body>
    </html>
  );
}
