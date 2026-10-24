import type { HTMLAttributes, ReactElement } from "react";
import { cx } from "./cx.js";

/** A bulleted `<ul>`: discs, indented, a small gap between items. Its children are `<li>`s (e.g. `Body as="li"`). */
export function BulletList({ className, ...rest }: HTMLAttributes<HTMLUListElement>): ReactElement {
  return <ul className={cx("list-disc space-y-1 pl-5", className)} {...rest} />;
}
