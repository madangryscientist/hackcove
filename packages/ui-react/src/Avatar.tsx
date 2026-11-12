import type { HTMLAttributes, ReactElement } from "react";
import { cx, focusRing } from "./cx.js";
import type { Unstyled } from "./props.js";
import { useImageFailed } from "./useImageFailed.js";

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
  xs: "size-4 text-[0.5rem]",
  sm: "size-6 text-xs",
  md: "size-8 text-xs",
  lg: "size-10 text-base",
  xl: "size-14 text-xl",
  "2xl": "size-16 text-2xl",
  "3xl": "size-24 text-3xl",
} as const;

export type AvatarSize = keyof typeof SIZE_CLASSES;

/** `round` for a person, `square` (rounded corners that grow with the size) for an org or a team. */
export type AvatarShape = "round" | "square";

const SQUARE_CLASSES: Record<AvatarSize, string> = {
  xs: "rounded-sm",
  sm: "rounded",
  md: "rounded-md",
  lg: "rounded-md",
  xl: "rounded-lg",
  "2xl": "rounded-lg",
  "3xl": "rounded-xl",
};

/** The corner classes for a shape at a size; `AvatarStack`'s "+N" chip uses the same. */
export function avatarShapeClass(shape: AvatarShape, size: AvatarSize): string {
  return shape === "square" ? SQUARE_CLASSES[size] : "rounded-full";
}

/** The size classes of an Avatar, shared with `AvatarStack`'s "+N" chip. */
export function avatarSizeClass(size: AvatarSize): string {
  return SIZE_CLASSES[size];
}

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

type AvatarProps = {
  /** Whose avatar: its initials, its colour (a hash of the name) and its title or `alt`. */
  name: string;
  /**
   * The person's photo, a local path. It replaces the initials and is announced as `name`. If it
   * fails to load, the initials show instead.
   */
  src?: string | undefined;
  /**
   * `xs` 16px, `sm` 24px, `md` 32px, `lg` 40px, `xl` 56px, `2xl` 64px or `3xl` 96px.
   * @default md
   */
  size?: AvatarSize;
  /**
   * `round` for a person; `square` (rounded corners) for an org or a team, so the two never read
   * as each other.
   * @default round
   */
  shape?: AvatarShape;
  /**
   * Makes the Avatar one button, named by `name`: a person who opens their profile or a menu.
   * Without it the Avatar is a plain mark.
   */
  onClick?: (() => void) | undefined;
} & Unstyled<Omit<HTMLAttributes<HTMLElement>, "children" | "onClick">>;

/**
 * A person as a round badge of initials, or as their photo when `src` is given; `shape="square"`
 * marks an org or a team instead. It never loads a remote image on its own: that is a request to
 * another server for decoration, and it makes a screenshot depend on the network. `src` is the
 * app's own local path. With `onClick` the whole Avatar is one button. A row of overlapping avatars
 * is an `AvatarStack`.
 */
export function Avatar(props: AvatarProps): ReactElement {
  return <AvatarMark {...props} />;
}

/** Avatar plus the stack's ring: internal, so the ring only ever comes from `AvatarStack`. */
export function AvatarMark({
  name,
  src,
  size = "md",
  shape = "round",
  ring = false,
  onError,
  onClick,
  ...rest
}: AvatarProps & { ring?: string | false }): ReactElement {
  const { ref, failed, markFailed } = useImageFailed(src);
  const corners = avatarShapeClass(shape, size);
  // As a button, the button takes the consumer's props and the mark inside keeps only its look.
  const markProps = onClick ? {} : rest;
  const mark =
    src && !failed ? (
      <img
        ref={ref}
        src={src}
        alt={name}
        title={name}
        className={cx("shrink-0 object-cover", corners, SIZE_CLASSES[size], ring)}
        onError={(event) => {
          onError?.(event);
          markFailed();
        }}
        {...markProps}
      />
    ) : (
      <span
        aria-hidden="true"
        title={name}
        className={cx(
          "inline-grid shrink-0 place-items-center font-semibold text-violet-50",
          corners,
          SIZE_CLASSES[size],
          avatarColourClass(name),
          ring,
        )}
        {...markProps}
      >
        {initialsOf(name)}
      </span>
    );
  if (!onClick) return mark;
  return (
    <button
      aria-label={name}
      {...rest}
      type="button"
      onClick={onClick}
      className={cx("inline-grid shrink-0 cursor-pointer", corners, focusRing)}
    >
      {mark}
    </button>
  );
}
