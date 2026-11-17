/**
 * The "Pick" step of `.github/workflows/publish.yml`: sorts the releasable projects (nx.json
 * `release.projects`) into four sets, from git tags and from npm, never from a list.
 *
 *   new      no <project>@<version> tag: its first publish, staged with NPM_TOKEN.
 *   renamed  tagged, nothing approved on npm, and its last tag was cut under another package name
 *            (a rename that copied its predecessor's last tag): staged with NPM_TOKEN.
 *   staged   tagged, nothing approved on npm, and its last tag was cut under this package name: an
 *            earlier dispatch staged it and it waits for the maintainer's approval on npmjs.com.
 *            Skipped, so a dispatch neither fails on it nor bumps it again.
 *   tagged   on npm with an approved version: released by conventional commits through OIDC.
 *
 * "Approved" ignores npm's `0.0.0-stage` placeholder, which npm publishes the moment a brand-new
 * package's first version is staged. Run from the repo root with `bun scripts/releasePick.ts`; it
 * reads PROJECT and HAS_NPM_TOKEN and appends `new=`, `renamed=`, `staged=` and `tagged=` to
 * $GITHUB_OUTPUT. No token is read here.
 */
import { appendFileSync, readFileSync } from "node:fs";

export type Kind = "new" | "renamed" | "staged" | "tagged";

/** The version npm publishes in public when a brand-new package's first version is staged. */
export const stagePlaceholder = "0.0.0-stage";

export type Facts = {
  /** The package name in the project's package.json now. */
  name: string;
  /** False when the project has no `<project>@<version>` tag. */
  tagged: boolean;
  /** The package name in the project's package.json at its newest tag, or null if absent there. */
  nameAtLastTag: string | null;
  /** The versions `npm view <name> versions` lists, or null when npm has no such package. */
  npmVersions: string[] | null;
};

export function classify(facts: Facts): Kind {
  if (!facts.tagged) return "new";
  const approved = (facts.npmVersions ?? []).filter((v) => v !== stagePlaceholder);
  if (approved.length > 0) return "tagged";
  return facts.nameAtLastTag === facts.name ? "staged" : "renamed";
}

export type Pick = Record<Kind, string[]>;

export function pick(projects: { project: string; facts: Facts }[]): Pick {
  const out: Pick = { new: [], renamed: [], staged: [], tagged: [] };
  for (const { project, facts } of projects) out[classify(facts)].push(project);
  return out;
}

/** The token is needed only by projects that are staged in this run. */
export function needsToken(sets: Pick): boolean {
  return sets.new.length + sets.renamed.length > 0;
}

// Only stdout is parsed: a warning npm, Nx or git prints on stderr must not break the JSON.
function run(cmd: string[]): { ok: boolean; out: string; err: string } {
  const r = Bun.spawnSync(cmd, { stdout: "pipe", stderr: "pipe" });
  return { ok: r.exitCode === 0, out: r.stdout.toString().trim(), err: r.stderr.toString().trim() };
}

function must(cmd: string[]): string {
  const r = run(cmd);
  if (!r.ok) fail(`${cmd.join(" ")} failed: ${r.err || r.out}`);
  return r.out;
}

function fail(message: string): never {
  console.log(`::error::${message}`);
  process.exit(1);
}

function npmVersions(name: string): string[] | null {
  const r = run(["npm", "view", name, "versions", "--json"]);
  if (!r.ok) {
    if (`${r.out}\n${r.err}`.includes("E404")) return null;
    fail(`Could not ask npm whether ${name} exists: ${r.err || r.out}`);
  }
  const parsed: unknown = JSON.parse(r.out);
  return (Array.isArray(parsed) ? parsed : [parsed]).map(String);
}

function nameAt(ref: string, path: string): string | null {
  const r = run(["git", "show", `${ref}:${path}`]);
  if (!r.ok) return null;
  const pkg: { name?: string } = JSON.parse(r.out);
  return pkg.name ?? null;
}

function main(): void {
  const nx: { release: { projects: string[] } } = JSON.parse(readFileSync("nx.json", "utf8"));
  const shown: string[] = JSON.parse(
    must(["bunx", "nx", "show", "projects", "-p", nx.release.projects.join(","), "--json"]),
  );
  if (shown.length === 0) fail("No releasable project (nx.json release.projects).");
  const only = process.env.PROJECT ?? "";
  if (only !== "" && !shown.includes(only)) {
    fail(`${only} is not a releasable project. Releasable: ${shown.join(" ")}`);
  }
  const projects = (only === "" ? shown : [only]).map((project) => {
    const root: string = JSON.parse(
      must(["bunx", "nx", "show", "project", project, "--json"]),
    ).root;
    const pkg: { name: string } = JSON.parse(readFileSync(`${root}/package.json`, "utf8"));
    const lastTag = must(["git", "tag", "-l", `${project}@*`, "--sort=-v:refname"]).split("\n")[0];
    const tagged = lastTag !== undefined && lastTag !== "";
    const facts: Facts = {
      name: pkg.name,
      tagged,
      nameAtLastTag: tagged ? nameAt(lastTag, `${root}/package.json`) : null,
      npmVersions: tagged ? npmVersions(pkg.name) : null,
    };
    return { project, facts };
  });
  const sets = pick(projects);
  for (const project of sets.staged) {
    const { name } = projects.find((p) => p.project === project)?.facts ?? { name: project };
    console.log(
      `::notice::${project} (${name}) has a release tag but no version approved on npm: it waits ` +
        "for the maintainer under Staged Packages on npmjs.com, so this run skips it. If it is not " +
        'listed there, its staging failed (docs/releasing.md, "First publish of a new package").',
    );
  }
  const kinds: Kind[] = ["tagged", "renamed", "new", "staged"];
  const lines = kinds.map((kind) => `${kind}=${sets[kind].join(",")}`);
  console.log(lines.join("\n"));
  const output = process.env.GITHUB_OUTPUT;
  if (output) appendFileSync(output, `${lines.join("\n")}\n`);
  if (needsToken(sets) && process.env.HAS_NPM_TOKEN !== "true") {
    fail(
      `Project(s) to stage: new (no release tag) [${sets.new.join(",")}], renamed (tagged under ` +
        `another name, not on npm) [${sets.renamed.join(",")}]. Staging needs an NPM_TOKEN secret ` +
        'on the npm-publish environment (docs/releasing.md "First publish of a new package"), or ' +
        "set the project input to release only an already-published project.",
    );
  }
}

if (import.meta.main) main();
