import { cleanup } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach } from "vitest";

// The one way a component test renders and acts: Testing Library's `render` into jsdom, found by
// role, label or text through `screen`, driven by `user()` the way a person types and clicks.
// `fireEvent` is for an event no person makes (an image's `error`, `animationend`, a resize), with a
// comment saying so. Import it in a file that runs under `// @vitest-environment jsdom`.

export { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";

afterEach(cleanup);

/** A user to drive the page: `await user().click(screen.getByRole("button", { name: "Save" }))`. */
export function user(): UserEvent {
  return userEvent.setup();
}

/** Whether `b` comes after `a` in the document: reading order, the way a screen reader meets them. */
export function follows(a: Node, b: Node): boolean {
  return (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
}
