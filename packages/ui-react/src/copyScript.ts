/**
 * JavaScript to inline once on a page that is rendered to static HTML and never hydrated, so every
 * `CopyButton` (and the `CopyLine`, `CodeBlock` and `CodeExample` copy buttons) works there too.
 * One click listener on `document` reads what to copy and the two labels from the button's data
 * attributes, writes the clipboard, swaps the label for two seconds and puts it back, as
 * `CopyButton` does. A refused or missing clipboard leaves the label alone. Whichever of the
 * script and a hydrated button's own handler hears a click first copies and flags the event
 * (`copyHandled`), and the other skips it: one copy per click.
 */
export const copyScript: string = `document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-copy-text]"),c=navigator.clipboard;if(!b||!c||e.copyHandled||b.disabled)return;e.copyHandled=1;c.writeText(b.dataset.copyText).then(function(){clearTimeout(b.t);b.textContent=b.dataset.copyCopied;b.t=setTimeout(function(){b.textContent=b.dataset.copyLabel},2000)},function(){})})`;
