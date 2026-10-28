/** A line a pull request adds, with its line number in the new file. */
export type AddedLine = { line: number; text: string };

export type FileDiff = {
  path: string;
  /** The file does not exist on the base side. */
  isNew: boolean;
  added: AddedLine[];
};

type State = { files: FileDiff[]; current: FileDiff | undefined; inHunk: boolean; next: number };

const HUNK = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/;

const unquote = (path: string): string =>
  path.startsWith('"') && path.endsWith('"') ? path.slice(1, -1) : path;

/** `+++ b/src/a.tsx` to `src/a.tsx`; `undefined` for a deletion (`/dev/null`). */
function newPathOf(header: string): string | undefined {
  const path = unquote(header.slice(4).trim());
  return path === "/dev/null" ? undefined : path.replace(/^b\//, "");
}

function startFile(state: State): void {
  state.current = undefined;
  state.inHunk = false;
  state.files.push({ path: "", isNew: false, added: [] });
}

function inHeader(state: State, line: string): void {
  const file = state.files.at(-1);
  if (file === undefined) return;
  if (line.startsWith("new file mode")) file.isNew = true;
  if (line.startsWith("+++ ")) {
    const path = newPathOf(line);
    if (path === undefined) state.files.pop();
    else {
      file.path = path;
      state.current = file;
    }
  }
}

function inHunk(state: State, line: string): void {
  const { current } = state;
  if (current === undefined) return;
  if (line.startsWith("+")) {
    current.added.push({ line: state.next, text: line.slice(1) });
    state.next += 1;
  } else if (line.startsWith(" ")) state.next += 1;
}

/**
 * The files a unified diff (`git diff`, any context) adds lines to, and those lines. Deleted files
 * are dropped; a removed line is never reported.
 */
export function parseDiff(diff: string): FileDiff[] {
  const state: State = { files: [], current: undefined, inHunk: false, next: 0 };
  for (const line of diff.split("\n")) {
    const hunk = HUNK.exec(line);
    if (line.startsWith("diff --git ")) startFile(state);
    else if (hunk !== null && state.current !== undefined) {
      state.inHunk = true;
      state.next = Number(hunk[1]);
    } else if (state.inHunk) inHunk(state, line);
    else inHeader(state, line);
  }
  return state.files.filter((file) => file.path !== "");
}

/** A unified diff cut into one chunk per file, with the file's new path. */
export function splitDiff(diff: string): { path: string; text: string }[] {
  return diff.split(/^(?=diff --git )/m).flatMap((text) => {
    const header = /^\+\+\+ (.+)$/m.exec(text)?.[1];
    return header === undefined ? [] : [{ path: unquote(header).replace(/^b\//, ""), text }];
  });
}

/** The part of a unified diff that belongs to the files in `keep`. */
export function onlyFiles(diff: string, keep: ReadonlySet<string>): string {
  return splitDiff(diff)
    .filter((chunk) => keep.has(chunk.path))
    .map((chunk) => chunk.text)
    .join("");
}
