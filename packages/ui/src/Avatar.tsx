import type { HTMLAttributes, ReactElement } from "react";
import { cx } from "./cx.js";
import type { Unstyled } from "./props.js";

/** The identity colours, in hash order. Each is a stock background utility; a theme remaps them. */
const COLOUR_CLASSES = [
  "bg-violet-600",
  "bg-orange-600",
  "bg-cyan-600",
  "bg-emerald-600",
  "bg-sky-600",
  "bg-pink-600",
  "bg-amber-600",
] as const;

const SIZE_CLASSES = {
  sm: "size-6 text-xs",
  md: "size-8 text-xs",
  lg: "size-10 text-base",
  xl: "size-14 text-xl",
  "2xl": "size-24 text-3xl",
} as const;

export type AvatarSize = keyof typeof SIZE_CLASSES;

/** The background class for a name: the same name gets the same colour everywhere. */
export function avatarColourClass(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return COLOUR_CLASSES[hash % COLOUR_CLASSES.length] ?? COLOUR_CLASSES[0];
}

/** Up to two letters or digits of a name, upper-cased; `?` when it has none. */
export function initialsOf(name: string): string {
  return (
    name
      .replace(/[^a-z0-9]/gi, "")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

/**
 * A person as a round badge of initials, or as their photo when `src` is given. It never loads a
 * remote image on its own: that is a request to another server for decoration, and it makes a
 * screenshot depend on the network. `src` is the app's own local path.
 */
export function Avatar({
  name,
  src,
  size = "md",
  ring = false,
  ...rest
}: {
  /** Whose avatar: its initials, its colour (a hash of the name) and its title or `alt`. */
  name: string;
  /** The person's photo, a local path. It replaces the initials and is announced as `name`. */
  src?: string;
  /**
   * `sm` 24px, `md` 32px, `lg` 40px, `xl` 56px or `2xl` 96px.
   * @default md
   */
  size?: AvatarSize;
  /** A ring in the page colour, for a stack of overlapping avatars. */
  ring?: boolean;
} & Unstyled<Omit<HTMLAttributes<HTMLElement>, "children">>): ReactElement {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        title={name}
        className={cx(
          "shrink-0 rounded-full object-cover",
          SIZE_CLASSES[size],
          ring && "-ml-1.5 border-2 border-slate-50 first:ml-0",
        )}
        {...rest}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      title={name}
      className={cx(
        "inline-grid shrink-0 place-items-center rounded-full font-semibold text-violet-50",
        SIZE_CLASSES[size],
        avatarColourClass(name),
        ring && "-ml-1.5 border-2 border-slate-50 first:ml-0",
      )}
      {...rest}
    >
      {initialsOf(name)}
    </span>
  );
}
