/**
 * The classes on <html> (or `element`): the colour-scheme head script's contract, read and set
 * as data, not look. The one place the scheme tests touch classList.
 */
export function schemeClasses(element: Element = document.documentElement): {
  has: (name: string) => boolean;
  add: (...names: string[]) => void;
  remove: (...names: string[]) => void;
  list: () => string[];
} {
  const classes = element.classList;
  return {
    has: (name) => classes.contains(name),
    add: (...names) => classes.add(...names),
    remove: (...names) => classes.remove(...names),
    list: () => [...classes],
  };
}
