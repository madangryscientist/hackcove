import type { Finding } from "./rules.js";

const escapeData = (text: string) =>
  text.replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A");
const escapeProperty = (text: string) =>
  escapeData(text).replaceAll(":", "%3A").replaceAll(",", "%2C");

/** A GitHub Actions workflow command that puts the finding on its line in the PR. */
export function annotation(finding: Finding): string {
  const properties = `file=${escapeProperty(finding.path)},line=${finding.line},title=${escapeProperty(`UISlash (${finding.rule})`)}`;
  return `::error ${properties}::${escapeData(finding.message)}`;
}

/** The job summary: a table of findings, or the one-line all-clear. */
export function summary(findings: readonly Finding[]): string {
  if (findings.length === 0) return "### UISlash check\n\nNo hard-rule violations.\n";
  const rows = findings.map(
    (f) => `| \`${f.path}:${f.line}\` | ${f.rule} | ${f.message.replaceAll("|", "\\|")} |`,
  );
  return [
    "### UISlash check",
    "",
    `${findings.length} hard-rule violation${findings.length === 1 ? "" : "s"}.`,
    "",
    "| Where | Rule | Why |",
    "| --- | --- | --- |",
    ...rows,
    "",
  ].join("\n");
}
