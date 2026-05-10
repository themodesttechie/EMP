"use client";

// Minimal, safe markdown renderer. Handles headings, paragraphs, ordered lists,
// bullets, inline code, and bold/italic. Escapes HTML; never dangerouslySetInnerHTML.
// Sized for the seed/AI-authored content; swap to react-markdown later if richer.

import { Fragment } from "react";

type Inline =
  | { kind: "text"; value: string }
  | { kind: "code"; value: string }
  | { kind: "bold"; children: Inline[] }
  | { kind: "italic"; children: Inline[] };

type Block =
  | { kind: "h1" | "h2" | "h3"; children: Inline[] }
  | { kind: "p"; children: Inline[] }
  | { kind: "ol"; items: Inline[][] }
  | { kind: "ul"; items: Inline[][] };

function parseInline(line: string): Inline[] {
  const out: Inline[] = [];
  let buf = "";
  const flush = () => {
    if (buf) {
      out.push({ kind: "text", value: buf });
      buf = "";
    }
  };
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === "`") {
      const end = line.indexOf("`", i + 1);
      if (end > 0) {
        flush();
        out.push({ kind: "code", value: line.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    if (ch === "*" && line[i + 1] === "*") {
      const end = line.indexOf("**", i + 2);
      if (end > 0) {
        flush();
        out.push({ kind: "bold", children: parseInline(line.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }
    if (ch === "*") {
      const end = line.indexOf("*", i + 1);
      if (end > 0) {
        flush();
        out.push({ kind: "italic", children: parseInline(line.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }
    buf += ch;
    i += 1;
  }
  flush();
  return out;
}

function parse(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const ln = lines[i];
    const trimmed = ln.trim();
    if (!trimmed) {
      i += 1;
      continue;
    }
    const h = /^(#{1,3})\s+(.*)$/.exec(trimmed);
    if (h) {
      const level = h[1].length as 1 | 2 | 3;
      blocks.push({
        kind: (`h${level}` as "h1" | "h2" | "h3"),
        children: parseInline(h[2]),
      });
      i += 1;
      continue;
    }
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(parseInline(lines[i].trim().replace(/^\d+\.\s+/, "")));
        i += 1;
      }
      blocks.push({ kind: "ol", items });
      continue;
    }
    if (/^[-*]\s+/.test(trimmed)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(parseInline(lines[i].trim().replace(/^[-*]\s+/, "")));
        i += 1;
      }
      blocks.push({ kind: "ul", items });
      continue;
    }
    // Paragraph: gather contiguous non-blank, non-special lines
    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,3})\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !/^[-*]\s+/.test(lines[i].trim())
    ) {
      buf.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ kind: "p", children: parseInline(buf.join(" ")) });
  }
  return blocks;
}

function renderInline(nodes: Inline[], keyPrefix = ""): React.ReactNode {
  return nodes.map((n, idx) => {
    const k = `${keyPrefix}${idx}`;
    switch (n.kind) {
      case "text":
        return <Fragment key={k}>{n.value}</Fragment>;
      case "code":
        return (
          <code
            key={k}
            className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 text-[0.9em]"
          >
            {n.value}
          </code>
        );
      case "bold":
        return (
          <strong key={k} className="font-semibold">
            {renderInline(n.children, k + "b")}
          </strong>
        );
      case "italic":
        return <em key={k}>{renderInline(n.children, k + "i")}</em>;
    }
  });
}

export default function Markdown({ source }: { source: string }) {
  const blocks = parse(source || "");
  return (
    <div className="prose dark:prose-invert max-w-none">
      {blocks.map((b, idx) => {
        switch (b.kind) {
          case "h1":
            return <h1 key={idx}>{renderInline(b.children)}</h1>;
          case "h2":
            return <h2 key={idx}>{renderInline(b.children)}</h2>;
          case "h3":
            return <h3 key={idx}>{renderInline(b.children)}</h3>;
          case "p":
            return <p key={idx}>{renderInline(b.children)}</p>;
          case "ol":
            return (
              <ol key={idx}>
                {b.items.map((it, i) => (
                  <li key={i}>{renderInline(it, `${idx}-${i}`)}</li>
                ))}
              </ol>
            );
          case "ul":
            return (
              <ul key={idx}>
                {b.items.map((it, i) => (
                  <li key={i}>{renderInline(it, `${idx}-${i}`)}</li>
                ))}
              </ul>
            );
        }
      })}
    </div>
  );
}
