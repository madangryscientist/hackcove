import type { ReactNode } from "react";

// A minimal, SAFE markdown renderer (headings / bullets / bold). No
// dangerouslySetInnerHTML — text is rendered as React nodes, so it can't inject HTML.
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold text-slate-900">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export function Markdown({ md }: { md: string }) {
  const out: ReactNode[] = [];
  let bullets: ReactNode[] = [];
  const flush = () => {
    if (bullets.length) {
      out.push(
        <ul key={`u${out.length}`} className="ml-4 list-disc space-y-1">
          {bullets}
        </ul>,
      );
      bullets = [];
    }
  };
  md.split("\n").forEach((ln, i) => {
    const t = ln.trim();
    if (t.startsWith("## ")) {
      flush();
      out.push(
        <h2
          key={i}
          className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400 first:mt-0"
        >
          {t.slice(3)}
        </h2>,
      );
    } else if (t.startsWith("### ")) {
      flush();
      out.push(
        <h3 key={i} className="mt-3 text-sm font-semibold text-slate-700">
          {t.slice(4)}
        </h3>,
      );
    } else if (t.startsWith("- ") || t.startsWith("* ")) {
      bullets.push(
        <li key={i} className="text-sm text-slate-700">
          {inline(t.slice(2))}
        </li>,
      );
    } else if (t === "") {
      flush();
    } else {
      flush();
      out.push(
        <p key={i} className="text-sm text-slate-700">
          {inline(t)}
        </p>,
      );
    }
  });
  flush();
  return <div className="space-y-1">{out}</div>;
}
