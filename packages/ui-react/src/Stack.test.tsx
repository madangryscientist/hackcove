// @vitest-environment jsdom
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { render, screen, user, within } from "./render.harness.js";
import { Section, Stack } from "./Stack.js";

describe("Stack as", () => {
  it("renders a form that passes its form props through", () => {
    render(
      <Stack as="form" action="/save" method="post" noValidate aria-label="Save">
        x
      </Stack>,
    );
    const form = screen.getByRole<HTMLFormElement>("form", { name: "Save" });
    expect(form.getAttribute("action")).toBe("/save");
    expect(form.method).toBe("post");
    expect(form.noValidate).toBe(true);
  });

  it("a form calls its onSubmit", async () => {
    const onSubmit = vi.fn<(event: { preventDefault: () => void }) => void>((event) =>
      event.preventDefault(),
    );
    render(
      <Stack as="form" onSubmit={onSubmit} aria-label="Save">
        <button type="submit">Save</button>
      </Stack>,
    );
    await user().click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it.each(["ul", "ol"] as const)("renders a %s whose children are its items, unwrapped", (as) => {
    render(
      <Stack as={as} gap="sm" aria-label="Items">
        <li>a</li>
        <li>b</li>
      </Stack>,
    );
    const items = within(screen.getByRole("list", { name: "Items" })).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual(["a", "b"]);
  });

  it("keeps the element with rowFrom", () => {
    render(
      <Stack rowFrom="md" gap="lg" width="wide" as="ul" aria-label="Items">
        <li>x</li>
      </Stack>,
    );
    expect(screen.getByRole("list", { name: "Items" })).not.toBeNull();
  });

  it("is a closed set of elements", () => {
    type P = Parameters<typeof Stack>[0];
    expectTypeOf<NonNullable<P["as"]>>().toEqualTypeOf<"div" | "section" | "form" | "ul" | "ol">();
  });
});

describe("Section", () => {
  it("is a region named by its level-2 heading, with actions beside it", () => {
    render(
      <Section title="Recent" actions={<button type="button">All</button>}>
        body
      </Section>,
    );
    const region = screen.getByRole("region", { name: "Recent" });
    expect(within(region).getByRole("heading", { level: 2, name: "Recent" })).not.toBeNull();
    expect(within(region).getByRole("button", { name: "All" })).not.toBeNull();
    expect(within(region).getByText("body")).not.toBeNull();
  });

  it("has no heading and no name without a title", () => {
    render(<Section>body</Section>);
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.queryByRole("region")).toBeNull();
    expect(screen.getByText("body")).not.toBeNull();
  });

  it("keeps a consumer's aria-labelledby when it has no title of its own", () => {
    render(
      <>
        <h3 id="h">Mine</h3>
        <Section aria-labelledby="h">body</Section>
      </>,
    );
    expect(within(screen.getByRole("region", { name: "Mine" })).getByText("body")).not.toBeNull();
  });

  it("an `id` puts the anchor on the heading, and the section is named by it", () => {
    render(
      <Section id="usage" title="Usage">
        body
      </Section>,
    );
    const region = screen.getByRole("region", { name: "Usage" });
    expect(within(region).getByRole("heading", { name: "Usage" }).id).toBe("usage");
    expect(region.id).toBe("");
  });

  it("an `id` with no title puts nothing anywhere", () => {
    render(<Section id="usage">body</Section>);
    // The id is a link target, read as data: with no heading to carry it, no element has it.
    expect(document.getElementById("usage")).toBeNull();
    expect(screen.queryByRole("region")).toBeNull();
  });
});
