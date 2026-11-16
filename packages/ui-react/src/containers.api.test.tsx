// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { Card } from "./Card.js";
import { Dialog } from "./Dialog.js";
import { stubDialog } from "./dom.harness.js";
import { Drawer } from "./Drawer.js";
import { EmptyState } from "./EmptyState.js";
import { ListRow } from "./ListRow.js";
import { render, screen, user } from "./render.harness.js";
import { SiteSearch } from "./SiteSearch.js";
import { Section } from "./Stack.js";

// What a container sets for what sits in it: the root a card takes from its title, the heading
// level from the heading that holds it, and a row's form from what it does.

beforeEach(stubDialog);

describe("a ListRow's form comes from what it does", () => {
  it("is no button or link with no href and no onClick", () => {
    render(<ListRow trailing="R 640">Household</ListRow>);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("Household")).not.toBeNull();
  });

  it("is a button with onClick", () => {
    render(<ListRow onClick={() => undefined}>Household</ListRow>);
    expect(screen.getByRole("button", { name: "Household" })).not.toBeNull();
  });

  it("draws its panel under the row's line", () => {
    render(<ListRow panel={<p>The thread</p>}>Chat</ListRow>);
    expect(screen.getByText("The thread")).not.toBeNull();
  });
});

describe("a Card's root comes from its title", () => {
  it("an untitled card is no region", () => {
    render(<Card>body</Card>);
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("a titled card is a region named by its title", () => {
    render(<Card title="Billing">body</Card>);
    expect(screen.getByRole("region", { name: "Billing" })).not.toBeNull();
  });
});

describe("a heading's level comes from the heading that holds it", () => {
  it("a Card on the page has a heading of level 2", () => {
    render(<Card title="Billing">body</Card>);
    expect(screen.getByRole("heading", { name: "Billing", level: 2 })).not.toBeNull();
  });

  it("a Card in a Section has a heading of level 3, under the section's 2", () => {
    render(
      <Section title="Accounts">
        <Card title="Billing">body</Card>
      </Section>,
    );
    expect(screen.getByRole("heading", { name: "Accounts", level: 2 })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Billing", level: 3 })).not.toBeNull();
  });

  it("an EmptyState in that Card is a 4", () => {
    render(
      <Section title="Accounts">
        <Card title="Billing">
          <EmptyState title="No invoices yet" />
        </Card>
      </Section>,
    );
    expect(screen.getByRole("heading", { name: "No invoices yet", level: 4 })).not.toBeNull();
  });

  it("an untitled Card adds no level", () => {
    render(
      <Section title="Accounts">
        <Card>
          <EmptyState title="No invoices yet" />
        </Card>
      </Section>,
    );
    expect(screen.getByRole("heading", { name: "No invoices yet", level: 3 })).not.toBeNull();
  });

  it("an untitled Section adds no level", () => {
    render(
      <Section aria-label="Accounts">
        <Card title="Billing">body</Card>
      </Section>,
    );
    expect(screen.getByRole("heading", { name: "Billing", level: 2 })).not.toBeNull();
  });

  it("level sets it by hand, and what is inside follows it", () => {
    render(
      <Card title="Billing" level={4}>
        <EmptyState title="No invoices yet" />
      </Card>,
    );
    expect(screen.getByRole("heading", { name: "Billing", level: 4 })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "No invoices yet", level: 5 })).not.toBeNull();
  });

  it("a Card in a Dialog is one below the dialog's title", () => {
    render(
      <Dialog title="Accounts" onClose={() => undefined}>
        <Card title="Billing">body</Card>
      </Dialog>,
    );
    expect(screen.getByRole("heading", { name: "Billing", level: 3 })).not.toBeNull();
  });
});

describe("the built-in words and lines", () => {
  it("resultsLabel names a SiteSearch's list of matches", async () => {
    render(
      <SiteSearch
        label="Zoek"
        resultsLabel="Uitslae"
        items={[{ label: "Card", href: "/card", description: "A panel" }]}
      />,
    );
    const person = user();
    await person.keyboard("{Control>}k{/Control}");
    await person.type(screen.getByRole("searchbox", { name: "Zoek" }), "Card");
    expect(screen.getByRole("list", { name: "Uitslae" })).not.toBeNull();
  });

  it("a Drawer shows its description under the title", () => {
    render(
      <Drawer title="Invoice" description="Due on the 1st" onClose={() => undefined}>
        body
      </Drawer>,
    );
    expect(screen.getByRole("dialog", { name: "Invoice" })).not.toBeNull();
    expect(screen.getByText("Due on the 1st")).not.toBeNull();
  });
});
