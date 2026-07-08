import Link from "next/link";
import Reveal from "@/components/Reveal";
import { getRootMeData } from "@/lib/rootme";

const EXPERTISE = [
  {
    title: "Pentest Web",
    desc: "Exploitation et sécurisation des vulnérabilités applicatives : SQLi, XSS, SSRF, IDOR, LFI/RFI, injections de commandes, upload…",
    tags: ["Burp Suite", "Sqlmap", "OWASP"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    title: "Exploitation binaire",
    desc: "Buffer & heap overflow, use-after-free, shellcode, contournement des protections (PIE, stack canary), reverse engineering.",
    tags: ["GDB", "Ghidra / IDA", "Pwntools"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: "Privilege Escalation",
    desc: "SUID/SGID, hijacking de librairies Python, process monitoring (pspy), PATH, LD_PRELOAD, énumération LinPEAS.",
    tags: ["Linux", "Windows", "Post-exploitation"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    ),
  },
  {
    title: "Réseau & Hardening",
    desc: "Firewalls iptables/nftables, règles de filtrage avancées, segmentation réseau, durcissement SELinux et AppArmor.",
    tags: ["Nmap", "Wireshark", "SELinux"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

const EXPERIENCE = [
  {
    period: "Déc. 2024 — Juil. 2026",
    role: "Pentester (alternance)",
    org: "Cyber Sec Asso",
    points: [
      "Tests d'intrusion internes et applicatifs web",
      "Audit de configuration GCP",
      "Création d'un modèle de rapport de pentest from scratch",
    ],
    current: true,
  },
  {
    period: "2024 — 2027",
    role: "Expert de la Sécurité des Données, des Réseaux et des Systèmes",
    org: "École 2600 — titre RNCP niveau 7 (Bac+5)",
    points: [
      "Techniques offensives & analyse de malwares",
      "Sécurité des réseaux IT, OT, IoT",
      "Cyberdéfense, gestion de crise, OSINT & géopolitique",
    ],
    current: true,
  },
  {
    period: "2022 — 2024",
    role: "Développeur Full Stack",
    org: "Holberton School, La Défense — RNCP niveau 6 (Bac+3)",
    points: ["Développement full stack", "Containerisation Docker", "Sécurité Linux & Windows"],
    current: false,
  },
];

const PROJECTS_PREVIEW = [
  {
    name: "Modèle de rapport de pentest",
    desc: "Template professionnel de rapport de test d'intrusion conçu from scratch et utilisé en mission chez Cyber Sec Asso.",
    tags: ["Pentest", "Méthodologie"],
  },
  {
    name: "Root-Me Tracker",
    desc: "Pipeline de scraping qui synchronise automatiquement ma progression Root-Me avec ce portfolio.",
    tags: ["Python", "Bash", "Automation"],
  },
  {
    name: "GCP Automated Audit",
    desc: "Audit automatisé d'un environnement Google Cloud : 67 contrôles CIS Benchmark en Bash + gcloud, utilisé en mission.",
    tags: ["Bash", "GCP", "CIS Benchmark"],
  },
];

export default function Home() {
  const rootme = getRootMeData();
  const topCats = [...rootme.categories].sort((a, b) => b.percent - a.percent).slice(0, 5);
  const totalChallenges = rootme.categories.reduce((s, c) => s + c.total, 0);

  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="grid grid-cols-1 items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-[rgba(52,211,153,0.3)] bg-[var(--accent-dim)] px-4 py-1.5 text-xs font-medium text-[var(--accent-strong)]">
              <span className="pulse-dot h-2 w-2 rounded-full bg-[var(--accent)]" />
              Disponible — à la recherche d&apos;une alternance (1 an)
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="font-display mt-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Ethan
              <br />
              <span className="grad-text">Benyayer</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="font-code mt-5 text-sm text-[var(--accent)]">
              Pentester · Étudiant en cybersécurité @ École 2600
            </p>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--text-2)]">
              Pentester en alternance et passionné de sécurité offensive, je passe mon temps
              libre à casser des choses (légalement bien sûr 🤭) sur Root-Me et Hack The Box. Aujourd&apos;hui,
              je cherche à mettre cette expérience offensive au service de l&apos;AppSec et de la défense.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="mailto:ethan.benyayer@ecole2600.com" className="btn btn-primary">
                Me contacter
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
              <a href="/cv-ethan-benyayer.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                Télécharger mon CV
              </a>
            </div>
            <div className="mt-7 flex items-center gap-5">
              {[
                { label: "GitHub", href: "https://github.com/Ethan1709" },
                { label: "LinkedIn", href: "https://www.linkedin.com/in/ethan-benyayer" },
                { label: "Root-Me", href: "https://www.root-me.org/Ethanbeny" },
                { label: "Hack The Box", href: "https://app.hackthebox.com" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-code text-xs text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                >
                  {label} →
                </a>
              ))}
            </div>
          </Reveal>
        </div>

        {/* terminal card */}
        <Reveal delay={200}>
          <div className="card overflow-hidden !rounded-xl shadow-[0_30px_80px_-30px_rgba(16,185,129,0.25)]">
            <div className="flex items-center gap-2 border-b border-[var(--border)] bg-white/[0.02] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="font-code ml-3 text-xs text-[var(--muted)]">ethan@kali: ~</span>
            </div>
            <div className="font-code space-y-2.5 p-5 text-[13px] leading-relaxed">
              <p>
                <span className="text-[var(--accent)]">➜</span>{" "}
                <span className="text-[var(--text-2)]">whoami</span>
              </p>
              <p className="text-[var(--text)]">pentester · étudiant M2 cybersécurité</p>
              <p className="pt-1">
                <span className="text-[var(--accent)]">➜</span>{" "}
                <span className="text-[var(--text-2)]">nmap -sV profil.ethan</span>
              </p>
              <div className="text-[var(--muted)]">
                <p><span className="text-cyan-300">443/tcp</span>&nbsp;&nbsp;open&nbsp;&nbsp;pentest-web</p>
                <p><span className="text-cyan-300">80/tcp</span>&nbsp;&nbsp;&nbsp;open&nbsp;&nbsp;exploitation-binaire</p>
                <p><span className="text-cyan-300">22/tcp</span>&nbsp;&nbsp;&nbsp;open&nbsp;&nbsp;audit-gcp</p>
                <p><span className="text-cyan-300">53/tcp</span>&nbsp;&nbsp;&nbsp;open&nbsp;&nbsp;réseau-hardening</p>
              </div>
              <p className="pt-1">
                <span className="text-[var(--accent)]">➜</span>{" "}
                <span className="text-[var(--text-2)]">cat objectif.txt</span>
              </p>
              <p className="text-[var(--accent-strong)]">
                Alternance cybersécurité — dès que possible<span className="cursor-blink" />
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ───────────────────────── STATS ───────────────────────── */}
      <Reveal>
        <section className="card grid grid-cols-2 !rounded-2xl divide-[var(--border)] md:grid-cols-4 md:divide-x">
          {[
            { label: "Points Root-Me", value: rootme.score.toLocaleString("fr-FR") },
            { label: "Challenges résolus", value: `${rootme.total_solved}` },
            { label: "Classement mondial", value: `#${rootme.rank}` },
            { label: "Années de pratique", value: "3+" },
          ].map(({ label, value }) => (
            <div key={label} className="px-6 py-7 text-center">
              <p className="font-display text-3xl font-bold text-[var(--text)] md:text-4xl">{value}</p>
              <p className="mt-1.5 text-xs text-[var(--muted)]">{label}</p>
            </div>
          ))}
        </section>
      </Reveal>

      {/* ───────────────────────── EXPERTISE ───────────────────────── */}
      <section className="py-20 md:py-28">
        <Reveal>
          <p className="section-label">01 — Expertise</p>
          <h2 className="font-display mt-3 max-w-xl text-3xl font-bold tracking-tight md:text-4xl">
            Sécurité offensive, <span className="grad-text">de l&apos;applicatif au système</span>
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {EXPERTISE.map((e, i) => (
            <Reveal key={e.title} delay={i * 70}>
              <div className="card card-hover h-full p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgba(52,211,153,0.25)] bg-[var(--accent-dim)] text-[var(--accent)]">
                  {e.icon}
                </div>
                <h3 className="font-display mt-4 text-lg font-semibold">{e.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-2)]">{e.desc}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {e.tags.map((t) => (
                    <span key={t} className="chip">{t}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────────────────── ROOT-ME ───────────────────────── */}
      <section className="pb-20 md:pb-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <Reveal>
            <p className="section-label">02 — Root-Me</p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              {rootme.total_solved} challenges <span className="grad-text">résolus</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--text-2)]">
              Je m&apos;entraîne régulièrement sur Root-Me pour entretenir et élargir mes
              compétences : {rootme.score.toLocaleString("fr-FR")} points, classé #{rootme.rank},
              sur {totalChallenges} challenges répartis en {rootme.categories.length} catégories.
            </p>
            <Link href="/rootme" className="btn btn-ghost mt-7">
              Explorer tous les challenges
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </Reveal>

          <Reveal delay={120}>
            <div className="card space-y-5 p-7">
              {topCats.map((c) => (
                <div key={c.name}>
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-[var(--text)]">{c.name}</span>
                    <span className="font-code text-xs text-[var(--muted)]">
                      {c.solved}/{c.total} · {c.percent}%
                    </span>
                  </div>
                  <div className="progress">
                    <div className="progress-fill" style={{ width: `${c.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────── PARCOURS ───────────────────────── */}
      <section className="pb-20 md:pb-28">
        <Reveal>
          <p className="section-label">03 — Parcours</p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Du code à <span className="grad-text">l&apos;offensif</span>
          </h2>
        </Reveal>
        <div className="mt-12">
          {EXPERIENCE.map((x, i) => (
            <Reveal key={x.role} delay={i * 80}>
              <div className="relative grid grid-cols-1 gap-2 border-l border-[var(--border)] pb-12 pl-8 last:pb-0 md:grid-cols-[220px_1fr] md:gap-8">
                <span
                  className={`absolute -left-[5px] top-1.5 h-[9px] w-[9px] rounded-full ${
                    x.current ? "pulse-dot bg-[var(--accent)]" : "bg-[#2a323b]"
                  }`}
                />
                <p className="font-code text-xs text-[var(--muted)] md:pt-1">{x.period}</p>
                <div>
                  <h3 className="font-display text-lg font-semibold text-[var(--text)]">
                    {x.role}
                    {x.current && (
                      <span className="ml-3 align-middle text-[10px] font-medium uppercase tracking-widest text-[var(--accent)]">
                        en cours
                      </span>
                    )}
                  </h3>
                  <p className="mt-0.5 text-sm text-[var(--accent-strong)]/80">{x.org}</p>
                  <ul className="mt-3 space-y-1.5">
                    {x.points.map((p) => (
                      <li key={p} className="flex gap-2.5 text-sm text-[var(--text-2)]">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]/60" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────────────────── PROJETS ───────────────────────── */}
      <section className="pb-20 md:pb-28">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-label">04 — Projets</p>
              <h2 className="font-display mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Ce que je <span className="grad-text">construis</span>
              </h2>
            </div>
            <Link
              href="/projects"
              className="font-code text-sm text-[var(--text-2)] transition-colors hover:text-[var(--accent)]"
            >
              Tous les projets →
            </Link>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PROJECTS_PREVIEW.map((p, i) => (
            <Reveal key={p.name} delay={i * 80}>
              <Link href="/projects" className="card card-hover flex h-full flex-col p-6">
                <h3 className="font-display text-base font-semibold">{p.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--text-2)]">{p.desc}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <span key={t} className="chip chip-accent">{t}</span>
                  ))}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────────────────── CTA ───────────────────────── */}
      <Reveal>
        <section className="card relative overflow-hidden !rounded-3xl p-10 text-center md:p-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{ background: "radial-gradient(600px 200px at 50% 0%, rgba(16,185,129,0.22), transparent)" }}
          />
          <p className="section-label relative">Contact</p>
          <h2 className="font-display relative mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
            Une équipe sécu à renforcer ?<br />
            <span className="grad-text">Parlons-en.</span>
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[var(--text-2)]">
            Je recherche une alternance d&apos;un an en cybersécurité (pentest, AppSec, blue team)
            en Île-de-France, disponible dès que possible.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <a href="mailto:ethan.benyayer@ecole2600.com" className="btn btn-primary">
              ethan.benyayer@ecole2600.com
            </a>
            <a
              href="https://www.linkedin.com/in/ethan-benyayer"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              LinkedIn →
            </a>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
