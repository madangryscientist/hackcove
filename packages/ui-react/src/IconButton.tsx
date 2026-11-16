import type { ComponentPropsWithoutRef, ReactElement } from "react";
import { Badge } from "./Badge.js";
import { cx, focusRing } from "./cx.js";
import { useDensity } from "./density.js";
import { Icon } from "./Icon.js";
import type { IconName } from "./icons.js";
import { renderLink } from "./link.js";
import { blockedProps, hasReason } from "./blocked.js";
import { Tipped } from "./Tooltip.js";
import type { Unstyled } from "./props.js";
import type { Size } from "./size.js";
import type { Tone } from "./tone.js";

/** An IconButton's look: `outline` with a border, or `ghost` with none until hover. */
export type IconButtonVariant = "outline" | "ghost";
/** An IconButton's tones: `neutral` (the default) and `danger`. */
export type IconButtonTone = Extract<Tone, "neutral" | "danger">;

const BASE = `relative inline-flex items-center justify-center rounded-lg border transition disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 ${focusRing}`;

/** The same heights as a `Button` of the size: 26px, 38px and 46px. */
const SIZE: Record<Size, string> = { sm: "size-6.5", md: "size-9.5", lg: "size-11.5" };

const LOOK: Record<IconButtonTone, Record<IconButtonVariant, string>> = {
  neutral: {
    outline: "border-slate-200 text-slate-500 hover:bg-slate-50",
    ghost: "border-transparent text-slate-500 hover:bg-slate-100",
  },
  danger: {
    outline: "border-red-200 text-red-700 hover:bg-red-50",
    ghost: "border-transparent text-red-700 hover:bg-red-50",
  },
};

type IconButtonProps = {
  /** The button's accessible name and its tooltip, shown on hover and on keyboard focus. */
  label: string;
  /**
   * `outline` has a border; `ghost` has none, until the hover fill.
   * @default outline
   */
  variant?: IconButtonVariant | undefined;
  /**
   * `danger` is red, for delete and clear.
   * @default neutral
   */
  tone?: IconButtonTone | undefined;
  /**
   * The button's height, matching a `Button` or `Input` of the same size. Left out, it takes the
   * size of the `Card`, `ListRow` or `Table` it sits in, else `md`.
   * @default md
   */
  size?: Size | undefined;
  /** The one icon it holds, from the `Icon` set, at the button's size. */
  icon: IconName;
  /** A red count on the top-right corner, for unread alerts. Not shown at 0; the name carries it for a screen reader, "Alerts, 3". */
  count?: number | undefined;
};

type IconButtonAsButton = IconButtonProps &
  Unstyled<Omit<ComponentPropsWithoutRef<"button">, "children">> & {
    /**
     * Why the button cannot be pressed: it dims and is blocked (`aria-disabled`; a click, Enter and
     * Space do nothing) while it stays in the tab order, and the reason is its tooltip on hover,
     * keyboard focus and a tap, read out as its description. The name stays `label`.
     */
    disabledReason?: string | undefined;
    href?: undefined;
    external?: undefined;
  };

type IconButtonAsLink = IconButtonProps & {
  disabledReason?: undefined;
  /** Opens in a new tab: adds `target="_blank"` and `rel="noreferrer"`. */
  external?: boolean | undefined;
  /** Makes the button a link to this URL; an in-app path goes through the app's `LinkProvider`. */
  href: string;
} & Unstyled<Omit<ComponentPropsWithoutRef<"a">, "href" | "children">>;

/** The classes for a variant, tone and size, each at its default when left out. Shared with `ColourSchemeToggle`, which draws its own `<button>`; not exported from `index.ts`. */
export function look({
  variant = "outline",
  tone = "neutral",
  size = "md",
}: Pick<IconButtonProps, "variant" | "tone" | "size">): string {
  return cx(BASE, SIZE[size], LOOK[tone][variant]);
}

function isLink(props: IconButtonAsButton | IconButtonAsLink): props is IconButtonAsLink {
  return props.href !== undefined;
}

/**
 * A square button holding one icon from the `Icon` set (`icon`). `label` is its accessible name
 * and tooltip. `variant="ghost"` drops the border for a quiet action in a row or a toolbar; `size`
 * matches the height of a `Button` of the same size (`sm` 26px, `md` 38px, `lg` 46px) and with no
 * `size` it takes its container's; `tone="danger"` is red, for delete and clear; `count` pins a
 * red count to the corner; `disabledReason` blocks it and shows why. Defaults to `type="button"`. `href` makes it a link instead (the app's
 * router link through `LinkProvider` for an in-app path, else a plain `<a>`; `external` opens a
 * new tab), with the same look.
 */
export function IconButton(props: IconButtonAsButton | IconButtonAsLink): ReactElement {
  const drawn = useDensity(props.size);
  const inside = (count: number | undefined, icon: IconName) => (
    <>
      <Icon name={icon} size={drawn} />
      {count ? <Badge count={count} corner aria-hidden="true" /> : null}
    </>
  );
  if (isLink(props)) {
    const { label, variant, tone, size: _size, count, icon, disabledReason: _r, ...link } = props;
    return (
      // The text is the name, already `aria-label`, so it describes nothing; no tap: a tap is the action.
      <Tipped text={named(label, count)} describes={false} own={link}>
        {(tip) =>
          renderLink({
            ...link,
            ...tip,
            external: link.external ?? false,
            "aria-label": named(label, count),
            className: look({ variant, tone, size: drawn }),
            children: inside(count, icon),
          })
        }
      </Tipped>
    );
  }
  const { label, variant, tone, size: _size, count, icon, disabledReason, ...rest } = props;
  const blocked = hasReason(disabledReason);
  return (
    // Blocked, the tooltip is the reason, a description and shown on a tap; else it is the name.
    <Tipped
      text={blocked ? disabledReason : named(label, count)}
      describes={blocked}
      tap={blocked}
      own={rest}
    >
      {(tip) => (
        <button
          type="button"
          {...rest}
          {...tip}
          {...(blocked ? blockedProps() : {})}
          aria-label={named(label, count)}
          className={look({ variant, tone, size: drawn })}
        >
          {inside(count, icon)}
        </button>
      )}
    </Tipped>
  );
}

/** The accessible name with its count: `Alerts, 3`. */
function named(label: string, count: number | undefined): string {
  return count ? `${label}, ${count}` : label;
}
