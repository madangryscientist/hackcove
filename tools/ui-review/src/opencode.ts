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

/** The command a run would execute, for the dry run and for the run itself. */
export function commandFor(promptFile: string): string[] {
  return ["bunx", OPENCODE_PACKAGE, "run", "--model", MODEL, "--file", promptFile, MESSAGE];
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
        env: { ...process.env, OPENCODE_API_KEY: apiKey, OPENCODE_CONFIG_CONTENT: CONFIG },
        stdio: ["ignore", "pipe", "pipe"],
        timeout: timeoutMs,
      });
      let out = "";
      let err = "";
      child.stdout.on("data", (chunk: Buffer) => (out += chunk.toString()));
      child.stderr.on("data", (chunk: Buffer) => (err += chunk.toString()));
      child.on("error", reject);
      child.on("close", (code) =>
        code === 0
          ? resolve(out)
          : reject(new Error(`opencode exited ${code}: ${err.trim().slice(-400)}`)),
      );
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
