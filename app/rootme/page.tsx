"use client";

import { useMemo, useState } from "react";
import { getRootMeData, CAT_ICONS } from "@/lib/rootme";

type StatusFilter = "all" | "solved" | "unsolved";

export default function RootMePage() {
  const data = getRootMeData();
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusFilter>("all");

  const totalChallenges = data.categories.reduce((s, c) => s + c.total, 0);
  const globalPct = Math.round((data.total_solved / totalChallenges) * 100);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.categories
      .filter((c) => !activeCat || c.name === activeCat)
      .map((c) => {
        const solved =
          status === "unsolved"
            ? []
            : c.solved_challenges.filter((n) => n.toLowerCase().includes(q));
        const unsolved =
          status === "solved"
            ? []
            : c.unsolved_challenges.filter((n) => n.toLowerCase().includes(q));
        return { ...c, shownSolved: solved, shownUnsolved: unsolved };
      })
      .filter((c) => c.shownSolved.length + c.shownUnsolved.length > 0);
  }, [data.categories, query, activeCat, status]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="section-label">Root-Me</p>
          <h1 className="font-display mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Challenges <span className="grad-text">résolus</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--text-2)]">
            Ma progression complète sur{" "}
            <a
              href="https://www.root-me.org/Ethanbeny"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] underline-offset-4 hover:underline"
            >
              root-me.org/{data.username}
            </a>
            , mise à jour automatiquement.
          </p>
        </div>
      </div>

      {/* stat tiles */}
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Score total", value: data.score.toLocaleString("fr-FR") },
          { label: "Classement", value: `#${data.rank}` },
          { label: "Challenges résolus", value: `${data.total_solved} / ${totalChallenges}` },
          { label: "Progression globale", value: `${globalPct}%` },
        ].map(({ label, value }) => (
          <div key={label} className="card p-5">
            <p className="text-xs text-[var(--muted)]">{label}</p>
            <p className="font-display mt-1 text-2xl font-bold md:text-3xl">{value}</p>
          </div>
        ))}
      </div>

      {/* controls */}
      <div className="mt-10 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1 md:max-w-sm">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un challenge…"
              className="w-full rounded-xl border border-[var(--border)] bg-white/[0.02] py-2.5 pl-10 pr-4 text-sm text-[var(--text)] placeholder-[var(--muted)] outline-none transition-colors focus:border-[rgba(52,211,153,0.45)]"
            />
          </div>
          <div className="flex overflow-hidden rounded-xl border border-[var(--border)]">
            {(
              [
                ["all", "Tous"],
                ["solved", "Résolus"],
                ["unsolved", "À faire"],
              ] as [StatusFilter, string][]
            ).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setStatus(val)}
                className={`px-4 py-2.5 text-xs font-medium transition-colors ${
                  status === val
                    ? "bg-[var(--accent-dim)] text-[var(--accent-strong)]"
                    : "text-[var(--text-2)] hover:bg-white/[0.03]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCat(null)}
            className={`chip !cursor-pointer !text-[11px] ${!activeCat ? "chip-accent" : "hover:border-[var(--border-strong)]"}`}
          >
            Toutes ({data.categories.length})
          </button>
          {data.categories.map((c) => (
            <button
              key={c.name}
              onClick={() => setActiveCat(activeCat === c.name ? null : c.name)}
              className={`chip !cursor-pointer !text-[11px] ${
                activeCat === c.name ? "chip-accent" : "hover:border-[var(--border-strong)]"
              }`}
            >
              {CAT_ICONS[c.name] ?? "📁"} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* categories */}
      <div className="mt-8 space-y-6">
        {filtered.length === 0 && (
          <div className="card p-12 text-center text-sm text-[var(--muted)]">
            Aucun challenge ne correspond à cette recherche.
          </div>
        )}
        {filtered.map((c) => (
          <section key={c.name} className="card p-6 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">{CAT_ICONS[c.name] ?? "📁"}</span>
                <div>
                  <h2 className="font-display text-lg font-semibold">{c.name}</h2>
                  <p className="font-code text-xs text-[var(--muted)]">
                    {c.solved}/{c.total} résolus · {c.points} pts
                  </p>
                </div>
              </div>
              <span className="font-code text-sm text-[var(--text-2)]">{c.percent}%</span>
            </div>

            <div className="progress mt-4">
              <div className="progress-fill" style={{ width: `${c.percent}%` }} />
            </div>

            {c.shownSolved.length > 0 && (
              <div className="mt-5">
                <p className="mb-2.5 text-[11px] font-medium uppercase tracking-widest text-[var(--accent)]">
                  ✓ Résolus{query && ` (${c.shownSolved.length})`}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {c.shownSolved.map((n) => (
                    <span key={n} className="chip chip-accent">{n}</span>
                  ))}
                </div>
              </div>
            )}

            {c.shownUnsolved.length > 0 && (
              <div className="mt-5">
                <p className="mb-2.5 text-[11px] font-medium uppercase tracking-widest text-[var(--muted)]">
                  ○ À faire{query && ` (${c.shownUnsolved.length})`}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {c.shownUnsolved.map((n) => (
                    <span key={n} className="chip opacity-55">{n}</span>
                  ))}
                </div>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
