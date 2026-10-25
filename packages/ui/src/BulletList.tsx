import type { HTMLAttributes, ReactElement } from "react";
import type { Unstyled } from "./props.js";

/** A bulleted `<ul>`: discs, indented, a small gap between items. Its children are `<li>`s (e.g. `Body as="li"`). */
export function BulletList(props: Unstyled<HTMLAttributes<HTMLUListElement>>): ReactElement {
  return <ul {...props} className="list-disc space-y-1 pl-5" />;
}
