import React from "react";

/* ------------------------------------------------------------------ *
 * Minimal, dependency-free Markdown renderer.
 * Supports: fenced code (with lang), ATX headings, hr, GFM tables,
 * ordered/unordered lists, blockquotes, raw <img> blocks, paragraphs,
 * and inline `code`, **bold**, and [links](url).
 * ------------------------------------------------------------------ */

let uid = 0;
const key = () => `md-${uid++}`;

function parseInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const re = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      nodes.push(
        <code key={key()} className="rounded bg-white/[0.07] px-1.5 py-0.5 font-code text-[0.85em] text-[var(--accent-strong)]">
          {m[1]}
        </code>
      );
    } else if (m[2] !== undefined) {
      nodes.push(
        <strong key={key()} className="font-semibold text-[var(--text)]">
          {m[2]}
        </strong>
      );
    } else if (m[3] !== undefined) {
      nodes.push(
        <a key={key()} href={m[4]} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline underline-offset-2 hover:text-[var(--accent-strong)] break-words">
          {m[3]}
        </a>
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function splitRow(row: string): string[] {
  // split on unescaped pipes, honouring \| escapes
  const cells: string[] = [];
  let cur = "";
  for (let i = 0; i < row.length; i++) {
    if (row[i] === "\\" && row[i + 1] === "|") {
      cur += "|";
      i++;
    } else if (row[i] === "|") {
      cells.push(cur);
      cur = "";
    } else {
      cur += row[i];
    }
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

export default function Markdown({ content }: { content: string }) {
  uid = 0;
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;

  const isTableSep = (s: string) => /^\s*\|?[\s:-]*-[\s:|-]*\|?\s*$/.test(s) && s.includes("-");

  while (i < lines.length) {
    const line = lines[i];

    // fenced code
    const fence = line.match(/^```(\w+)?/);
    if (fence) {
      const lang = fence[1] ?? "";
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // consume closing fence
      blocks.push(
        <div key={key()} className="my-5 overflow-hidden rounded-xl border border-[var(--border)] bg-[#0a0d11]">
          {lang && (
            <div className="border-b border-[var(--border)] bg-white/[0.02] px-4 py-1.5 font-code text-[11px] uppercase tracking-wider text-[var(--muted)]">
              {lang}
            </div>
          )}
          <pre className="whitespace-pre-wrap break-words px-4 py-3.5">
            <code className="font-code text-[13px] leading-relaxed text-[var(--text-2)]">{buf.join("\n")}</code>
          </pre>
        </div>
      );
      continue;
    }

    // heading
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const txt = parseInline(h[2]);
      const cls =
        level <= 2
          ? "font-display mt-9 mb-3 text-2xl font-bold text-[var(--text)]"
          : level === 3
          ? "font-display mt-7 mb-2.5 text-lg font-semibold text-[var(--text)]"
          : "font-display mt-5 mb-2 text-base font-semibold text-[var(--accent-strong)]";
      blocks.push(
        level <= 2 ? (
          <h2 key={key()} className={cls}>{txt}</h2>
        ) : level === 3 ? (
          <h3 key={key()} className={cls}>{txt}</h3>
        ) : (
          <h4 key={key()} className={cls}>{txt}</h4>
        )
      );
      i++;
      continue;
    }

    // horizontal rule
    if (/^(\s*[-*_]){3,}\s*$/.test(line) && !line.trim().startsWith("|")) {
      blocks.push(<hr key={key()} className="my-8 border-[var(--border)]" />);
      i++;
      continue;
    }

    // table
    if (line.trim().startsWith("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const header = splitRow(line.trim().replace(/^\||\|$/g, ""));
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i].trim().replace(/^\||\|$/g, "")));
        i++;
      }
      blocks.push(
        <div key={key()} className="my-5 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border-strong)]">
                {header.map((c) => (
                  <th key={key()} className="px-3 py-2 text-left font-semibold text-[var(--text)]">{parseInline(c)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={key()} className="border-b border-[var(--border)]">
                  {r.map((c) => (
                    <td key={key()} className="px-3 py-2 align-top text-[var(--text-2)]">{parseInline(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // raw <img> block
    if (line.trim().startsWith("<img")) {
      const srcM = line.match(/src="([^"]+)"/);
      const altM = line.match(/alt="([^"]+)"/);
      if (srcM) {
        blocks.push(
          // eslint-disable-next-line @next/next/no-img-element
          <img key={key()} src={srcM[1]} alt={altM?.[1] ?? ""} className="my-5 max-w-full rounded-xl border border-[var(--border)]" />
        );
      }
      i++;
      continue;
    }

    // unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(
          <li key={key()} className="flex gap-2.5">
            <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]/70" />
            <span>{parseInline(lines[i].replace(/^\s*[-*]\s+/, ""))}</span>
          </li>
        );
        i++;
      }
      blocks.push(<ul key={key()} className="my-4 space-y-1.5 text-[var(--text-2)]">{items}</ul>);
      continue;
    }

    // ordered list (uses the source numbers so lists split by other blocks keep counting)
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        const numM = lines[i].match(/^\s*(\d+)\.\s+/);
        const num = numM ? numM[1] : "•";
        items.push(
          <li key={key()} className="flex gap-2.5">
            <span className="font-code text-xs text-[var(--accent)] mt-0.5">{num}.</span>
            <span>{parseInline(lines[i].replace(/^\s*\d+\.\s+/, ""))}</span>
          </li>
        );
        i++;
      }
      blocks.push(<ol key={key()} className="my-4 space-y-1.5 text-[var(--text-2)]">{items}</ol>);
      continue;
    }

    // blockquote
    if (/^\s*>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote key={key()} className="my-5 border-l-2 border-[var(--accent)]/50 pl-4 text-[var(--text-2)] italic">
          {parseInline(buf.join(" "))}
        </blockquote>
      );
      continue;
    }

    // blank line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // paragraph (gather consecutive plain lines)
    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("```") &&
      !/^(#{1,6})\s/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !lines[i].trim().startsWith("|") &&
      !lines[i].trim().startsWith("<img") &&
      !/^(\s*[-*_]){3,}\s*$/.test(lines[i])
    ) {
      buf.push(lines[i]);
      i++;
    }
    if (buf.length) {
      blocks.push(
        <p key={key()} className="my-4 leading-relaxed text-[var(--text-2)]">
          {parseInline(buf.join(" "))}
        </p>
      );
    }
  }

  return <div className="writeup-body">{blocks}</div>;
}
