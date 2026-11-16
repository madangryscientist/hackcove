import type { Meta, StoryObj } from "@storybook/react-vite";
import { Cluster, Pill, TextLink } from "@hackcove/ui-react";

const meta: Meta = { title: "Content/Pill" };
export default meta;
type S = StoryObj;

/** The tone carries the meaning: emerald for done, amber for waiting, red for failed, slate for neutral. */
export const DoStatus: S = {
  render: () => (
    <Cluster>
      <Pill tone="positive" dot>
        Paid
      </Pill>
      <Pill tone="warn" dot>
        Due
      </Pill>
      <Pill tone="danger" dot>
        Overdue
      </Pill>
      <Pill dot>Draft</Pill>
    </Cluster>
  ),
};

/** One tone for every status says nothing: a reader cannot tell Paid from Overdue at a glance. Pick the tone by what the status means. */
export const DontStatus: S = {
  render: () => (
    <Cluster>
      <Pill tone="accent" dot>
        Paid
      </Pill>
      <Pill tone="accent" dot>
        Due
      </Pill>
      <Pill tone="accent" dot>
        Overdue
      </Pill>
    </Cluster>
  ),
};

/** `title` is the native tooltip, for the detail a short label leaves out. It is not a place for anything a reader must see: touch screens and keyboards do not show it. */
export const WithTitle: S = {
  render: () => (
    <Cluster>
      <Pill tone="positive" dot title="Accepted on 12 Oct by Ada Lovelace">
        Accepted
      </Pill>
      <Pill href="#flakes" tone="warn" round title="3 stories changed between the last two builds">
        3 flaky
      </Pill>
    </Cluster>
  ),
};

/** A Pill that goes somewhere takes `href`: it dims on hover and carries the focus ring. */
export const DoLink: S = {
  render: () => (
    <Pill href="#flakes" tone="warn" round>
      3 flaky
    </Pill>
  ),
};

/** A Pill inside a `TextLink` is two parts doing one job, and the Pill's own hover dim and focus ring go unused. Give the Pill the `href`. */
export const DontLink: S = {
  render: () => (
    <TextLink href="#flakes">
      <Pill tone="warn" round>
        3 flaky
      </Pill>
    </TextLink>
  ),
};

/** `name` makes a two-tone `name: value` pill: the name keeps the tone's tint and the children, the value, sit on the surface beside it. Keep the name to a word or two. */
export const TwoTone: S = {
  render: () => (
    <Cluster>
      <Pill name="Weight">72 kg</Pill>
      <Pill name="Sleep" tone="info" round>
        7 h 20 min
      </Pill>
      <Pill name="Mood" tone="positive" dot>
        Good
      </Pill>
      <Pill name="Pain" tone="danger" href="#pain">
        3 / 10
      </Pill>
    </Cluster>
  ),
};

/** `onRemove` adds an x button after the text, named by `removeLabel`. On a link or button pill the x is a button beside it, not inside it. */
export const Removable: S = {
  render: () => (
    <Cluster>
      <Pill onRemove={() => undefined} removeLabel="Remove tag Urgent" tone="warn">
        Urgent
      </Pill>
      <Pill
        onClick={() => undefined}
        onRemove={() => undefined}
        removeLabel="Remove invoice.pdf"
        tone="info"
        round
      >
        invoice.pdf
      </Pill>
      <Pill href="#a" onRemove={() => undefined} removeLabel="Remove report.pdf" name="File">
        report.pdf
      </Pill>
    </Cluster>
  ),
};

/** `size` steps the text: `sm` for a dense row, `md` (the default), `lg` beside a heading. */
export const Sizes: S = {
  render: () => (
    <Cluster>
      <Pill size="sm" tone="positive">
        Paid
      </Pill>
      <Pill tone="positive">Paid</Pill>
      <Pill size="lg" tone="positive">
        Paid
      </Pill>
      <Pill size="sm" name="Weight">
        72 kg
      </Pill>
      <Pill size="lg" name="Weight">
        72 kg
      </Pill>
    </Cluster>
  ),
};
