import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { annotation, summary } from "../src/format.js";
import { checkChange } from "../src/layer1.js";
import type { Finding } from "../src/rules.js";
import { ctx } from "./fixtures.js";

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const git = (cwd: string, ...args: string[]) =>
  execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...args], {
    cwd,
    encoding: "utf8",
  }).trim();

it("a real branch that adds a raw bg-slate-800 div fails on that line, and a clean one passes", () => {
  const cwd = mkdtempSync(join(tmpdir(), "ui-review-"));
  dirs.push(cwd);
  git(cwd, "init", "-q", "-b", "main");
  mkdirSync(join(cwd, "src"));
  writeFileSync(
    join(cwd, "src", "Page.tsx"),
    'import { Card } from "@slashsuite/ui-react";\nexport const a = <Card />;\n',
  );
  git(cwd, "add", ".");
  git(cwd, "commit", "-q", "-m", "base");
  const base = git(cwd, "rev-parse", "HEAD");

  writeFileSync(
    join(cwd, "src", "Page.tsx"),
    'import { Card } from "@slashsuite/ui-react";\nexport const a = <Card />;\n',
  );
  expect(checkChange({ cwd, base, head: "HEAD", globs: [], ctx })).toEqual([]);

  writeFileSync(
    join(cwd, "src", "Page.tsx"),
    'import { Card } from "@slashsuite/ui-react";\nexport const a = <Card />;\nexport const b = <div className="bg-slate-800">x</div>;\n',
  );
  git(cwd, "commit", "-q", "-am", "feature");
  const found = checkChange({ cwd, base, head: "HEAD", globs: [], ctx });
  expect(found).toEqual([
    expect.objectContaining({ rule: "raw-colour", path: "src/Page.tsx", line: 3 }),
  ]);
  expect(annotation(found[0]!)).toMatch(
    /^::error file=src\/Page\.tsx,line=3,title=UISlash \(raw-colour\)::/,
  );
});

it("the job summary is headed UISlash check, with the all-clear or the count", () => {
  expect(summary([])).toMatch(/^### UISlash check\n/);
  const finding: Finding = { path: "src/Page.tsx", line: 3, rule: "raw-colour", message: "x" };
  expect(summary([finding])).toMatch(/^### UISlash check\n\n1 hard-rule violation\./);
});

it("the check prints UISlash check on its output line, clean or with a count", () => {
  const root = join(import.meta.dirname, "..", "..", "..");
  const script = join(root, "tools", "ui-review", "src", "check.ts");
  const cwd = mkdtempSync(join(tmpdir(), "ui-review-"));
  dirs.push(cwd);
  git(cwd, "init", "-q", "-b", "main");
  mkdirSync(join(cwd, "src"));
  const clean = 'import { Card } from "@slashsuite/ui-react";\nexport const a = <Card />;\n';
  writeFileSync(join(cwd, "src", "Page.tsx"), clean);
  git(cwd, "add", ".");
  git(cwd, "commit", "-q", "-m", "base");
  const base = git(cwd, "rev-parse", "HEAD");
  const run = () =>
    spawnSync("bun", [script, "--base", base, "--head", "HEAD", "--hackcove", root], {
      cwd,
      encoding: "utf8",
    });

  const passing = run();
  expect(passing.status).toBe(0);
  expect(passing.stdout).toBe("UISlash check: clean.\n");

  writeFileSync(
    join(cwd, "src", "Page.tsx"),
    `${clean}export const b = <div className="bg-slate-800">x</div>;\n`,
  );
  git(cwd, "commit", "-q", "-am", "feature");
  const failing = run();
  expect(failing.status).toBe(1);
  expect(failing.stdout).toContain("UISlash check: 1 violation(s).\n");
});
