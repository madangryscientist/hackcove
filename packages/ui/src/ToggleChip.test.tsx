import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ToggleChip } from "./ToggleChip.js";

describe("ToggleChip", () => {
  it("sets aria-pressed from pressed", () => {
    expect(renderToStaticMarkup(<ToggleChip pressed>Charity</ToggleChip>)).toContain(
      'aria-pressed="true"',
    );
    expect(renderToStaticMarkup(<ToggleChip pressed={false}>Charity</ToggleChip>)).toContain(
      'aria-pressed="false"',
    );
  });

  it("is filled violet when pressed and white when not", () => {
    expect(renderToStaticMarkup(<ToggleChip pressed>Charity</ToggleChip>)).toContain(
      "bg-violet-600",
    );
    expect(renderToStaticMarkup(<ToggleChip pressed={false}>Charity</ToggleChip>)).toContain(
      "bg-white",
    );
  });

  it("renders a dot span with the given background colour", () => {
    const out = renderToStaticMarkup(
      <ToggleChip pressed={false} dot="#e11d48">
        Charity
      </ToggleChip>,
    );
    expect(out).toMatch(/<span[^>]*aria-hidden="true"[^>]*background-color:#e11d48/);
  });

  it("rings the dot when pressed so it shows on the violet accent", () => {
    const out = renderToStaticMarkup(
      <ToggleChip pressed dot="#e11d48">
        Vintage
      </ToggleChip>,
    );
    expect(out).toMatch(/<span[^>]*class="[^"]*ring-current[^"]*"/);
  });

  it("does not ring the dot when not pressed", () => {
    const out = renderToStaticMarkup(
      <ToggleChip pressed={false} dot="#e11d48">
        Vintage
      </ToggleChip>,
    );
    expect(out).not.toContain("ring-current");
  });

  it("renders no inner span without a dot", () => {
    const out = renderToStaticMarkup(<ToggleChip pressed={false}>Charity</ToggleChip>);
    expect(out.match(/<span/g)).toBeNull();
  });
});
