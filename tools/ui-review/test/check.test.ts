import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { annotation } from "../src/format.js";
import { checkChange } from "../src/layer1.js";
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
    'import { Card } from "@hackcove/ui";\nexport const a = <Card />;\n',
  );
  git(cwd, "add", ".");
  git(cwd, "commit", "-q", "-m", "base");
  const base = git(cwd, "rev-parse", "HEAD");

  writeFileSync(
    join(cwd, "src", "Page.tsx"),
    'import { Card } from "@hackcove/ui";\nexport const a = <Card />;\n',
  );
  expect(checkChange({ cwd, base, head: "HEAD", globs: [], ctx })).toEqual([]);

  writeFileSync(
    join(cwd, "src", "Page.tsx"),
    'import { Card } from "@hackcove/ui";\nexport const a = <Card />;\nexport const b = <div className="bg-slate-800">x</div>;\n',
  );
  git(cwd, "commit", "-q", "-am", "feature");
  const found = checkChange({ cwd, base, head: "HEAD", globs: [], ctx });
  expect(found).toEqual([
    expect.objectContaining({ rule: "raw-colour", path: "src/Page.tsx", line: 3 }),
  ]);
  expect(annotation(found[0]!)).toMatch(
    /^::error file=src\/Page\.tsx,line=3,title=Hack Cove UI \(raw-colour\)::/,
  );
});
