import type { ReactElement } from "react";
import { CodeText } from "./CodeText.js";
import { CopyButton } from "./CopyButton.js";
import { cx, themedScrollbar } from "./cx.js";
import type { CodeLanguage } from "./highlight.js";

/**
 * The code of a `CodeBlock` or a `CodeExample`: the `<pre>` and, with `copy`, a `CopyButton` beside
 * it that copies `code` exactly as given (wrapping is CSS, so it adds no characters). `wrap` wraps
 * long lines at whitespace only (a flag with hyphens stays whole; a word wider than the box still
 * breaks inside itself); without it they scroll sideways under a themed thin scrollbar. The button's column has
 * a fixed width, so "copy" turning into "copied" never rewraps the code beside it. The button needs
 * client JS, which is why it is opt-in: a statically rendered page would show a dead one.
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
  return (
    <div className={cx("flex items-start", copy && "gap-1 pr-1.5")}>
      <div className={cx("min-w-0 flex-1", !wrap && `overflow-x-auto ${themedScrollbar}`)}>
        <pre
          className={cx(
            "px-3 py-2.5 font-mono text-[12.5px] text-slate-900",
            wrap ? "break-words whitespace-pre-wrap" : "w-max min-w-full whitespace-pre",
          )}
        >
          <CodeText code={code} language={language} breakAtSpaces={wrap} />
        </pre>
      </div>
      {copy && (
        <div className="flex w-14 shrink-0 justify-end pt-2">
          <CopyButton text={code} />
        </div>
      )}
    </div>
  );
}
