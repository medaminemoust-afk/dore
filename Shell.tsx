"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useApp } from "@/components/AppProvider";
import { Onboarding } from "@/components/Onboarding";
import { PlayerBar } from "@/components/PlayerBar";
import { Icon } from "@/components/ui";

export function Shell({ children }: { children: ReactNode }) {
  const { ready, prefs, t, toasts, online, playlists, toast } = useApp();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (ready && !prefs.onboarded) setShowOnboarding(true);
  }, [ready, prefs.onboarded]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const nav = [
    { href: "/", label: t("home"), icon: Icon.home },
    { href: "/search", label: t("search"), icon: Icon.search },
    { href: "/library", label: t("library"), icon: Icon.library },
    { href: "/downloads", label: t("downloads"), icon: Icon.download },
    { href: "/settings", label: t("settings"), icon: Icon.settings },
  ];

  return (
    <div className="min-h-screen bg-[#0b0812] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(217,70,239,0.18),transparent),radial-gradient(900px_500px_at_90%_0%,rgba(34,211,238,0.12),transparent)]" />

      <div className="relative flex">
        {/* sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-e border-white/5 bg-black/20 p-4 md:flex">
          <Link href="/" className="mb-6 flex items-center gap-2 px-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 text-lg">
              🎧
            </span>
            <span>
              <span className="block text-base font-black leading-tight">InnerSound</span>
              <span className="block text-[10px] text-white/40">{t("tagline")}</span>
            </span>
          </Link>

          <nav className="space-y-1">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    active ? "bg-white/10 font-semibold text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.icon("h-5 w-5")}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
            <p className="px-3 pb-2 text-[11px] uppercase tracking-wide text-white/35">{t("playlists")}</p>
            <div className="space-y-0.5">
              {playlists.map((p) => (
                <Link
                  key={p.id}
                  href={`/playlist/${p.id}`}
                  className="block truncate rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white"
                >
                  🎵 {p.name}
                </Link>
              ))}
              {!playlists.length && <p className="px-3 text-xs text-white/25">—</p>}
            </div>
          </div>

          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.origin).then(() => toast(t("copied")));
            }}
            className="mt-4 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/60 hover:border-white/25"
          >
            🔗 {t("shareApp")}
          </button>
        </aside>

        {/* main */}
        <main className="min-h-screen flex-1 pb-40 md:pb-32">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/5 bg-[#0b0812]/85 px-4 py-3 backdrop-blur-xl">
            <Link href="/" className="text-xl md:hidden">
              🎧
            </Link>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
              }}
              className="flex flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2"
            >
              {Icon.search("h-4 w-4 text-white/40")}
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full bg-transparent text-sm outline-none placeholder:text-white/35"
              />
            </form>
            <span className="hidden rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/50 sm:block">
              {prefs.country} · {prefs.region}
            </span>
          </header>

          {!online && (
            <p className="bg-amber-500/15 px-4 py-2 text-center text-xs text-amber-200">{t("offlineMode")}</p>
          )}

          <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6">{children}</div>
        </main>
      </div>

      {/* mobile nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-white/10 bg-[#0d0a15]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] ${
                active ? "text-fuchsia-400" : "text-white/50"
              }`}
            >
              {item.icon("h-5 w-5")}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="fixed bottom-36 left-1/2 z-[90] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((toastItem) => (
          <div
            key={toastItem.id}
            className="rounded-full border border-white/10 bg-black/85 px-4 py-2 text-sm text-white shadow-xl"
          >
            {toastItem.message}
          </div>
        ))}
      </div>

      <div className="pb-16 md:pb-0">
        <PlayerBar />
      </div>

      {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}
    </div>
  );
}
