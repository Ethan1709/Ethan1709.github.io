import Link from "next/link";
import Reveal from "@/components/Reveal";
import { WRITEUPS, CATEGORY_ICONS, DIFF_TONE } from "@/lib/writeups";

export const metadata = {
  title: "Write-ups — Ethan Benyayer",
  description: "Analyses détaillées de challenges Root-Me : web, forensic, réseau, exploitation binaire.",
};

export default function WriteupsPage() {
  const categories = Array.from(new Set(WRITEUPS.map((w) => w.category)));

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <Reveal>
        <p className="section-label">Write-ups</p>
        <h1 className="font-display mt-3 text-4xl font-bold tracking-tight md:text-5xl">
          Analyses <span className="grad-text">techniques</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-2)]">
          Analyses détaillées de challenges et de techniques — de la reconnaissance à
          l&apos;exploitation. {WRITEUPS.length} write-ups répartis sur {categories.length} domaines,
          rédigés pendant mes sidequests à l&apos;École 2600.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c} className="chip">
              {CATEGORY_ICONS[c] ?? "📄"} {c} ({WRITEUPS.filter((w) => w.category === c).length})
            </span>
          ))}
        </div>
      </Reveal>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {WRITEUPS.map((w, idx) => (
          <Reveal key={w.slug} delay={(idx % 2) * 70}>
            <Link href={`/writeups/${w.slug}`} className="card card-hover flex h-full flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-base">{CATEGORY_ICONS[w.category] ?? "📄"}</span>
                  <span className="font-code uppercase tracking-wider text-[var(--accent)]">{w.category}</span>
                </div>
                <span className={`chip shrink-0 !text-[10px] ${DIFF_TONE[w.difficulty]}`}>
                  {w.difficulty}
                </span>
              </div>

              <h2 className="font-display mt-3 text-lg font-semibold leading-snug text-[var(--text)]">
                {w.title}
              </h2>
              <p className="font-code mt-1 text-xs text-[var(--muted)]">{w.challenge}</p>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--text-2)]">{w.excerpt}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {w.tags.slice(0, 4).map((t) => (
                  <span key={t} className="chip !text-[10px]">{t}</span>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4 text-xs">
                <span className="font-code text-[var(--muted)]">{w.platform}</span>
                <span className="font-code text-[var(--text-2)] transition-colors group-hover:text-[var(--accent)]">
                  Lire →
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
