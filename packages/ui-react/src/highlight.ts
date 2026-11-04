/**
 * A small tokenizer for the languages the docs show. It splits code into coloured runs and nothing
 * else: no HTML, no client JS. `CodeText` maps a run to a palette utility, so a theme recolours
 * highlighted code exactly as it recolours everything else.
 *
 * The grammars are deliberately shallow — enough for examples, not a compiler front end. `text`
 * returns the code as one plain run, so nothing is coloured where no language is named.
 */

export type CodeLanguage = "text" | "tsx" | "ts" | "json" | "bash" | "css";

export type TokenKind =
  | "plain"
  | "comment"
  | "keyword"
  | "string"
  | "number"
  | "tag"
  | "attr"
  | "function";

export type Token = { text: string; kind: TokenKind };

/** One run found at a position: where it ends and what colour it takes. */
type Match = { kind: TokenKind; end: number };

/** A sticky pattern (it must match at the position it is tried at) and the colour of what it matches. */
type Rule = {
  pattern: RegExp;
  /** A fixed colour, or one decided from the match (a keyword, a call, a CSS property). */
  kind: TokenKind | ((code: string, start: number, end: number) => TokenKind);
};

type Emit = (kind: TokenKind, text: string) => void;

/** The coloured runs of `code`. The text of every token joined back together is `code`. */
export function highlight(code: string, language: CodeLanguage): Token[] {
  const tokens: Token[] = [];
  const emit = (kind: TokenKind, text: string): void => {
    if (text === "") return;
    const last = tokens.at(-1);
    if (last !== undefined && last.kind === kind) last.text += text;
    else tokens.push({ kind, text });
  };
  if (language === "text") emit("plain", code);
  else if (language === "bash") scanBash(code, emit);
  else if (language === "css") scanCss(code, emit);
  // JSON is JS with no code around it: keys are strings, `true`/`false`/`null` are keywords.
  else scanJs(code, emit);
  return tokens;
}

const isLetter = (c: string) => c !== "" && /[A-Za-z_$]/.test(c);

/** The first rule that matches at `at`, if any. Every pattern consumes at least one character. */
function match(rules: Rule[], code: string, at: number): Match | undefined {
  for (const rule of rules) {
    rule.pattern.lastIndex = at;
    const found = rule.pattern.exec(code);
    if (found === null) continue;
    const end = at + found[0].length;
    const kind = typeof rule.kind === "function" ? rule.kind(code, at, end) : rule.kind;
    return { kind, end };
  }
  return undefined;
}

/** The index past the quoted run starting at `at`, or `undefined` when there is none there. */
function quotedEnd(code: string, at: number): number | undefined {
  const quote = code.charAt(at);
  if (quote !== '"' && quote !== "'" && quote !== "`") return undefined;
  let i = at + 1;
  while (i < code.length) {
    const c = code.charAt(i);
    if (c === "\\") {
      i += 2;
      continue;
    }
    if (c === quote) return i + 1;
    if (c === "\n" && quote !== "`") return i;
    i += 1;
  }
  return code.length;
}

const STRING_RULES: Rule[] = [
  { pattern: /"(?:\\.|[^"\\\n])*"?/y, kind: "string" },
  { pattern: /'(?:\\.|[^'\\\n])*'?/y, kind: "string" },
  { pattern: /`(?:\\.|[^`\\])*`?/y, kind: "string" },
];

const JS_KEYWORDS = new Set(
  (
    "as async await break case catch class const continue default delete do else export " +
    "extends false finally for from function if import in instanceof interface let new " +
    "null of return satisfies static super switch this throw true try type typeof " +
    "undefined var void while yield"
  ).split(" "),
);

/** The first character past `from` that is not a space. */
function afterSpace(code: string, from: number): string {
  let i = from;
  while (code.charAt(i) === " ") i += 1;
  return code.charAt(i);
}

const JS_RULES: Rule[] = [
  { pattern: /\/\/[^\n]*/y, kind: "comment" },
  { pattern: /\/\*[\s\S]*?(?:\*\/|$)/y, kind: "comment" },
  ...STRING_RULES,
  { pattern: /\d[\w.]*/y, kind: "number" },
  {
    pattern: /[A-Za-z_$][\w$]*/y,
    kind: (code, start, end) => {
      if (JS_KEYWORDS.has(code.slice(start, end))) return "keyword";
      return afterSpace(code, end) === "(" ? "function" : "plain";
    },
  },
];

type JsMode = "js" | "children" | "tag";

type JsScan = {
  code: string;
  emit: Emit;
  at: number;
  mode: JsMode;
  /** The mode each open element returns to when its closing tag ends. */
  elements: JsMode[];
  /** One entry per `{…}` opened from JSX: the mode to return to, and its open-brace depth. */
  expressions: { back: JsMode; depth: number }[];
  /** The tag being read is a closing tag (`</Name>`). */
  closing: boolean;
  /** The mode the current element was opened from. */
  openedFrom: JsMode;
};

/** `\w`-style names in a tag, including the dashes of `aria-label` and `data-testid`. */
const TAG_NAME_RULE: Rule = { pattern: /[A-Za-z_$][\w$-]*/y, kind: "tag" };
const ATTR_RULE: Rule = { pattern: /[A-Za-z_$][\w$-]*/y, kind: "attr" };

function take(scan: JsScan, token: Match): void {
  scan.emit(token.kind, scan.code.slice(scan.at, token.end));
  scan.at = token.end;
}

function takeChar(scan: JsScan): void {
  scan.emit("plain", scan.code.charAt(scan.at));
  scan.at += 1;
}

/** `<Name` or `</Name` opens an element here; in children text a fragment `<>` does too. */
function opensElement(code: string, at: number): boolean {
  const next = code.charAt(at + 1);
  if (next === "/") return isLetter(code.charAt(at + 2));
  return next === ">" || isLetter(next);
}

function openElement(scan: JsScan): void {
  const next = scan.code.charAt(scan.at + 1);
  scan.closing = next === "/";
  scan.openedFrom = scan.mode;
  scan.emit("plain", scan.closing ? "</" : "<");
  scan.at += scan.closing ? 2 : 1;
  scan.mode = "tag";
  const name = match([TAG_NAME_RULE], scan.code, scan.at);
  if (name !== undefined) take(scan, name);
}

function endTag(scan: JsScan): void {
  const selfClosed = scan.code.charAt(scan.at - 1) === "/";
  takeChar(scan);
  if (scan.closing) scan.mode = scan.elements.pop() ?? "children";
  else if (selfClosed) scan.mode = scan.openedFrom;
  else {
    scan.elements.push(scan.openedFrom);
    scan.mode = "children";
  }
}

function openBrace(scan: JsScan, back: JsMode): void {
  scan.expressions.push({ back, depth: 0 });
  scan.mode = "js";
  takeChar(scan);
}

/** In code, `{` only deepens the JSX expression it is already inside. */
function openNestedBrace(scan: JsScan): void {
  const open = scan.expressions.at(-1);
  if (open !== undefined) open.depth += 1;
  takeChar(scan);
}

function closeBrace(scan: JsScan): void {
  const open = scan.expressions.at(-1);
  if (open === undefined) {
    takeChar(scan);
    return;
  }
  if (open.depth === 0) {
    scan.expressions.pop();
    scan.mode = open.back;
  } else open.depth -= 1;
  takeChar(scan);
}

function codeStep(scan: JsScan): void {
  const c = scan.code.charAt(scan.at);
  if (c === "<" && opensElement(scan.code, scan.at)) return openElement(scan);
  if (c === "{") return openNestedBrace(scan);
  if (c === "}") return closeBrace(scan);
  const token = match(JS_RULES, scan.code, scan.at);
  if (token !== undefined) return take(scan, token);
  takeChar(scan);
}

function tagStep(scan: JsScan): void {
  const c = scan.code.charAt(scan.at);
  if (c === "{") return openBrace(scan, "tag");
  if (c === ">") return endTag(scan);
  const quoted = quotedEnd(scan.code, scan.at);
  if (quoted !== undefined) return take(scan, { kind: "string", end: quoted });
  const token = match([ATTR_RULE], scan.code, scan.at);
  if (token !== undefined) return take(scan, token);
  takeChar(scan);
}

function childrenStep(scan: JsScan): void {
  const c = scan.code.charAt(scan.at);
  if (c === "{") return openBrace(scan, "children");
  if (c === "<" && opensElement(scan.code, scan.at)) return openElement(scan);
  takeChar(scan);
}

/**
 * JS, TS and TSX. Three modes — code, inside a tag, and children text — keep an apostrophe in
 * `<p>Don't</p>` as text rather than the start of a runaway string, and every open element records
 * the mode to return to, so a `{…}` expression that holds JSX closes back into code.
 */
function scanJs(code: string, emit: Emit): void {
  const scan: JsScan = {
    code,
    emit,
    at: 0,
    mode: "js",
    elements: [],
    expressions: [],
    closing: false,
    openedFrom: "js",
  };
  while (scan.at < code.length) {
    if (scan.mode === "js") codeStep(scan);
    else if (scan.mode === "tag") tagStep(scan);
    else childrenStep(scan);
  }
}

/** A `#` comment reaches its line end; it starts only at the start of a line or after a space. */
function bashCommentEnd(code: string, at: number): number | undefined {
  if (code.charAt(at) !== "#") return undefined;
  if (at > 0 && !/\s/.test(code.charAt(at - 1))) return undefined;
  const newline = code.indexOf("\n", at);
  return newline === -1 ? code.length : newline;
}

/** A word of a shell command: a quoted string, a `-flag`, or a run of path characters. */
function bashWord(code: string, at: number, isCommand: boolean): Match | undefined {
  const quoted = quotedEnd(code, at);
  if (quoted !== undefined) return { kind: "string", end: quoted };
  const token = match(
    [
      { pattern: /-{1,2}[\w-]+/y, kind: "attr" },
      { pattern: /[A-Za-z0-9_./@:~+-]+/y, kind: isCommand ? "function" : "plain" },
    ],
    code,
    at,
  );
  return token;
}

function scanBash(code: string, emit: Emit): void {
  let at = 0;
  /** The next word is the command: the line's first word, or one after `&&`, `|` or `;`. */
  let isCommand = true;
  while (at < code.length) {
    const comment = bashCommentEnd(code, at);
    if (comment !== undefined) {
      emit("comment", code.slice(at, comment));
      at = comment;
      continue;
    }
    const word = bashWord(code, at, isCommand);
    if (word !== undefined) {
      emit(word.kind, code.slice(at, word.end));
      at = word.end;
      isCommand = false;
      continue;
    }
    const c = code.charAt(at);
    if (c === "\n" || c === "&" || c === "|" || c === ";") isCommand = true;
    emit("plain", c);
    at += 1;
  }
}

const CSS_RULES: Rule[] = [
  { pattern: /\/\*[\s\S]*?(?:\*\/|$)/y, kind: "comment" },
  ...STRING_RULES,
  { pattern: /@[\w-]+/y, kind: "keyword" },
  { pattern: /#[\w]+/y, kind: "number" },
  { pattern: /\d[\w.]*/y, kind: "number" },
  {
    // A property name is a word before `:`; anything else is a selector or a value.
    pattern: /-?[A-Za-z][\w-]*/y,
    kind: (code, _start, end) => (afterSpace(code, end) === ":" ? "attr" : "plain"),
  },
];

function scanCss(code: string, emit: Emit): void {
  let at = 0;
  while (at < code.length) {
    const token = match(CSS_RULES, code, at);
    if (token !== undefined) {
      emit(token.kind, code.slice(at, token.end));
      at = token.end;
      continue;
    }
    emit("plain", code.charAt(at));
    at += 1;
  }
}
