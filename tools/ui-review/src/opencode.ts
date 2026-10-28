import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MODEL } from "./prompt.js";

/** Pinned like an action; bump it on purpose. */
export const OPENCODE_PACKAGE = "opencode-ai@1.19.4";

const MESSAGE =
  "Follow the instructions in the attached file and reply with the JSON object it asks for, nothing else.";

/**
 * The model reads the prompt and nothing else: no tools, no repo (it runs in an empty directory),
 * no session sharing.
 */
const CONFIG = JSON.stringify({
  permission: { edit: "deny", bash: "deny", webfetch: "deny", external_directory: "deny" },
  share: "disabled",
  autoupdate: false,
});

/**
 * The command a run would execute, for the dry run and for the run itself. The message comes
 * first: `--file` takes every argument after it, so a message placed after the file is read as a
 * second file and opencode fails with `File not found`.
 */
export function commandFor(promptFile: string): string[] {
  return ["bunx", OPENCODE_PACKAGE, "run", MESSAGE, "--model", MODEL, "--file", promptFile];
}

/** Runs opencode over `prompt` and returns its reply. Rejects on a non-zero exit or after `timeoutMs`. */
export async function ask(prompt: string, apiKey: string, timeoutMs = 600_000): Promise<string> {
  const dir = mkdtempSync(join(tmpdir(), "ui-review-model-"));
  const promptFile = join(dir, "prompt.md");
  writeFileSync(promptFile, prompt);
  const [command = "bunx", ...args] = commandFor(promptFile);
  try {
    return await new Promise<string>((resolve, reject) => {
      const child = spawn(command, args, {
        cwd: dir,
        // XDG_CONFIG_HOME is the empty temp dir, so a global opencode config cannot change the run.
        env: {
          ...process.env,
          OPENCODE_API_KEY: apiKey,
          OPENCODE_CONFIG_CONTENT: CONFIG,
          XDG_CONFIG_HOME: dir,
        },
        stdio: ["ignore", "pipe", "pipe"],
        timeout: timeoutMs,
      });
      let out = "";
      let err = "";
      child.stdout.on("data", (chunk: Buffer) => (out += chunk.toString()));
      child.stderr.on("data", (chunk: Buffer) => (err += chunk.toString()));
      child.on("error", reject);
      child.on("close", (code, signal) => {
        if (code === 0) resolve(out);
        else if (signal !== null)
          reject(new Error(`opencode was stopped by ${signal} (timeout ${timeoutMs} ms)`));
        else reject(new Error(`opencode exited ${code}: ${err.trim().slice(-400)}`));
      });
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
