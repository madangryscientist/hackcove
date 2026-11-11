import type { Emit, TokenKind } from "./highlightKit.js";
import { splitLines, sticky } from "./highlightKit.js";

const YAML_MARKER = /-(?: +|$)/y;
const YAML_KEYWORDS = /^(?:true|false|null|~)$/;
const YAML_NUMBER = /^-?\d[\d._]*$/;
const YAML_BLOCK_HEADER = /^[|>](?:[1-9][-+]?|[-+][1-9]?)?$/;

/**
 * The index past the quoted scalar at `at` in a YAML line, or `undefined`. A single-quoted scalar
 * escapes a quote by doubling it (`'it''s'`), a double-quoted one with a backslash.
 */
function quotedEnd(line: string, at: number): number | undefined {
  const quote = line.charAt(at);
  if (quote !== '"' && quote !== "'") return undefined;
  let i = at + 1;
  while (i < line.length) {
    const c = line.charAt(i);
    if (quote === '"' && c === "\\") i += 2;
    else if (c !== quote) i += 1;
    else if (quote === "'" && line.charAt(i + 1) === "'") i += 2;
    else return i + 1;
  }
  return line.length;
}

/** What follows a quoted scalar: spaces, then perhaps a comment. */
function trailing(rest: string, emit: Emit): void {
  const comment = /^(\s+)(#.*)$/.exec(rest);
  if (comment === null) emit("plain", rest);
  else {
    emit("plain", comment[1] ?? "");
    emit("comment", comment[2] ?? "");
  }
}

type Key = { end: number; kind: TokenKind };

/** A quoted key: the closing quote must be followed by `:` and a space or the line end. */
function quotedKey(line: string, at: number): Key | undefined {
  const end = quotedEnd(line, at);
  if (end === undefined || end - at < 2 || line.charAt(end - 1) !== line.charAt(at))
    return undefined;
  return /^:(?:\s|$)/.test(line.slice(end)) ? { end, kind: "string" } : undefined;
}

/** An unquoted key: the text up to the first `:` that is followed by a space or the line end. */
function plainKey(line: string, at: number): Key | undefined {
  if ("#[{|>".includes(line.charAt(at))) return undefined;
  const colon = /:(?:\s|$)/.exec(line.slice(at));
  if (colon === null || colon.index === 0) return undefined;
  const text = line.slice(at, at + colon.index);
  if (/(?:^|\s)#/.test(text)) return undefined;
  return { end: at + text.trimEnd().length, kind: "attr" };
}

/** The mapping key at `at`: where its text ends (before the `:`) and its colour. */
function keyAt(line: string, at: number): Key | undefined {
  const first = line.charAt(at);
  if (first === "") return undefined;
  return first === '"' || first === "'" ? quotedKey(line, at) : plainKey(line, at);
}

/** The colour of an unquoted scalar read whole. */
function scalarKind(scalar: string): TokenKind {
  if (YAML_NUMBER.test(scalar)) return "number";
  return YAML_KEYWORDS.test(scalar) ? "keyword" : "plain";
}

/** A value: a quoted string, or an unquoted scalar up to a comment. True when it opens a block scalar. */
function emitValue(line: string, from: number, emit: Emit): boolean {
  const value = line.slice(from);
  if (value === "") return false;
  if (value.startsWith("#")) {
    emit("comment", value);
    return false;
  }
  const quoted = quotedEnd(line, from);
  if (quoted !== undefined) {
    emit("string", line.slice(from, quoted));
    trailing(line.slice(quoted), emit);
    return false;
  }
  const comment = /\s#/.exec(value);
  const scalar = line.slice(from, comment === null ? line.length : from + comment.index).trimEnd();
  emit(scalarKind(scalar), scalar);
  const commentAt = comment === null ? line.length : from + comment.index + 1;
  emit("plain", line.slice(from + scalar.length, commentAt));
  emit("comment", line.slice(commentAt));
  return YAML_BLOCK_HEADER.test(scalar);
}

/** The `- ` markers from `at`: where the content starts, and the column of the last dash. */
function emitMarkers(line: string, at: number, emit: Emit): { at: number; column: number } {
  let column = at;
  let next = at;
  for (;;) {
    const marker = sticky(YAML_MARKER, line, next);
    if (marker === undefined) return { at: next, column };
    column = next;
    emit("plain", marker);
    next += marker.length;
  }
}

/**
 * One YAML line. Returns the column its block scalar's lines must be indented past, when it ends
 * in `|` or `>`: the key's own column, after any `- ` markers (a key-less item uses its dash's).
 */
function scanLine(line: string, emit: Emit): number | undefined {
  const indent = line.length - line.trimStart().length;
  emit("plain", line.slice(0, indent));
  if (line.charAt(indent) === "#") {
    emit("comment", line.slice(indent));
    return undefined;
  }
  const markers = emitMarkers(line, indent, emit);
  let { at, column } = markers;
  const key = keyAt(line, at);
  if (key !== undefined) {
    column = at;
    emit(key.kind, line.slice(at, key.end));
    const colon = line.indexOf(":", key.end);
    emit("plain", line.slice(key.end, colon + 1));
    at = colon + 1;
  }
  const gap = line.length - at - line.slice(at).trimStart().length;
  emit("plain", line.slice(at, at + gap));
  return emitValue(line, at + gap, emit) ? column : undefined;
}

/** Line by line. The lines of a block scalar are one plain run: no comment or key is read in them. */
export function scanYaml(code: string, emit: Emit): void {
  let block: number | undefined;
  for (const { body, eol } of splitLines(code)) {
    const indent = body.length - body.trimStart().length;
    if (block !== undefined && (body.trim() === "" || indent > block)) {
      emit("plain", body + eol);
      continue;
    }
    block = scanLine(body, emit);
    emit("plain", eol);
  }
}
