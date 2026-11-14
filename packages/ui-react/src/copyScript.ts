/**
 * JavaScript to inline once on a page that is rendered to static HTML and never hydrated, so every
 * `CopyButton` (and the `CopyLine`, `CodeBlock` and `CodeExample` copy buttons) works there too.
 * One click listener on `document` reads what to copy from the button's data attributes, writes the
 * clipboard, then does what `CopyButton` does: sets `data-copied` again after a reflow, so the CSS
 * that shows the copied label for two seconds starts over, and puts a new node holding the copied
 * label in the status region beside the button, so a screen reader hears each copy. No timer: the
 * label goes back when the animation ends, and its end clears `data-copied` (a second listener), so a
 * button hidden and shown again does not replay it. A refused or missing clipboard leaves it alone.
 * Whichever of the script and a hydrated button's own handler hears a click first copies and flags
 * the event (`copyHandled`), and the other skips it: one copy per click.
 */
export const copyScript: string = `document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-copy-text]"),c=navigator.clipboard;if(!b||!c||e.copyHandled||b.disabled)return;e.copyHandled=1;c.writeText(b.dataset.copyText).then(function(){var r=b.nextElementSibling;b.removeAttribute("data-copied");void b.offsetWidth;b.setAttribute("data-copied","");if(r&&r.matches("[data-copy-status]"))r.replaceChildren(b.dataset.copyCopied)},function(){})});document.addEventListener("animationend",function(e){var b=e.target.closest&&e.target.closest("[data-copied]");if(b)b.removeAttribute("data-copied")})`;
