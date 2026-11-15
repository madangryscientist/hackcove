import type { ReactNode } from "react";
import { CardBar, CardHeader, CardHeading, CardIcon, CardInset } from "./CardParts.js";
import { cx } from "./cx.js";
import type { IconName } from "./icons.js";
import type { Size } from "./size.js";

/** The padding of a card's body by `size`. */
export const BODY_PAD: Record<Size, string> = { sm: "p-3", md: "p-5", lg: "p-6" };

/** The options a card resolved (`cardForm` in `Card.tsx`) that shape its body. */
type BodyForm = {
  flush: boolean;
  bar: boolean;
  dashed: boolean;
  icon: IconName | undefined;
  fill: boolean;
  footer: boolean;
  size: Size;
};

type BodyParts = {
  title: string | undefined;
  titleStyle: "overline" | "name" | undefined;
  count: number | undefined;
  status: ReactNode;
  actions: ReactNode;
  inset: ReactNode;
  children: ReactNode;
  headingId: string | undefined;
};

function insetBand(form: BodyForm, inset: ReactNode): ReactNode {
  if (!inset || form.dashed) return null;
  return (
    <CardInset size={form.size} bleed={!form.flush}>
      {inset}
    </CardInset>
  );
}

/** With `fill` the body takes the room the header (and a footer) leave, and only it scrolls. */
const SCROLL = "min-h-0 flex-1 overflow-y-auto";

/** The padding the body takes itself, when the root has none: never on a flush card. */
const pad = (form: BodyForm) => !form.flush && BODY_PAD[form.size];

/** The icon, header, inset band and children of a card with no bar. */
function plainBody(form: BodyForm, heading: ReactNode, parts: BodyParts): ReactNode {
  const content = (
    <>
      {form.icon && <CardIcon name={form.icon} size={form.size} />}
      <CardHeader heading={heading} actions={parts.actions} size={form.size} />
      {insetBand(form, parts.inset)}
      {form.fill ? <div className={SCROLL}>{parts.children}</div> : parts.children}
    </>
  );
  if (form.fill) {
    return <div className={cx("flex min-h-0 flex-1 flex-col", pad(form))}>{content}</div>;
  }
  // With a footer the root has no padding, so the body pads itself and takes the room left over.
  return form.footer ? <div className={cx("flex-1", pad(form))}>{content}</div> : content;
}

export function cardBody(form: BodyForm, parts: BodyParts): ReactNode {
  const heading = parts.title && (
    <CardHeading
      id={parts.headingId}
      title={parts.title}
      titleStyle={parts.titleStyle}
      count={parts.count}
      status={parts.status}
      bar={form.bar}
      spaced={!form.bar && !parts.actions}
      size={form.size}
    />
  );
  if (!form.bar) return plainBody(form, heading, parts);
  const grow = form.fill ? SCROLL : form.footer && "flex-1";
  return (
    <>
      <CardBar heading={heading} actions={parts.actions} size={form.size} />
      <div className={cx(grow, pad(form)) || undefined}>
        {insetBand(form, parts.inset)}
        {parts.children}
      </div>
    </>
  );
}
