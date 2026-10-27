import { bodyOf, isRecord, summaryOf, type Placed } from "./findings.js";

/** Hidden in every comment the reviewer posts, so a re-run replaces its own comments only. */
export const MARKER = "<!-- hackcove-ui-review -->";

export type Target = { repo: string; pr: number; token: string };

type Json = Record<string, unknown>;

async function call(target: Target, method: string, path: string, body?: Json): Promise<unknown> {
  const response = await fetch(`https://api.github.com/repos/${target.repo}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${target.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "hackcove-ui-review",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) throw new Error(`GitHub ${method} ${path}: ${response.status}`);
  return response.status === 204 ? undefined : response.json();
}

type Mine = { id: number };

function mineOf(rows: unknown): Mine[] {
  if (!Array.isArray(rows)) return [];
  const list: unknown[] = rows;
  return list.flatMap((row) => {
    if (!isRecord(row)) return [];
    const { id, body } = row;
    return typeof id === "number" && typeof body === "string" && body.includes(MARKER)
      ? [{ id }]
      : [];
  });
}

/** Removes the comments an earlier run left, then posts the inline comments and the one summary. */
export async function post(target: Target, placed: Placed, total: number): Promise<void> {
  const prefix = `/pulls/${target.pr}`;
  const oldInline = mineOf(await call(target, "GET", `${prefix}/comments?per_page=100`));
  const oldSummary = mineOf(
    await call(target, "GET", `/issues/${target.pr}/comments?per_page=100`),
  );
  for (const { id } of oldInline) await call(target, "DELETE", `/pulls/comments/${id}`);
  for (const { id } of oldSummary) await call(target, "DELETE", `/issues/comments/${id}`);
  let loose = placed.loose;
  if (placed.inline.length > 0) {
    try {
      await call(target, "POST", `${prefix}/reviews`, {
        event: "COMMENT",
        comments: placed.inline.map((f) => ({
          path: f.path,
          line: f.line,
          side: "RIGHT",
          body: `${bodyOf(f)}\n\n${MARKER}`,
        })),
      });
    } catch {
      // GitHub refuses the whole review when one line is off the diff; the notes go in the summary.
      loose = [...placed.inline, ...placed.loose];
    }
  }
  await call(target, "POST", `/issues/${target.pr}/comments`, {
    body: `${summaryOf(total, loose)}\n\n${MARKER}`,
  });
}
