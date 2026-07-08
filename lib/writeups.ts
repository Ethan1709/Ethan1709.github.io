import fs from "fs";
import path from "path";

export interface WriteupMeta {
  slug: string;
  title: string;
  challenge: string;
  category: string;
  platform: string;
  difficulty: "Facile" | "Moyen" | "Difficile";
  points?: number;
  author?: string;
  semester: string;
  excerpt: string;
  tags: string[];
}

/* Ordered: strongest / most interesting first */
export const WRITEUPS: WriteupMeta[] = [
  {
    slug: "ssti-contournement-filtres-aveugle",
    title: "SSTI en aveugle : contourner une blacklist Jinja2",
    challenge: "Python - SSTI contournement de filtres en aveugle",
    category: "Web - Serveur",
    platform: "Root-Me",
    difficulty: "Difficile",
    author: "Podalirius",
    semester: "A2S2",
    excerpt:
      "Injection de template Jinja2 sans retour visible, en répartissant un payload sur quatre champs concaténés pour reconstruire {{ }} et échapper à une blacklist, puis exfiltration OOB via Tailscale Funnel.",
    tags: ["SSTI", "Jinja2", "Flask", "Blind", "OOB"],
  },
  {
    slug: "arp-spoofing-mysql",
    title: "MITM ARP : réécrire une requête MySQL en transit",
    challenge: "ARP Spoofing - Homme du milieu",
    category: "Réseau",
    platform: "Root-Me",
    difficulty: "Difficile",
    semester: "A2S2",
    excerpt:
      "Man-in-the-middle par ARP spoofing entre un client et une base MySQL, puis interception scapy pour modifier la requête SQL à la volée et lire une table cachée — sans jamais casser le mot de passe.",
    tags: ["ARP Spoofing", "MITM", "scapy", "MySQL", "iptables"],
  },
  {
    slug: "linux-event-logs-keyboard-decoder",
    title: "Décoder une capture clavier /dev/input/event0",
    challenge: "Linux - Event logs, keyboard decoder",
    category: "Forensic",
    platform: "Root-Me",
    difficulty: "Difficile",
    semester: "A2S2",
    excerpt:
      "Reconstitution d'une session shell à partir d'une capture brute de /dev/input/event0 : parsing de la struct input_event (24 octets), gestion AZERTY/SHIFT/AltGr/dead-keys, puis rejeu du XOR+SHA1 en Python 2 pour retrouver le flag.",
    tags: ["Forensic", "input_event", "AZERTY", "Python 2", "SHA1"],
  },
  {
    slug: "rootkit-cold-case",
    title: "Rootkit SucKIT : chasse au processus caché",
    challenge: "Rootkit - Cold case",
    category: "Forensic",
    platform: "Root-Me",
    difficulty: "Moyen",
    points: 50,
    author: "franb",
    semester: "A2S2",
    excerpt:
      "Analyse d'une machine Debian 2003 compromise par SucKIT : détection d'un PID caché via /proc, identification du rootkit (hook getdents, /dev/kmem, raw socket) et lecture du filesystem ext2 avec debugfs pour contourner les hooks.",
    tags: ["Rootkit", "SucKIT", "/proc", "debugfs", "DFIR"],
  },
  {
    slug: "elf-x86-ret2dlresolve",
    title: "ret2dlresolve : forcer le linker à résoudre system()",
    challenge: "ELF x86 - Stack buffer overflow - ret2dl_resolve",
    category: "App - Système",
    platform: "Root-Me",
    difficulty: "Difficile",
    semester: "A2S1",
    excerpt:
      "Exploitation d'un overflow avec Partial RELRO : fabrication de fausses structures ELF (relocation, symbole, chaîne) pour détourner le dynamic linker et résoudre system('/bin/sh') sans fuite d'adresse, en contournant l'ASLR.",
    tags: ["pwn", "ret2dlresolve", "ROP", "pwntools", "ASLR"],
  },
  {
    slug: "elf-arm-basic-rop",
    title: "ROP sur ARM : chaîne de gadgets sous ASLR",
    challenge: "ELF ARM - Basic ROP",
    category: "App - Système",
    platform: "Root-Me",
    difficulty: "Moyen",
    semester: "A2S1",
    excerpt:
      "Construction d'une ROP chain sur binaire ARM protégé (NX, ASLR, RelRO) pour lire un fichier privilégié, en n'utilisant que les gadgets internes du binaire faute de connaître les adresses des librairies.",
    tags: ["pwn", "ARM", "ROP", "GDB", "NX"],
  },
  {
    slug: "elf-x86-ssp-leak",
    title: "Fuite d'info via le Stack Smashing Protector",
    challenge: "ELF x86 - Information leakage with SSP",
    category: "App - Système",
    platform: "Root-Me",
    difficulty: "Moyen",
    semester: "A2S1",
    excerpt:
      "Le message du Stack Smashing Protector affiche une chaîne pointée par une adresse sur la pile. En détournant ce pointeur vers le mot de passe de validation (binaire non-PIE, plage 0x08048000–0x08048fff), on fait fuiter le secret octet par octet.",
    tags: ["pwn", "Stack Canary", "SSP", "info leak", "brute-force"],
  },
  {
    slug: "xss-server-side",
    title: "XSS côté serveur : LFI via HTML-to-PDF",
    challenge: "XSS - Server Side",
    category: "Web - Client",
    platform: "Root-Me",
    difficulty: "Facile",
    points: 20,
    author: "Elf (HackDay 2023)",
    semester: "A2S2",
    excerpt:
      "La balise <object data=\"file:///flag.txt\"> échappe au filtre d'un générateur d'attestations PDF : le moteur HTML-to-PDF interprète l'injection et inclut le fichier local à la place du nom d'utilisateur.",
    tags: ["XSS", "HTML-to-PDF", "LFI", "object"],
  },
];

const CONTENT_DIR = path.join(process.cwd(), "content", "writeups");

/* Remove the leading H1 + metadata lines (they are shown as page header). */
function stripHeader(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let skipping = true;
  for (const line of lines) {
    if (skipping) {
      if (/^#\s/.test(line)) continue;
      if (/^\*\*(Plateforme|Challenge|Cat[ée]gorie|Auteur)\s*:/i.test(line.trim())) continue;
      if (line.trim() === "") continue;
      skipping = false;
    }
    out.push(line);
  }
  return out.join("\n").trim();
}

export function getWriteupBody(slug: string): string {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, `${slug}.md`), "utf-8");
  return stripHeader(raw);
}

export function getWriteupMeta(slug: string): WriteupMeta | undefined {
  return WRITEUPS.find((w) => w.slug === slug);
}

export const CATEGORY_ICONS: Record<string, string> = {
  "Web - Serveur": "🌐",
  "Web - Client": "🖥️",
  "Réseau": "📡",
  "Forensic": "🔎",
  "App - Système": "⚙️",
};

export const DIFF_TONE: Record<string, string> = {
  Facile: "!border-emerald-400/30 !bg-emerald-400/[0.07] !text-emerald-300",
  Moyen: "!border-amber-400/30 !bg-amber-400/[0.07] !text-amber-300",
  Difficile: "!border-rose-400/30 !bg-rose-400/[0.08] !text-rose-300",
};
