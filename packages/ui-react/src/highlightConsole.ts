import type { Emit, Scanner } from "./highlightKit.js";
import { splitLines } from "./highlightKit.js";

const CONSOLE_PROMPT = "$ ";

type ConsoleLine = { body: string; eol: string; command: boolean; prompt: boolean };

/**
 * The lines of a console session, marked: a line that starts with `$ ` is a command (`prompt`), and
 * so is every line after a command line that ends with `\\`, which continues it. The rest is output.
 */
function consoleLines(code: string): ConsoleLine[] {
  let continued = false;
  return splitLines(code).map(({ body, eol }) => {
    const prompt = !continued && body.startsWith(CONSOLE_PROMPT);
    const command = prompt || continued;
    continued = command && body.endsWith("\\");
    return { body, eol, command, prompt };
  });
}

/** A shell session: `$ ` is the prompt, the command after it is bash, other lines are output. */
export function scanConsole(code: string, emit: Emit, bash: Scanner): void {
  for (const { body, eol, command, prompt } of consoleLines(code)) {
    if (prompt) emit("prompt", CONSOLE_PROMPT);
    const text = prompt ? body.slice(CONSOLE_PROMPT.length) : body;
    if (command) bash(text, emit);
    else emit("plain", text);
    emit("plain", eol);
  }
}

/**
 * What a console block's copy button copies: each command without its `$ `, plus the lines that
 * continue it as written (the trailing `\\` and the indentation kept, so the paste runs), joined by
 * newlines. Output is left out. A block with no `$ ` line has no commands, so it is copied as given.
 */
export function consoleCommands(code: string): string {
  const lines = consoleLines(code);
  if (!lines.some((line) => line.prompt)) return code;
  return lines
    .filter((line) => line.command)
    .map((line) => (line.prompt ? line.body.slice(CONSOLE_PROMPT.length) : line.body))
    .join("\n");
}
