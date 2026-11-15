// @vitest-environment jsdom
import type { MouseEvent, ReactElement, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShellBrand } from "./AppShell.js";
import { Avatar } from "./Avatar.js";
import { Breadcrumbs } from "./Breadcrumbs.js";
import { Button } from "./Button.js";
import { Card } from "./Card.js";
import { stubDialog } from "./dom.harness.js";
import { IconButton } from "./IconButton.js";
import { type LinkAdapterProps, LinkProvider } from "./link.js";
import { ListRow } from "./ListRow.js";
import { MediaTile } from "./MediaTile.js";
import { Pill } from "./Pill.js";
import { render, screen, user } from "./render.harness.js";
import { SegmentedControl } from "./SegmentedControl.js";
import { SiteSearch } from "./SiteSearch.js";
import { NotFound } from "./StatusPages.js";
import { Tabs } from "./Tabs.js";
import { TextLink } from "./TextLink.js";

beforeEach(stubDialog);

type Part = {
  /** The part, linking to `/to`. */
  ui: ReactElement;
  /** The accessible name of its link. */
  name: string | RegExp;
  /** What a person does first to show the link (open the search, type a query). */
  reveal?: () => Promise<void>;
};

const PARTS: Array<[string, Part]> = [
  ["Button", { ui: <Button href="/to">Quotes</Button>, name: "Quotes" }],
  [
    "IconButton",
    {
      ui: <IconButton href="/to" label="Settings" icon="close" />,
      name: "Settings",
    },
  ],
  ["TextLink", { ui: <TextLink href="/to">Terms</TextLink>, name: "Terms" }],
  ["Pill", { ui: <Pill href="/to">flaky</Pill>, name: "flaky" }],
  [
    "Card",
    {
      ui: (
        <Card href="/to" title="Shot">
          body
        </Card>
      ),
      name: /Shot/,
    },
  ],
  ["ListRow", { ui: <ListRow href="/to">Quote 12</ListRow>, name: "Quote 12" }],
  [
    "a Tabs link item",
    {
      ui: <Tabs label="Views" items={[{ label: "Shots", href: "/to", active: true }]} />,
      name: "Shots",
    },
  ],
  [
    "a SegmentedControl link item",
    {
      ui: <SegmentedControl label="Range" items={[{ label: "Week", href: "/to", active: true }]} />,
      name: "Week",
    },
  ],
  [
    "a Breadcrumbs crumb",
    { ui: <Breadcrumbs crumbs={[{ label: "Quotes", href: "/to" }, "Quote 12"]} />, name: "Quotes" },
  ],
  ["AppShellBrand", { ui: <AppShellBrand label="Hack Cove" href="/to" />, name: "Hack Cove" }],
  [
    "a SiteSearch result",
    {
      ui: (
        <SiteSearch
          label="Search"
          items={[{ label: "Dialog", description: "A modal.", href: "/to" }]}
        />
      ),
      name: /Dialog/,
      reveal: async () => {
        const [trigger] = screen.getAllByRole("button", { name: "Search" });
        if (trigger === undefined) throw new Error("no trigger");
        await user().click(trigger);
        await user().type(screen.getByRole("searchbox"), "Dia");
      },
    },
  ],
  ["MediaTile href", { ui: <MediaTile href="/to" alt="A red chair" />, name: /A red chair/ }],
  ["Avatar href", { ui: <Avatar href="/to" name="Ada Lovelace" />, name: "Ada Lovelace" }],
  [
    "a status page's home link",
    {
      ui: (
        <LinkProvider home="/to">
          <NotFound />
        </LinkProvider>
      ),
      name: "Back to home",
    },
  ],
];

/** A router stand-in: it draws an <a> that navigates by calling `navigate` and stops the load. */
function routed(navigate: (href: string) => void) {
  return function RouterLink({ href, ...rest }: LinkAdapterProps): ReactNode {
    return (
      <a
        {...rest}
        href={href}
        onClick={(event) => {
          event.preventDefault();
          navigate(href);
        }}
      />
    );
  };
}

describe("LinkProvider", () => {
  it.each(PARTS)("%s navigates through the app's adapter", async (_part, { ui, name, reveal }) => {
    const navigate = vi.fn<(href: string) => void>();
    render(<LinkProvider link={routed(navigate)}>{ui}</LinkProvider>);
    await reveal?.();
    await user().click(screen.getByRole("link", { name }));
    expect(navigate).toHaveBeenCalledWith("/to");
  });

  it.each(PARTS)(
    "%s is a plain link to its href with no provider",
    async (_part, { ui, name, reveal }) => {
      render(ui);
      await reveal?.();
      expect(screen.getByRole("link", { name }).getAttribute("href")).toBe("/to");
    },
  );

  it.each([
    ["external", "/to", true],
    ["https:", "https://example.com/to", false],
    ["mailto:", "mailto:a@example.com", false],
  ])("never hands the adapter an %s link", async (_kind, href, external) => {
    const navigate = vi.fn<(href: string) => void>();
    render(
      <LinkProvider link={routed(navigate)}>
        <Button href={href} external={external}>
          Docs
        </Button>
      </LinkProvider>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    link.addEventListener("click", (event) => event.preventDefault());
    await user().click(link);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("opens an external link in a new tab", () => {
    render(
      <LinkProvider link={routed(vi.fn<(href: string) => void>())}>
        <Button href="/to" external>
          Docs
        </Button>
      </LinkProvider>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noreferrer");
  });

  it("hands the current Tabs link item aria-current, and a data-testid reaches the adapter", () => {
    render(
      <LinkProvider link={routed(vi.fn<(href: string) => void>())}>
        <Tabs
          label="Views"
          items={[
            { label: "Shots", href: "/shots", active: true, "data-testid": "shots-tab" },
            { label: "Builds", href: "/builds" },
          ]}
        />
        <Button href="/quotes" data-testid="quotes">
          Quotes
        </Button>
      </LinkProvider>,
    );
    expect(screen.getByRole("link", { name: "Shots" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Builds" }).hasAttribute("aria-current")).toBe(false);
    expect(screen.getByTestId("shots-tab").getAttribute("href")).toBe("/shots");
    expect(screen.getByTestId("quotes").getAttribute("href")).toBe("/quotes");
  });
});

describe("MediaTile and Avatar", () => {
  it("are one button with onClick, and the handler gets the click", async () => {
    const tile = vi.fn<(event: MouseEvent<HTMLButtonElement>) => void>();
    const avatar = vi.fn<(event: MouseEvent<HTMLButtonElement>) => void>();
    render(
      <>
        <MediaTile onClick={tile} alt="A red chair" />
        <Avatar onClick={avatar} name="Ada Lovelace" />
      </>,
    );
    await user().click(screen.getByRole("button", { name: /A red chair/ }));
    await user().click(screen.getByRole("button", { name: "Ada Lovelace" }));
    expect(tile.mock.calls[0]?.[0]).toHaveProperty("type", "click");
    expect(avatar.mock.calls[0]?.[0]).toHaveProperty("type", "click");
    expect(screen.queryByRole("link")).toBeNull();
  });
});
