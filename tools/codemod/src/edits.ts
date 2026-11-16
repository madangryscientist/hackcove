/** One change to the source: the text from `start` to `end` becomes `text`. */
export type Edit = { start: number; end: number; text: string };

/** Whether `inner` lies inside `outer`, which replaces it: an element that is unwrapped or rewritten whole. */
const within = (inner: Edit, outer: Edit) =>
  inner !== outer &&
  outer.start < outer.end &&
  (inner.start === inner.end
    ? inner.start > outer.start && inner.end < outer.end
    : inner.start >= outer.start && inner.end <= outer.end);

/** The edits that apply, last first: duplicates and edits inside a bigger one dropped. */
function settled(edits: readonly Edit[]): Edit[] {
  const unique = [
    ...new Map(edits.map((edit) => [`${edit.start}:${edit.end}:${edit.text}`, edit])).values(),
  ];
  const kept = unique.filter((edit) => !unique.some((outer) => within(edit, outer)));
  return kept.toSorted((a, b) => b.start - a.start || b.end - a.end);
}

/** Where `offset` in the source lands once the edits apply; inside a replaced span, its start. */
export function moved(edits: readonly Edit[], offset: number): number {
  let at = offset;
  for (const edit of settled(edits)) {
    if (edit.end <= offset) at += edit.text.length - (edit.end - edit.start);
    else if (edit.start < offset) at = edit.start;
  }
  return at;
}

/**
 * The source with every edit applied. An edit inside a bigger one is dropped, since the bigger one
 * replaces that text; two that overlap only in part are a bug in a rule, so they throw.
 */
export function applyEdits(source: string, edits: readonly Edit[]): string {
  let out = source;
  let floor = Number.POSITIVE_INFINITY;
  for (const edit of settled(edits)) {
    if (edit.end > floor) throw new Error(`two edits overlap at ${edit.start}`);
    out = out.slice(0, edit.start) + edit.text + out.slice(edit.end);
    floor = edit.start;
  }
  return out;
}
