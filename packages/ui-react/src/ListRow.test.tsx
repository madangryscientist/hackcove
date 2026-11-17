// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { ListRow } from "./ListRow.js";
import { follows, render, screen, user } from "./render.harness.js";

const noop = () => undefined;

describe("ListRow", () => {
  it("is a button named by its label, the trailing content after it, and not a collapsible header", async () => {
    const onClick = vi.fn<() => void>();
    render(
      <ListRow trailing="R 4 250" onClick={onClick}>
        Rent
      </ListRow>,
    );
    const button = screen.getByRole("button", { name: "Rent" });
    expect(button.hasAttribute("aria-expanded")).toBe(false);
    expect(follows(screen.getByText("Rent"), screen.getByText("R 4 250"))).toBeTruthy();
    await user().click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("passes button props through to its button", () => {
    render(
      <ListRow onClick={noop} disabled aria-controls="rows">
        Rent
      </ListRow>,
    );
    const button = screen.getByRole("button", { name: "Rent" });
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.getAttribute("aria-controls")).toBe("rows");
  });

  it("expanded makes it a collapsible header with aria-expanded", () => {
    render(
      <>
        <ListRow onClick={noop} expanded={false}>
          Closed
        </ListRow>
        <ListRow onClick={noop} expanded>
          Open
        </ListRow>
      </>,
    );
    expect(screen.getByRole("button", { name: "Closed" }).getAttribute("aria-expanded")).toBe(
      "false",
    );
    expect(screen.getByRole("button", { name: "Open" }).getAttribute("aria-expanded")).toBe("true");
  });

  it("is a link with href, named by its row, and no button", () => {
    render(
      <ListRow href="/status" trailing="3">
        Status
      </ListRow>,
    );
    expect(screen.getByRole("link", { name: "Status 3" }).getAttribute("href")).toBe("/status");
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("ListRow leading and selected", () => {
  it("reads leading before the label, on a button and a link alike", () => {
    render(
      <>
        <ListRow onClick={noop} leading="B">
          Button row
        </ListRow>
        <ListRow href="#a" leading="L">
          Link row
        </ListRow>
      </>,
    );
    expect(follows(screen.getByText("B"), screen.getByText("Button row"))).toBeTruthy();
    expect(follows(screen.getByText("L"), screen.getByText("Link row"))).toBeTruthy();
  });

  it("selected sets aria-current on the button, the link and a static row", () => {
    render(
      <>
        <ListRow onClick={noop} selected>
          Button row
        </ListRow>
        <ListRow selected href="#a">
          Link row
        </ListRow>
        <ListRow selected aria-label="Static row">
          a
        </ListRow>
      </>,
    );
    expect(screen.getByRole("button", { name: "Button row" }).getAttribute("aria-current")).toBe(
      "true",
    );
    expect(screen.getByRole("link", { name: "Link row" }).getAttribute("aria-current")).toBe(
      "true",
    );
    expect(screen.getByLabelText("Static row").getAttribute("aria-current")).toBe("true");
  });

  it("is not current unless selected", () => {
    render(<ListRow onClick={noop}>Rent</ListRow>);
    expect(screen.getByRole("button", { name: "Rent" }).hasAttribute("aria-current")).toBe(false);
  });
});

describe("ListRow with no href or onClick", () => {
  it("is neither a button nor a link, and reads leading, label, trailing, then actions", () => {
    render(
      <ListRow leading="L" trailing="admin" actions={<button type="button">Remove</button>}>
        Ada
      </ListRow>,
    );
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["Remove"]);
    expect(screen.queryByRole("link")).toBeNull();
    expect(follows(screen.getByText("L"), screen.getByText("Ada"))).toBeTruthy();
    expect(follows(screen.getByText("Ada"), screen.getByText("admin"))).toBeTruthy();
    expect(
      follows(screen.getByText("admin"), screen.getByRole("button", { name: "Remove" })),
    ).toBeTruthy();
  });
});

describe("ListRow label", () => {
  it("is a div, so a div or a paragraph inside it is valid HTML", () => {
    render(
      <ListRow onClick={noop}>
        <p>Name</p>
      </ListRow>,
    );
    // The button is named by the label element it points at; its tag is the nesting contract.
    const labelId = String(
      screen.getByRole("button", { name: "Name" }).getAttribute("aria-labelledby"),
    );
    expect(document.getElementById(labelId)?.tagName).toBe("DIV");
  });
});

describe("ListRow secondary", () => {
  it("reads a second line after the label, inside the button's name", () => {
    render(
      <ListRow onClick={noop} secondary="Due 1 Dec">
        Rent
      </ListRow>,
    );
    expect(follows(screen.getByText("Rent"), screen.getByText("Due 1 Dec"))).toBeTruthy();
    expect(screen.getByRole("button", { name: "Rent Due 1 Dec" })).not.toBeNull();
  });

  it("works on a link row and a static row, and draws a zero", () => {
    render(
      <>
        <ListRow href="/rent" secondary="Due">
          Rent
        </ListRow>
        <ListRow secondary={0}>Water</ListRow>
      </>,
    );
    expect(screen.getByRole("link", { name: "Rent Due" })).not.toBeNull();
    expect(follows(screen.getByText("Water"), screen.getByText("0"))).toBeTruthy();
  });
});
