import type { ReactElement } from "react";
import { CodeText } from "./CodeText.js";
import { CopyButton } from "./CopyButton.js";
import { cx, themedScrollbar } from "./cx.js";
import { consoleCommands, type CodeLanguage } from "./highlight.js";
import { useScrollStop } from "./scrollStop.js";

/**
 * The strip's focus ring, drawn inside it: the frame around the code clips anything outside the
 * strip. `focusRing` with `-outline-offset-2` added would not do, since `outline-offset-2` comes
 * later in the CSS and wins.
 */
const INSET_RING =
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-violet-600";

/**
 * The code of a `CodeBlock` or a `CodeExample`: the `<pre>` and, with `copy`, a `CopyButton` beside
 * it that copies `code` exactly as given (wrapping is CSS, so it adds no characters), except in a
 * `console` block, where it copies only the commands (see `consoleCommands`). `wrap` wraps
 * long lines at whitespace only (a flag with hyphens stays whole; a word wider than the box still
 * breaks inside itself); without it they scroll sideways under a themed thin scrollbar. The button's column has
 * a fixed width, so "copy" turning into "copied" never rewraps the code beside it. The button needs
 * client JS, which is why it is opt-in: a page rendered to static HTML needs `copyScript` inlined
 * or the button is dead.
 */
export function CodeBody({
  code,
  language,
  wrap,
  copy,
}: {
  code: string;
  language: CodeLanguage;
  wrap: boolean;
  copy: boolean;
}): ReactElement {
  // A strip that scrolls sideways holds no link or button, so when it overflows it takes a tab
  // stop of its own, or the keyboard could never scroll it (axe's scrollable-region-focusable).
  const { attach, stop } = useScrollStop("x");
  const tabStop = !wrap && stop;
  return (
    <div className={cx("flex items-start", copy && "gap-1 pr-1.5")}>
      <div
        ref={wrap ? undefined : attach}
        tabIndex={tabStop ? 0 : undefined}
        className={cx(
          "min-w-0 flex-1",
          !wrap && `overflow-x-auto ${themedScrollbar}`,
          tabStop && INSET_RING,
        )}
      >
        <pre
          className={cx(
            "px-3 py-2.5 font-mono text-[12.5px] leading-normal text-slate-900",
            wrap ? "break-words whitespace-pre-wrap" : "w-max min-w-full whitespace-pre",
          )}
        >
          <CodeText code={code} language={language} breakAtSpaces={wrap} />
        </pre>
      </div>
      {copy && (
        <div className="flex w-14 shrink-0 justify-end pt-2">
          <CopyButton text={language === "console" ? consoleCommands(code) : code} />
        </div>
      )}
    </div>
  );
}
