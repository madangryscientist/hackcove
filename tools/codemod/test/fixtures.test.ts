import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { transform } from "../src/transform.js";

// One folder per swap in the 0.10 to 0.11 table: `before.txt` is an app file as 0.10 wrote it,
// `after.txt` the file the codemod must produce, and `report.txt` the file:line reports it must
// print (one `line: message` each). A folder with no `after.txt` is a by-hand row: the file stays
// as it is and the report says where to look. The files are .txt so no formatter or linter
// rewrites them.

const root = join(import.meta.dirname, "fixtures");
const read = (dir: string, name: string) => {
  const path = join(root, dir, name);
  return existsSync(path) ? readFileSync(path, "utf8") : undefined;
};

describe("the codemod", () => {
  it.each(readdirSync(root).toSorted())("%s", (dir) => {
    const before = read(dir, "before.txt") ?? "";
    const { output, reports } = transform(before, `${dir}.tsx`);
    expect(output).toBe(read(dir, "after.txt") ?? before);
    const lines = reports.map((line) => `${line.line}: ${line.message}`);
    expect(lines).toEqual((read(dir, "report.txt") ?? "").split("\n").filter(Boolean));
  });

  it("leaves a file that imports nothing from the package as it is", () => {
    const source = 'import { Card } from "./Card";\nexport const x = <Card dashed />;\n';
    expect(transform(source, "local.tsx")).toEqual({ output: source, reports: [] });
  });
});
