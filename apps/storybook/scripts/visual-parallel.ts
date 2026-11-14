/**
 * How the visual run shares the machine: how many groups an upload runs at once, how many capture
 * workers each takes, and the pool that runs them (`visual.ts`).
 */
import { availableParallelism } from "node:os";
import { VisualError, log } from "./visual-tools.js";

/** PixelSlash's own ceiling for its capture workers (its default is `min(10, CPUs)`). */
const MAX_WORKERS = 10;

/** How many groups an upload runs at once, from `VISUAL_PARALLEL` (a whole number, default 1). */
export function parallelFrom(raw: string | undefined): number {
  if (raw === undefined || raw === "") return 1;
  if (!/^[1-9]\d*$/.test(raw))
    throw new VisualError(`VISUAL_PARALLEL is not a whole number of 1 or more: ${raw}`);
  return Number(raw);
}

/**
 * The workers an upload's group takes: the CPUs this process may use, shared between the
 * `VISUAL_PARALLEL` groups that run beside it. Logged, so each run states its count.
 */
export function uploadWorkers(): number {
  const parallel = parallelFrom(process.env["VISUAL_PARALLEL"]);
  const workers = captureWorkers(parallel, availableParallelism());
  log(`capturing with ${workers} workers (${parallel} groups at once)`);
  return workers;
}

/**
 * The capture workers one group takes when `parallel` groups share `cpus`: groups times workers
 * stays within the CPUs, and a group never takes more than PixelSlash's ten.
 */
export function captureWorkers(parallel: number, cpus: number): number {
  if (parallel > cpus)
    throw new VisualError(
      `VISUAL_PARALLEL=${parallel} is more than the ${cpus} CPUs available; groups times workers must fit`,
    );
  return Math.max(1, Math.min(MAX_WORKERS, Math.floor(cpus / parallel)));
}

/**
 * Runs `task` on every item, `parallel` at a time, in order. A `VisualError` is printed as it
 * happens and does not stop the items still to run; once all have run, the run fails naming how
 * many did. Any other error is a bug and is thrown as it is, after the rest have finished.
 */
export async function eachAtOnce<T>(
  items: T[],
  parallel: number,
  task: (item: T) => Promise<void>,
): Promise<void> {
  const queue = [...items];
  const failed: VisualError[] = [];
  let bug: unknown;
  const worker = async () => {
    for (let item = queue.shift(); item !== undefined; item = queue.shift()) {
      try {
        await task(item);
      } catch (error) {
        if (!(error instanceof VisualError)) bug ??= error;
        else {
          failed.push(error);
          process.stderr.write(`visual: ${error.message}\n`);
        }
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(parallel, items.length) }, worker));
  if (bug !== undefined) throw bug;
  if (failed.length > 0)
    throw new VisualError(`${failed.length} of ${items.length} groups failed; see above`);
}
