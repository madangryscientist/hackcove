import type { Emit, Scanner } from "./highlightKit.js";
import { sticky } from "./highlightKit.js";

const OPEN = /<(\/?)([A-Za-z][\w:-]*)/y;
const DOCTYPE = /<!doctype\b[^>]*>?/iy;
const SPACE = /\s+/y;
const ATTR = /[^\s"'<>/=]+/y;
const UNQUOTED = /[^\s>"'=<`]+/y;

type TagScan = { code: string; emit: Emit; at: number; afterEquals: boolean };

/** `>` or `/>` where the tag ends. */
function tagEnd(code: string, at: number): ">" | "/>" | undefined {
  if (code.startsWith("/>", at)) return "/>";
  return code.charAt(at) === ">" ? ">" : undefined;
}

/** The value after an `=`: a quoted string (which may span lines) or a bare run, which stays plain. */
function takeValue(scan: TagScan): boolean {
  const { code, at } = scan;
  const c = code.charAt(at);
  if (c === '"' || c === "'") {
    const close = code.indexOf(c, at + 1);
    const end = close === -1 ? code.length : close + 1;
    scan.emit("string", code.slice(at, end));
    scan.at = end;
    return true;
  }
  const bare = sticky(UNQUOTED, code, at);
  if (bare === undefined) return false;
  scan.emit("plain", bare);
  scan.at += bare.length;
  return true;
}

/** One piece of a tag's insides: space, `=`, a value, an attribute name, or a stray character. */
function tagStep(scan: TagScan): void {
  const { code, at } = scan;
  const space = sticky(SPACE, code, at);
  if (space !== undefined) {
    scan.emit("plain", space);
    scan.at += space.length;
    return;
  }
  if (code.charAt(at) === "=") {
    scan.emit("plain", "=");
    scan.afterEquals = true;
    scan.at += 1;
    return;
  }
  const wasAfterEquals = scan.afterEquals;
  scan.afterEquals = false;
  if (wasAfterEquals && takeValue(scan)) return;
  const name = sticky(ATTR, code, at);
  scan.emit(name === undefined ? "plain" : "attr", name ?? code.charAt(at));
  scan.at += name?.length ?? 1;
}

/** The rest of a tag from just past its name; says where it ended and how. */
function scanTag(code: string, from: number, emit: Emit) {
  const scan: TagScan = { code, emit, at: from, afterEquals: false };
  while (scan.at < code.length) {
    const end = tagEnd(code, scan.at);
    if (end !== undefined) {
      emit("plain", end);
      return { end: scan.at + end.length, closed: true, selfClosed: end === "/>" };
    }
    tagStep(scan);
  }
  return { end: code.length, closed: false, selfClosed: false };
}

/** A comment (which may span lines) or a doctype at `at`: where it ends and its colour. */
function special(
  code: string,
  at: number,
): { end: number; kind: "comment" | "keyword" } | undefined {
  if (code.startsWith("<!--", at)) {
    const close = code.indexOf("-->", at + 4);
    return { end: close === -1 ? code.length : close + 3, kind: "comment" };
  }
  const doctype = sticky(DOCTYPE, code, at);
  return doctype === undefined ? undefined : { end: at + doctype.length, kind: "keyword" };
}

type Embedded = { script: Scanner; style: Scanner };
type Raw = { name: "script" | "style"; scan: Scanner };

/** The `<script>` or `<style>` start tag whose content is another language, if this is one. */
function rawOf(
  name: string,
  tag: { closed: boolean; selfClosed: boolean },
  embedded: Embedded,
): Raw | undefined {
  if (!tag.closed || tag.selfClosed) return undefined;
  if (name === "script") return { name, scan: embedded.script };
  return name === "style" ? { name, scan: embedded.style } : undefined;
}

/** The content of a `<script>` or `<style>`, up to the first closing tag of that name, wherever it falls. */
function rawContent(code: string, at: number, raw: Raw, emit: Emit): number {
  const closing = new RegExp(`</${raw.name}(?=[\\s/>]|$)`, "gi");
  closing.lastIndex = at;
  const end = closing.exec(code)?.index ?? code.length;
  raw.scan(code.slice(at, end), emit);
  return end;
}

/** A tag at a `<`, or a lone `<` that opens nothing. Returns the index to carry on from. */
function scanElement(code: string, at: number, emit: Emit, embedded: Embedded): number {
  OPEN.lastIndex = at;
  const open = OPEN.exec(code);
  if (open === null) {
    emit("plain", "<");
    return at + 1;
  }
  const [whole, slash = "", tagName = ""] = open;
  emit("plain", `<${slash}`);
  emit("tag", tagName);
  const tag = scanTag(code, at + whole.length, emit);
  const raw = slash === "" ? rawOf(tagName.toLowerCase(), tag, embedded) : undefined;
  return raw === undefined ? tag.end : rawContent(code, tag.end, raw, emit);
}

/** Markup at a `<`: a comment, a doctype or a tag. Returns the index to carry on from. */
function scanMarkup(code: string, at: number, emit: Emit, embedded: Embedded): number {
  const found = special(code, at);
  if (found === undefined) return scanElement(code, at, emit, embedded);
  emit(found.kind, code.slice(at, found.end));
  return found.end;
}

/**
 * HTML: comments, the doctype, tags with their attributes (a start tag may span lines), and text,
 * which is plain. The content of `<script>` and `<style>` runs to the first closing tag of that
 * name, wherever it falls, and is scanned with `script` (JS) or `style` (CSS).
 */
export function scanHtml(code: string, emit: Emit, script: Scanner, style: Scanner): void {
  let at = 0;
  while (at < code.length) {
    if (code.charAt(at) === "<") {
      at = scanMarkup(code, at, emit, { script, style });
      continue;
    }
    const next = code.indexOf("<", at);
    const end = next === -1 ? code.length : next;
    emit("plain", code.slice(at, end));
    at = end;
  }
}
