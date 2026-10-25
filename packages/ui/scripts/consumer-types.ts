/**
 * Consumer type check: the published tarball's types must resolve `react` in an app that installs
 * it under bun's isolated linker with the global store, where the package lives outside the app
 * and TypeScript cannot walk up to the app's own `@types/react`. If `@hackcove/ui` does not
 * declare `@types/react` as a peer, its `.d.ts` cannot find `react`, every component's props
 * degrade to `any` and tsc stays green on code that passes `className` (HC-129).
 *
 * Packs `ui` (the build must already have run), installs the tarball plus react and its types into
 * a throwaway app in the temp dir, and runs tsc on a file that uses a component correctly and
 * passes `className` under `@ts-expect-error`. If the props are `any`, that directive is unused and
 * tsc fails. Run by `pack-check`; reads the bun cache first.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const tsc = resolve(root, "../../node_modules/.bin/tsc");
const pkg: { version: string; devDependencies: Record<string, string> } = JSON.parse(
  readFileSync(join(root, "package.json"), "utf8"),
);

if (!existsSync(join(root, "dist", "index.d.ts"))) {
  throw new Error("packages/ui/dist is missing: run `bunx nx build ui` first");
}

// One dir per checkout, so concurrent worktrees do not collide and the bun global store, which
// keys its links on the tarball path, does not grow a new entry per run.
const app = join(
  tmpdir(),
  `hackcove-ui-consumer-${createHash("sha1").update(root).digest("hex").slice(0, 8)}`,
);
rmSync(app, { recursive: true, force: true });
mkdirSync(join(app, "src"), { recursive: true });

function run(cmd: string[], cwd: string): void {
  const result = Bun.spawnSync(cmd, { cwd, stdout: "pipe", stderr: "pipe" });
  if (result.exitCode !== 0) {
    throw new Error(
      `${cmd.join(" ")} failed in ${cwd}\n${result.stdout.toString()}${result.stderr.toString()}`,
    );
  }
}

try {
  // --ignore-scripts: `prepack` would rebuild dist, which the caller (nx) has just built.
  run(["npm", "pack", "--ignore-scripts", "--pack-destination", app], root);
  const tarball = join(app, `hackcove-ui-${pkg.version}.tgz`);

  writeFileSync(
    join(app, "package.json"),
    JSON.stringify({
      name: "consumer",
      private: true,
      type: "module",
      dependencies: {
        "@hackcove/ui": `file:${tarball}`,
        react: pkg.devDependencies["react"],
        "react-dom": pkg.devDependencies["react-dom"],
        "@types/react": pkg.devDependencies["@types/react"],
        "@types/react-dom": pkg.devDependencies["@types/react-dom"],
      },
    }),
  );
  writeFileSync(join(app, "bunfig.toml"), '[install]\nlinker = "isolated"\nglobalStore = true\n');
  writeFileSync(
    join(app, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ES2023",
        jsx: "react-jsx",
        module: "ESNext",
        moduleResolution: "bundler",
        strict: true,
        skipLibCheck: true,
        noEmit: true,
        types: [],
      },
      include: ["src"],
    }),
  );
  writeFileSync(
    join(app, "src", "use.tsx"),
    [
      'import { Button } from "@hackcove/ui";',
      "",
      'export const ok = <Button variant="outline">Save</Button>;',
      "",
      "// @ts-expect-error className is not a Button prop (HC-128)",
      'export const noClass = <Button className="x">Save</Button>;',
    ].join("\n"),
  );

  run(["bun", "install", "--prefer-offline"], app);
  run([tsc, "-p", "."], app);
  process.stdout.write("consumer-types: ok (props resolve under the isolated linker)\n");
} finally {
  rmSync(app, { recursive: true, force: true });
}
