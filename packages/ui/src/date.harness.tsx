import { act } from "react";

export const segmentsOf = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>('[role="spinbutton"]'));

/** Type into the focused segment the way a browser does: one `beforeinput` per character. */
export function type(first: HTMLElement, text: string): void {
  act(() => first.focus());
  for (const data of text) {
    const target = document.activeElement ?? first;
    act(() => {
      target.dispatchEvent(
        new InputEvent("beforeinput", {
          data,
          inputType: "insertText",
          bubbles: true,
          cancelable: true,
        }),
      );
    });
  }
}

/** Tab out: native validation shows a min/max error once the field is left. */
export function leave(): void {
  const active = document.activeElement;
  if (active instanceof HTMLElement) act(() => active.blur());
}

export const textOf = (container: HTMLElement): string[] =>
  segmentsOf(container).map((s) => s.textContent ?? "");

export const posted = (container: HTMLElement): string | undefined =>
  container.querySelector<HTMLInputElement>('input[name="dob"]')?.value;

export const errorOf = (container: HTMLElement): string =>
  container.querySelector('[slot="errorMessage"]')?.textContent ?? "";
