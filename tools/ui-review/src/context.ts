import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** What the rules need to know about Hack Cove, read from a hackcove checkout. */
export type Context = {
  /** Every component `@hackcove/ui` exports (capitalised, not a type). */
  components: ReadonlySet<string>;
  /** A palette utility to the role `packages/ui/palette.json` files it under. */
  palette: ReadonlyMap<string, string>;
};

const EXPORT_BLOCK = /export\s*\{([^}]*)\}\s*from/g;

/** The value exports of `packages/ui/src/index.ts` that read as components. */
export function componentsOf(indexSource: string): Set<string> {
  const names = new Set<string>();
  for (const block of indexSource.matchAll(EXPORT_BLOCK)) {
    for (const entry of (block[1] ?? "").split(",")) {
      const spec = entry.trim();
      const name = spec.split(/\s+as\s+/).at(-1) ?? "";
      if (!spec.startsWith("type ") && /^[A-Z]\w*$/.test(name)) names.add(name);
    }
  }
  return names;
}

export function paletteOf(json: string): Map<string, string> {
  const roles: Record<string, string[]> = JSON.parse(json);
  return new Map(
    Object.entries(roles).flatMap(([role, utilities]) => utilities.map((u) => [u, role])),
  );
}

/** Reads the component list and the palette out of a hackcove checkout. */
export function loadContext(hackcoveDir: string): Context {
  const index = join(hackcoveDir, "packages", "ui", "src", "index.ts");
  const palette = join(hackcoveDir, "packages", "ui", "palette.json");
  if (!existsSync(index) || !existsSync(palette)) {
    throw new Error(`${hackcoveDir} is not a hackcove checkout (no packages/ui/src/index.ts)`);
  }
  return {
    components: componentsOf(readFileSync(index, "utf8")),
    palette: paletteOf(readFileSync(palette, "utf8")),
  };
}
