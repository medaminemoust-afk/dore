"use client";

import { useState } from "react";
import { useApp } from "@/components/AppProvider";
import { LANGUAGES, type LanguageId } from "@/lib/i18n";
import { GENRES, REGIONS, type RegionId } from "@/lib/regions";
import { Onboarding } from "@/components/Onboarding";
import { ArtistTile } from "@/components/ui";

export default function SettingsPage() {
  const { t, prefs, updatePrefs, favorites, toast, downloads } = useApp();
  const [redo, setRedo] = useState(false);

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-black">{t("settings")}</h1>

      <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">{t("language")}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              onClick={() => updatePrefs({ language: l.id as LanguageId })}
              className={`rounded-2xl border p-3 text-sm transition ${
                prefs.language === l.id ? "border-fuchsia-500 bg-fuchsia-500/15" : "border-white/10 bg-white/5"
              }`}
            >
              <span className="block text-xl">{l.flag}</span>
              {l.native}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-white/50">{t("region")}</h2>
        <p className="mb-3 text-xs text-white/40">
          {t("detectedFrom")}: {prefs.country}
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(REGIONS) as RegionId[]).map((r) => (
            <button
              key={r}
              onClick={() => updatePrefs({ region: r })}
              className={`rounded-full border px-4 py-2 text-sm ${
                prefs.region === r ? "border-fuchsia-500 bg-fuchsia-500/15" : "border-white/10 bg-white/5 text-white/70"
              }`}
            >
              {REGIONS[r].emoji} {REGIONS[r].label}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">{t("yourGenres")}</h2>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => {
            const on = prefs.genres.includes(g.id);
            return (
              <button
                key={g.id}
                onClick={() =>
                  updatePrefs({
                    genres: on ? prefs.genres.filter((x) => x !== g.id) : [...prefs.genres, g.id],
                  })
                }
                className={`rounded-full border px-4 py-2 text-sm ${
                  on ? "border-fuchsia-500 bg-fuchsia-500/20" : "border-white/10 bg-white/5 text-white/70"
                }`}
              >
                {g.emoji} {g.label}
              </button>
            );
          })}
        </div>
      </section>

      {favorites.length > 0 && (
        <section className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
            {t("favouriteArtists")}
          </h2>
          <div className="flex flex-wrap gap-4">
            {favorites.map((f) => (
              <ArtistTile
                key={f.artistId}
                artist={{ artistId: f.artistId, name: f.name, thumbnail: f.thumbnail ?? undefined }}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => setRedo(true)}
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80"
        >
          🔄 {t("resetOnboarding")}
        </button>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(window.location.origin).then(() => toast(t("copied")));
          }}
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80"
        >
          🔗 {t("shareApp")}
        </button>
      </section>

      <p className="text-xs text-white/30">
        {t("connectionNote")} · {downloads.length} offline {t("tracks")} · Lyrics by LRCLIB.
      </p>

      {redo && <Onboarding onDone={() => setRedo(false)} />}
    </div>
  );
}
