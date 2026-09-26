"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { LANGUAGES, type LanguageId } from "@/lib/i18n";
import { GENRES, REGIONS, type RegionId } from "@/lib/regions";
import { Icon, Thumb } from "@/components/ui";

type ArtistOption = { artistId: string; name: string; thumbnail?: string; subtitle?: string };

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { prefs, t, updatePrefs, toggleFavorite, favorites } = useApp();
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<LanguageId>(prefs.language);
  const [region, setRegion] = useState<RegionId>(prefs.region);
  const [genres, setGenres] = useState<string[]>(prefs.genres ?? []);
  const [artists, setArtists] = useState<{ regional: ArtistOption[]; others: ArtistOption[] }>({
    regional: [],
    others: [],
  });
  const [picked, setPicked] = useState<ArtistOption[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLanguage(prefs.language);
    setRegion(prefs.region);
  }, [prefs.language, prefs.region]);

  useEffect(() => {
    if (step !== 3) return;
    setLoadingArtists(true);
    fetch(`/api/artists?region=${region}&hl=${language}`)
      .then((r) => r.json())
      .then((data) => setArtists({ regional: data.regional ?? [], others: data.others ?? [] }))
      .catch(() => setArtists({ regional: [], others: [] }))
      .finally(() => setLoadingArtists(false));
  }, [step, region, language]);

  const togglePick = (artist: ArtistOption) =>
    setPicked((prev) =>
      prev.some((p) => p.artistId === artist.artistId)
        ? prev.filter((p) => p.artistId !== artist.artistId)
        : [...prev, artist],
    );

  const finish = async () => {
    setSaving(true);
    await updatePrefs({ language, region, genres, onboarded: true });
    for (const artist of picked) {
      if (!favorites.some((f) => f.artistId === artist.artistId)) {
        await toggleFavorite({
          artistId: artist.artistId,
          name: artist.name,
          thumbnail: artist.thumbnail ?? null,
          region,
        });
      }
    }
    setSaving(false);
    onDone();
  };

  const info = REGIONS[region] ?? REGIONS.GLOBAL;

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#0b0812]/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center px-5 py-10">
        <div className="mb-6 text-center">
          <p className="text-4xl">🎧</p>
          <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">{t("welcome")}</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-white/55">{t("onboardIntro")}</p>
        </div>

        <div className="mb-6 flex justify-center gap-2">
          {[0, 1, 2, 3].map((s) => (
            <span
              key={s}
              className={`h-1.5 w-10 rounded-full transition ${s <= step ? "bg-fuchsia-500" : "bg-white/15"}`}
            />
          ))}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
          {step === 0 && (
            <div>
              <h2 className="mb-4 text-lg font-bold text-white">{t("chooseLanguage")}</h2>
              <div className="grid grid-cols-2 gap-3">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      setLanguage(l.id);
                      void updatePrefs({ language: l.id });
                    }}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-start transition ${
                      language === l.id
                        ? "border-fuchsia-500 bg-fuchsia-500/15"
                        : "border-white/10 bg-white/5 hover:border-white/25"
                    }`}
                  >
                    <span className="text-2xl">{l.flag}</span>
                    <span>
                      <span className="block font-semibold text-white">{l.native}</span>
                      <span className="block text-xs text-white/50">{l.label}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="mb-1 text-lg font-bold text-white">{t("chooseRegion")}</h2>
              <p className="mb-4 text-xs text-white/45">
                {t("detectedFrom")} · {prefs.country} → {info.emoji} {info.label}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {(Object.keys(REGIONS) as RegionId[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegion(r)}
                    className={`rounded-2xl border p-4 text-start transition ${
                      region === r
                        ? "border-fuchsia-500 bg-fuchsia-500/15"
                        : "border-white/10 bg-white/5 hover:border-white/25"
                    }`}
                  >
                    <span className="text-2xl">{REGIONS[r].emoji}</span>
                    <span className="mt-1 block text-sm font-semibold text-white">{REGIONS[r].label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="mb-4 text-lg font-bold text-white">{t("chooseGenres")}</h2>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => {
                  const on = genres.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      onClick={() =>
                        setGenres((prev) => (on ? prev.filter((x) => x !== g.id) : [...prev, g.id]))
                      }
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        on
                          ? "border-fuchsia-500 bg-fuchsia-500/20 text-white"
                          : "border-white/10 bg-white/5 text-white/70 hover:border-white/25"
                      }`}
                    >
                      {g.emoji} {g.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="mb-1 text-lg font-bold text-white">{t("chooseArtists")}</h2>
              <p className="mb-4 text-xs text-white/45">
                {info.emoji} {info.label} · {picked.length} selected
              </p>
              {loadingArtists ? (
                <div className="flex items-center gap-3 py-10 text-white/50">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-fuchsia-400" />
                  {t("loading")}
                </div>
              ) : (
                <div className="max-h-[45vh] overflow-y-auto pe-1">
                  <ArtistGrid list={artists.regional} picked={picked} onToggle={togglePick} />
                  {artists.others.length > 0 && (
                    <>
                      <p className="mb-2 mt-5 text-sm font-semibold text-white/70">{t("fromOtherRegions")}</p>
                      <ArtistGrid list={artists.others} picked={picked} onToggle={togglePick} />
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/70 disabled:opacity-30"
          >
            {t("back")}
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-2 rounded-full bg-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-fuchsia-400"
            >
              {t("continue")} {Icon.chevron("h-4 w-4")}
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={saving}
              className="rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-6 py-2.5 text-sm font-bold text-black disabled:opacity-60"
            >
              {saving ? t("loading") : t("finish")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ArtistGrid({
  list,
  picked,
  onToggle,
}: {
  list: ArtistOption[];
  picked: ArtistOption[];
  onToggle: (a: ArtistOption) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {list.map((a) => {
        const on = picked.some((p) => p.artistId === a.artistId);
        return (
          <button key={a.artistId} onClick={() => onToggle(a)} className="text-center">
            <div className={`relative rounded-full p-1 transition ${on ? "bg-fuchsia-500" : "bg-transparent"}`}>
              <Thumb src={a.thumbnail} alt={a.name} className="aspect-square w-full" rounded="rounded-full" />
              {on && (
                <span className="absolute bottom-1 end-1 grid h-6 w-6 place-items-center rounded-full bg-fuchsia-500 text-white">
                  {Icon.check("h-4 w-4")}
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-xs font-medium text-white">{a.name}</p>
            {a.subtitle && <p className="truncate text-[10px] text-white/40">{a.subtitle}</p>}
          </button>
        );
      })}
    </div>
  );
}
