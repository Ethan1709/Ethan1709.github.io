"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/rootme", label: "Root-Me" },
  { href: "/projects", label: "Projets" },
  { href: "/writeups", label: "Write-ups" },
  { href: "/about", label: "À propos" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 12);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`glass fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "border-b border-[var(--border)]" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="font-display flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 text-sm font-bold text-[#04110b]">
            EB
          </span>
          <span className="font-code text-sm text-[var(--text-2)] transition-colors group-hover:text-[var(--text)]">
            ethan<span className="text-[var(--accent)]">@</span>sec
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3.5 py-2 text-sm transition-colors ${
                  active
                    ? "bg-[var(--accent-dim)] font-medium text-[var(--accent-strong)]"
                    : "text-[var(--text-2)] hover:bg-white/[0.04] hover:text-[var(--text)]"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <a
            href="/cv-ethan-benyayer.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost ml-3 !px-4 !py-2 !text-xs"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            CV
          </a>
        </div>

        {/* mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-2)] md:hidden"
          aria-label="Menu"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-[var(--border)] px-6 pb-4 pt-2 md:hidden">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block rounded-lg px-3 py-2.5 text-sm ${
                pathname === href
                  ? "bg-[var(--accent-dim)] text-[var(--accent-strong)]"
                  : "text-[var(--text-2)]"
              }`}
            >
              {label}
            </Link>
          ))}
          <a
            href="/cv-ethan-benyayer.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block rounded-lg px-3 py-2.5 text-sm text-[var(--accent)]"
          >
            Télécharger mon CV →
          </a>
        </div>
      )}
    </header>
  );
}
