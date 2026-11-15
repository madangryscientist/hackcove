/**
 * Runs the pinned oxlint with this package's config and returns what it reported, keeping only the
 * rules the config turns on. oxlint also runs its default rules (the correctness category) on any
 * config, and those are not this package's to count. Used by the fixture suite and by the repo
 * root's `lint:testing` report. Not published.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const configPath = resolve(import.meta.dirname, "..", ".oxlintrc.json");
const oxlint = resolve(import.meta.dirname, "../../../node_modules/.bin/oxlint");

type Severity = "off" | "warn" | "error";
type Override = { files: string[]; rules: Record<string, Severity | [Severity, ...unknown[]]> };

/**
 * One report: the file (relative to `cwd`), its 1-based line, the rule as the config names it, and
 * its text (oxlint's message and help, where a restricted-property rule puts the configured text).
 */
type Hit = { file: string; line: number; rule: string; message: string };

/** Every rule an override of the config turns on, as the config names it (`playwright/no-raw-locators`). */
export function ownedRules(): Set<string> {
  const config: { overrides: Override[] } = JSON.parse(readFileSync(configPath, "utf8"));
  const on = new Set<string>();
  for (const override of config.overrides) {
    for (const [rule, setting] of Object.entries(override.rules)) {
      const severity = Array.isArray(setting) ? setting[0] : setting;
      if (severity !== "off") on.add(rule);
    }
  }
  return on;
}

type Diagnostic = {
  code: string;
  message: string;
  help?: string;
  filename: string;
  labels: { span: { line: number } }[];
};

/** `ui-testing(no-selector-actions)` to `ui-testing/no-selector-actions`; eslint's core rules are bare. */
function ruleOf(code: string): string {
  const match = /^([\w-]+)\((.+)\)$/.exec(code);
  if (!match) return code;
  const [, scope, name] = match;
  return scope === "eslint" ? `${name}` : `${scope}/${name}`;
}

/** Lints `paths` (relative to `cwd`) with the package's config alone. */
export function lint(paths: string[], cwd: string): Hit[] {
  const result = spawnSync(oxlint, ["-c", configPath, "-f", "json", ...paths], {
    cwd,
    encoding: "utf8",
  });
  const out = result.stdout;
  if (!out.trimStart().startsWith("{")) {
    throw new Error(`oxlint printed no report (exit ${result.status}):\n${out}${result.stderr}`);
  }
  const owned = ownedRules();
  const report: { diagnostics: Diagnostic[] } = JSON.parse(out);
  return report.diagnostics
    .map((d) => ({
      file: d.filename,
      line: d.labels[0]?.span.line ?? 0,
      rule: ruleOf(d.code),
      message: [d.message, d.help].filter(Boolean).join(" "),
    }))
    .filter((hit) => owned.has(hit.rule));
}
