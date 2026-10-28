import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MODEL } from "./prompt.js";

/** Pinned like an action; bump it on purpose. */
export const OPENCODE_PACKAGE = "opencode-ai@1.19.4";

const MESSAGE =
  "Follow the instructions below and reply with the JSON object they ask for, nothing else.";

/**
 * The model reads the prompt and nothing else: no tools, no repo (it runs in an empty directory),
 * no session sharing. Reading is denied too: with the prompt attached as a file, the model
 * pages through it with the read tool, one round trip over the whole context per page, and that
 * ran a large review past its time limit.
 */
const CONFIG = JSON.stringify({
  permission: {
    edit: "deny",
    bash: "deny",
    webfetch: "deny",
    external_directory: "deny",
    read: "deny",
    glob: "deny",
    grep: "deny",
    list: "deny",
  },
  share: "disabled",
  autoupdate: false,
});

/**
 * The command a run would execute, for the dry run and for the run itself. The prompt goes in on
 * stdin, whole, in the one message; an argument or an attached file would not carry it.
 */
export function commandFor(): string[] {
  return ["bunx", OPENCODE_PACKAGE, "run", MESSAGE, "--model", MODEL];
}

/** Runs opencode over `prompt` and returns its reply. Rejects on a non-zero exit or after `timeoutMs`. */
export async function ask(prompt: string, apiKey: string, timeoutMs = 600_000): Promise<string> {
  const dir = mkdtempSync(join(tmpdir(), "ui-review-model-"));
  const [command = "bunx", ...args] = commandFor();
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
        stdio: ["pipe", "pipe", "pipe"],
        timeout: timeoutMs,
      });
      let out = "";
      let err = "";
      child.stdout.on("data", (chunk: Buffer) => (out += chunk.toString()));
      child.stderr.on("data", (chunk: Buffer) => (err += chunk.toString()));
      child.on("error", reject);
      // A child that exits early closes the pipe; its exit code is the error worth reporting.
      child.stdin.on("error", () => undefined);
      child.stdin.end(prompt);
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
