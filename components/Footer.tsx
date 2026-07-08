const SOCIALS = [
  { label: "GitHub", href: "https://github.com/Ethan1709" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ethan-benyayer" },
  { label: "Root-Me", href: "https://www.root-me.org/Ethanbeny" },
  { label: "Email", href: "mailto:ethan.benyayer@ecole2600.com" },
];

export default function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-[var(--border)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <p className="font-code text-xs text-[var(--muted)]">
          © {new Date().getFullYear()} Ethan Benyayer — conçu & développé avec Next.js
        </p>
        <div className="flex items-center gap-5">
          {SOCIALS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--text-2)] transition-colors hover:text-[var(--accent)]"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
