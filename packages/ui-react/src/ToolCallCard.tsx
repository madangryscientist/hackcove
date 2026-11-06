import type { ReactElement, ReactNode } from "react";
import { Disclosure } from "./Disclosure.js";
import { Pill, type PillTone } from "./Pill.js";
import type { Passthrough } from "./props.js";

const STATUS: Record<"running" | "done" | "error", { word: string; tone: PillTone }> = {
  running: { word: "Running", tone: "slate" },
  done: { word: "Done", tone: "emerald" },
  error: { word: "Failed", tone: "red" },
};

/**
 * One tool call in a chat: a closed panel whose line says which tool, what it was doing and how it
 * went; opening it shows the arguments and the result. The status is a word, not only a colour.
 */
export function ToolCallCard({
  name,
  status,
  summary,
  children,
  ...rest
}: {
  /** The tool's name, set in the monospace face. */
  name: string;
  /** How the call went: `running`, `done` or `error`, drawn as Running, Done or Failed. */
  status: "running" | "done" | "error";
  /** One line on what it did; a long one is cut off with an ellipsis. */
  summary?: string | undefined;
  /** The arguments and the result, shown while open. */
  children: ReactNode;
} & Passthrough): ReactElement {
  const { word, tone } = STATUS[status];
  return (
    <Disclosure
      {...rest}
      bordered
      summary={
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="max-w-1/2 shrink-0 truncate font-mono">{name}</span>
          <span className="min-w-0 flex-1 truncate font-normal text-slate-500">{summary}</span>
          <span className="shrink-0">
            <Pill tone={tone}>{word}</Pill>
          </span>
        </span>
      }
    >
      {children}
    </Disclosure>
  );
}
