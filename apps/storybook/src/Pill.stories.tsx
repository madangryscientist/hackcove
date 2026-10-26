import type { Meta, StoryObj } from "@storybook/react-vite";
import { Cluster, Pill, TextLink } from "@hackcove/ui";

const meta: Meta = { title: "UI/Pill" };
export default meta;
type S = StoryObj;

/** The tone carries the meaning: emerald for done, amber for waiting, red for failed, slate for neutral. */
export const DoStatus: S = {
  render: () => (
    <Cluster>
      <Pill tone="emerald" dot>
        Paid
      </Pill>
      <Pill tone="amber" dot>
        Due
      </Pill>
      <Pill tone="red" dot>
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
      <Pill tone="violet" dot>
        Paid
      </Pill>
      <Pill tone="violet" dot>
        Due
      </Pill>
      <Pill tone="violet" dot>
        Overdue
      </Pill>
    </Cluster>
  ),
};

/** A Pill that goes somewhere takes `href`: it dims on hover and carries the focus ring. */
export const DoLink: S = {
  render: () => (
    <Pill href="#flakes" tone="amber" round>
      3 flaky
    </Pill>
  ),
};

/** A Pill inside a `TextLink` is two parts doing one job, and the Pill's own hover dim and focus ring go unused. Give the Pill the `href`. */
export const DontLink: S = {
  render: () => (
    <TextLink href="#flakes">
      <Pill tone="amber" round>
        3 flaky
      </Pill>
    </TextLink>
  ),
};
