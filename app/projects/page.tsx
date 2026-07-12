import Reveal from "@/components/Reveal";

const PROJECTS = [
  {
    name: "GCP Automated Audit",
    desc: "Outil d'audit automatisé d'un environnement Google Cloud, co-développé en binôme. 67 contrôles CIS Benchmark en Bash + gcloud (IAM, logging, réseau, compute, stockage, Cloud SQL, BigQuery) qui détectent misconfigurations et écarts de conformité, sur un ou plusieurs projets voire une organisation entière.",
    tags: ["Bash", "GCP", "CIS Benchmark", "gcloud", "Audit"],
    status: "Utilisé en mission",
    statusTone: "accent",
    lang: "Bash / gcloud",
  },
  {
    name: "Modèle de rapport de pentest",
    desc: "Template professionnel de rapport de test d'intrusion, conçu from scratch pendant mon alternance chez Cyber Sec Asso : structure des findings, scoring CVSS, synthèse managériale et recommandations de remédiation.",
    tags: ["Pentest", "Méthodologie", "CVSS"],
    status: "Utilisé en mission",
    statusTone: "accent",
    lang: "Documentation",
  },
  {
    name: "Root-Me Tracker",
    desc: "Pipeline de scraping qui récupère ma progression Root-Me (score, classement, challenges par catégorie) et alimente automatiquement ce portfolio en données à jour.",
    tags: ["Python", "Bash", "Scraping", "Automation"],
    status: "Stable",
    statusTone: "accent",
    lang: "Python / Bash",
    link: "https://github.com/Ethan1709",
  },
];

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <Reveal>
        <p className="section-label">Projets</p>
        <h1 className="font-display mt-3 text-4xl font-bold tracking-tight md:text-5xl">
          Ce que je <span className="grad-text">construis</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--text-2)]">
          Outils offensifs, automatisation et méthodologie — des projets nés de mes missions
          de pentest et de ma pratique du CTF.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {PROJECTS.map((p, i) => (
          <Reveal key={p.name} delay={(i % 2) * 80}>
            <article className="card card-hover flex h-full flex-col p-7">
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-display text-xl font-semibold">{p.name}</h2>
                <span
                  className={`chip shrink-0 !text-[10px] ${
                    p.statusTone === "accent"
                      ? "chip-accent"
                      : "!border-amber-400/30 !bg-amber-400/[0.07] !text-amber-300"
                  }`}
                >
                  {p.status}
                </span>
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--text-2)]">{p.desc}</p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span key={t} className="chip">{t}</span>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4">
                <span className="font-code text-xs text-[var(--muted)]">{p.lang}</span>
                {p.link ? (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-code text-xs text-[var(--text-2)] transition-colors hover:text-[var(--accent)]"
                  >
                    GitHub →
                  </a>
                ) : (
                  <span className="font-code text-xs text-[var(--muted)]/60">Privé</span>
                )}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
