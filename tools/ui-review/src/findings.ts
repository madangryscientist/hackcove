import type { FileDiff } from "./diff.js";

export const KINDS = [
  "wrong-component",
  "hand-rolled-layout",
  "hand-set-spacing",
  "missing-state",
  "missing-part",
] as const;
export type Kind = (typeof KINDS)[number];

export type ModelFinding = {
  path: string;
  line: number;
  kind: Kind;
  message: string;
  missingPart: string | undefined;
};

const MAX_FINDINGS = 12;

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isKind = (value: unknown): value is Kind => KINDS.some((kind) => kind === value);

const text = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;

function findingOf(raw: unknown): ModelFinding | undefined {
  if (!isRecord(raw)) return undefined;
  const { path, line, kind } = raw;
  const message = text(raw["message"]);
  const missingPart = text(raw["missing_part"]);
  if (typeof path !== "string" || typeof line !== "number" || !Number.isInteger(line)) {
    return undefined;
  }
  if (!isKind(kind) || message === undefined) return undefined;
  if (kind === "missing-part" && missingPart === undefined) return undefined;
  return { path, line, kind, message, missingPart };
}

/** The findings in a model's reply: the outermost `{…}`, validated, the malformed ones dropped. */
export function parseReply(reply: string): ModelFinding[] {
  const from = reply.indexOf("{");
  const to = reply.lastIndexOf("}");
  if (from === -1 || to < from) throw new Error("the model's reply has no JSON object");
  const parsed: unknown = JSON.parse(reply.slice(from, to + 1));
  if (!isRecord(parsed) || !Array.isArray(parsed["findings"])) {
    throw new Error("the model's reply has no `findings` array");
  }
  const rows: unknown[] = parsed["findings"];
  return rows.flatMap((row) => findingOf(row) ?? []).slice(0, MAX_FINDINGS);
}

/** The comment text. A missing part always ends in the same ask, whatever the model wrote. */
export function bodyOf(finding: ModelFinding): string {
  return finding.missingPart === undefined
    ? finding.message
    : `${finding.message}\n\nAsk hackcove for ${finding.missingPart}; do not build it locally.`;
}

export type Placed = { inline: ModelFinding[]; loose: ModelFinding[] };

/** A finding can be an inline comment only when its line is one the pull request adds. */
export function place(findings: readonly ModelFinding[], files: readonly FileDiff[]): Placed {
  const addedAt = new Map(files.map((file) => [file.path, new Set(file.added.map((a) => a.line))]));
  const inline: ModelFinding[] = [];
  const loose: ModelFinding[] = [];
  for (const finding of findings) {
    (addedAt.get(finding.path)?.has(finding.line) === true ? inline : loose).push(finding);
  }
  return { inline, loose };
}

/** The one summary comment. */
export function summaryOf(total: number, loose: readonly ModelFinding[]): string {
  if (total === 0) return "**Hack Cove UI review:** matches Hack Cove.";
  const lines = [
    `**Hack Cove UI review:** ${total} note${total === 1 ? "" : "s"} on how this change uses Hack Cove. Advisory: it does not block the pull request.`,
  ];
  if (loose.length > 0) {
    lines.push(
      "",
      ...loose.map((f) => `- \`${f.path}:${f.line}\` ${bodyOf(f).replaceAll("\n\n", " ")}`),
    );
  }
  return lines.join("\n");
}
