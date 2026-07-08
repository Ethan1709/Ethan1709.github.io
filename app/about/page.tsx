import Reveal from "@/components/Reveal";

const SKILLS = [
  {
    cat: "Web",
    items: ["SQLi (blind, error, time-based)", "XSS (DOM, reflected, stored)", "SSRF", "IDOR", "LFI / RFI", "Command Injection", "Upload"],
  },
  {
    cat: "Exploitation binaire",
    items: ["Buffer Overflow", "Heap Overflow", "Use-After-Free", "Shellcode", "Bypass PIE", "Bypass Stack Canary", "Reverse Engineering"],
  },
  {
    cat: "Privilege Escalation",
    items: ["SUID / SGID", "Python lib hijacking", "pspy", "PATH", "LD_PRELOAD", "LinPEAS"],
  },
  {
    cat: "Réseau & Hardening",
    items: ["iptables / nftables", "Segmentation réseau", "SELinux", "AppArmor", "Nmap", "Wireshark"],
  },
];

const TOOLS = ["Python", "Assembleur x86-64", "C", "SQL", "JavaScript", "GDB", "Ghidra", "IDA", "Pwntools", "Burp Suite", "Sqlmap", "Hydra", "Metasploit", "Nmap", "Wireshark", "Docker"];

const CONTACT = [
  { label: "Email", value: "ethan.benyayer@ecole2600.com", href: "mailto:ethan.benyayer@ecole2600.com" },
  { label: "LinkedIn", value: "Ethan Benyayer", href: "https://www.linkedin.com/in/ethan-benyayer" },
  { label: "GitHub", value: "Ethan1709", href: "https://github.com/Ethan1709" },
  { label: "Root-Me", value: "Ethanbeny", href: "https://www.root-me.org/Ethanbeny" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <Reveal>
        <p className="section-label">À propos</p>
        <h1 className="font-display mt-3 text-4xl font-bold tracking-tight md:text-5xl">
          Ethan <span className="grad-text">Benyayer</span>
        </h1>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.7fr]">
        {/* left column */}
        <Reveal>
          <aside className="space-y-6 lg:sticky lg:top-24">
            <div className="card p-6">
              <div className="flex items-center gap-4">
                <span className="font-display flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-lg font-bold text-[#04110b]">
                  EB
                </span>
                <div>
                  <h2 className="font-display text-lg font-semibold">Ethan Benyayer</h2>
                  <p className="text-xs text-[var(--muted)]">Pentester · Étudiant M2 cybersécurité</p>
                </div>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  ["📍", "Île-de-France"],
                  ["🎓", "École 2600 — Expert Sécurité (Bac+5)"],
                  ["🏆", "Root-Me — +10 000 pts cumulés"],
                  ["🎯", "En recherche d'alternance (1 an)"],
                  ["💬", "Français & Anglais (courant)"],
                ].map(([icon, text]) => (
                  <li key={text} className="flex items-center gap-3 text-[var(--text-2)]">
                    <span>{icon}</span>
                    {text}
                  </li>
                ))}
              </ul>
              <a href="/cv-ethan-benyayer.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-6 w-full justify-center">
                Télécharger mon CV
              </a>
            </div>

            <div className="card p-6">
              <p className="section-label !text-[0.7rem]">Contact</p>
              <div className="mt-4 space-y-3">
                {CONTACT.map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between text-sm"
                  >
                    <span className="text-[var(--muted)]">{c.label}</span>
                    <span className="text-[var(--text-2)] transition-colors group-hover:text-[var(--accent)]">
                      {c.value} →
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </Reveal>

        {/* right column */}
        <div className="space-y-6">
          <Reveal>
            <div className="card p-7">
              <p className="section-label !text-[0.7rem]">Profil</p>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-[var(--text-2)]">
                <p>
                  Actuellement en dernière année à l&apos;
                  <span className="text-[var(--text)]">École 2600</span> (titre d&apos;Expert de la
                  Sécurité des Données, des Réseaux et des Systèmes, niveau 7) et pentester en
                  alternance chez <span className="text-[var(--text)]">Cyber Sec Asso</span>, je
                  recherche une nouvelle alternance d&apos;un an dès que possible.
                </p>
                <p>
                  Mon expérience offensive m&apos;a donné une compréhension concrète des
                  vulnérabilités applicatives et réseau, ainsi que des techniques d&apos;attaque.
                </p>
                <p>
                  Curieux et rigoureux, je me challenge régulièrement sur des plateformes comme
                  Root-Me et Hack The Box pour entretenir et élargir mes compétences techniques.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div>
              <p className="section-label !text-[0.7rem]">Compétences</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {SKILLS.map((s) => (
                  <div key={s.cat} className="card p-5">
                    <h3 className="font-display text-sm font-semibold text-[var(--accent-strong)]">{s.cat}</h3>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {s.items.map((it) => (
                        <span key={it} className="chip">{it}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="card p-7">
              <p className="section-label !text-[0.7rem]">Langages & Outils</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {TOOLS.map((t) => (
                  <span key={t} className="chip chip-accent">{t}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
