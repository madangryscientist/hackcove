import type { ReactElement } from "react";
import {
  AvatarMark,
  avatarShapeClass,
  avatarSizeClass,
  type AvatarShape,
  type AvatarSize,
} from "./Avatar.js";
import { cx } from "./cx.js";
import type { Passthrough } from "./props.js";

// Each avatar after the first overlaps the one before it by about a quarter of its width.
const OVERLAP: Record<AvatarSize, string> = {
  sm: "-ml-1.5",
  md: "-ml-2",
  lg: "-ml-2.5",
  xl: "-ml-3.5",
  "2xl": "-ml-6",
};

// The ring in the page colour that keeps two overlapping avatars apart.
const RING = "border-2 border-slate-50";

/** One member of an `AvatarStack`: the same `name` and optional local `src` an `Avatar` takes. */
export type AvatarStackPerson = { name: string; src?: string | undefined };

/**
 * Members as a row of overlapping avatars, each in a ring in the page colour that separates it from
 * the next. With `max`, the first `max` show and a "+N" chip of the same size and shape stands for
 * the rest. The row is one image to assistive tech, named by the people in it.
 */
export function AvatarStack({
  people,
  max,
  size = "md",
  shape = "round",
  ...rest
}: {
  /** Who is in the stack, in order. Give each person's full name, as for `Avatar`. */
  people: readonly AvatarStackPerson[];
  /** How many avatars show before a "+N" chip takes the rest. Without it every person shows. */
  max?: number | undefined;
  /**
   * The size of every avatar and of the chip, as `Avatar`'s `size`.
   * @default md
   */
  size?: AvatarSize;
  /**
   * `square` for a stack of orgs or teams, as `Avatar`'s `shape`.
   * @default round
   */
  shape?: AvatarShape;
} & Passthrough): ReactElement {
  const shown = max === undefined ? people : people.slice(0, Math.max(max, 0));
  const hidden = people.slice(shown.length);
  const overlap = OVERLAP[size];
  const names = shown.map((person) => person.name);
  const label =
    hidden.length > 0 ? `${names.join(", ")} and ${hidden.length} more` : names.join(", ");
  return (
    <span role="img" aria-label={label} className="inline-flex items-center" {...rest}>
      {shown.map((person, index) => (
        <AvatarMark
          key={`${index}:${person.name}`}
          name={person.name}
          src={person.src}
          size={size}
          shape={shape}
          ring={cx(RING, index > 0 && overlap)}
        />
      ))}
      {hidden.length > 0 && (
        <span
          aria-hidden="true"
          title={hidden.map((person) => person.name).join(", ")}
          className={cx(
            "inline-grid shrink-0 place-items-center bg-slate-100 font-semibold text-slate-700 tabular-nums",
            RING,
            avatarSizeClass(size),
            avatarShapeClass(shape, size),
            shown.length > 0 && overlap,
          )}
        >
          +{hidden.length}
        </span>
      )}
    </span>
  );
}
