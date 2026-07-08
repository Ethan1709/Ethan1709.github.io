import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import {
  WRITEUPS,
  getWriteupBody,
  getWriteupMeta,
  CATEGORY_ICONS,
  DIFF_TONE,
} from "@/lib/writeups";

export function generateStaticParams() {
  return WRITEUPS.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = getWriteupMeta(slug);
  if (!meta) return { title: "Write-up introuvable" };
  return { title: `${meta.title} — Write-up`, description: meta.excerpt };
}

export default async function WriteupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = getWriteupMeta(slug);
  if (!meta) notFound();

  const body = getWriteupBody(slug);
  const idx = WRITEUPS.findIndex((w) => w.slug === slug);
  const prev = idx > 0 ? WRITEUPS[idx - 1] : null;
  const next = idx < WRITEUPS.length - 1 ? WRITEUPS[idx + 1] : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <Link href="/writeups" className="font-code text-xs text-[var(--muted)] transition-colors hover:text-[var(--accent)]">
        ← Tous les write-ups
      </Link>

      <header className="mt-6 border-b border-[var(--border)] pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip chip-accent !text-[11px]">
            {CATEGORY_ICONS[meta.category] ?? "📄"} {meta.category}
          </span>
          <span className={`chip !text-[11px] ${DIFF_TONE[meta.difficulty]}`}>{meta.difficulty}</span>
        </div>

        <h1 className="font-display mt-5 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          {meta.title}
        </h1>
        <p className="font-code mt-3 text-sm text-[var(--text-2)]">
          <span className="text-[var(--accent)]">{meta.platform}</span> · {meta.challenge}
          {meta.author ? ` · auteur ${meta.author}` : ""}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {meta.tags.map((t) => (
            <span key={t} className="chip !text-[10px]">{t}</span>
          ))}
        </div>
      </header>

      <article className="mt-4 text-[15px]">
        <Markdown content={body} />
      </article>

      {/* prev / next */}
      <nav className="mt-14 grid gap-3 border-t border-[var(--border)] pt-8 sm:grid-cols-2">
        {prev ? (
          <Link href={`/writeups/${prev.slug}`} className="card card-hover p-4">
            <span className="font-code text-[11px] text-[var(--muted)]">← Précédent</span>
            <p className="mt-1 text-sm font-medium text-[var(--text)]">{prev.title}</p>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/writeups/${next.slug}`} className="card card-hover p-4 text-right sm:col-start-2">
            <span className="font-code text-[11px] text-[var(--muted)]">Suivant →</span>
            <p className="mt-1 text-sm font-medium text-[var(--text)]">{next.title}</p>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
