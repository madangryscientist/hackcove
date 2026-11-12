import { Code } from "@hackcove/ui-react";
import { Fragment } from "react";

/** Text with `backticked` runs drawn as `Code`: how a prop's JSDoc and the page copy name code. */
export function InlineCode({ text }: { text: string }) {
  return (
    <>
      {text.split("`").map((part, i) =>
        // The odd parts are between backticks.
        i % 2 === 1 ? <Code key={i}>{part}</Code> : <Fragment key={i}>{part}</Fragment>,
      )}
    </>
  );
}
