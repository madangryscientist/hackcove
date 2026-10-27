import type { Meta, StoryObj } from "@storybook/react-vite";
import { Body, Button, Icon, Stack } from "@hackcove/ui";

const meta: Meta = { title: "UI/Icon" };
export default meta;
type S = StoryObj;

const flagIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path d="M4 2.75a.75.75 0 0 0-1.5 0v14.5a.75.75 0 0 0 1.5 0v-4.4l1.6-.4a6 6 0 0 1 4 .4 7.5 7.5 0 0 0 5 .5l1.3-.3a.75.75 0 0 0 .6-.7V3.6a.75.75 0 0 0-.9-.7l-1.3.3a6 6 0 0 1-4-.4 7.5 7.5 0 0 0-5-.5L4 2.6Z" />
  </svg>
);

/** `sm` (14px), `md` (16px, the default) and `lg` (20px). The `<svg>` fills the box. */
export const Sizes: S = {
  render: () => (
    <div className="flex items-center gap-4">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Icon key={size} size={size}>
          {flagIcon}
        </Icon>
      ))}
    </div>
  ),
};

/** `tone` is a text tone; `inherit` (the default) takes the colour of the text around it. */
export const Tones: S = {
  render: () => (
    <div className="flex items-center gap-4">
      {(["inherit", "muted", "positive", "warn", "danger", "info"] as const).map((tone) => (
        <Icon key={tone} tone={tone}>
          {flagIcon}
        </Icon>
      ))}
    </div>
  ),
};

/** An icon is decorative (`aria-hidden`) unless it carries meaning alone: then `label` makes it an image with that name. */
export const Label: S = {
  render: () => (
    <Stack gap="sm">
      <Body as="p">
        <Icon tone="warn" label="Flaky">
          {flagIcon}
        </Icon>{" "}
        Dashboard
      </Body>
    </Stack>
  ),
};

/** A bare `<svg>` goes in an `Icon`, which sizes and tones it, and a Button beside text needs nothing more. */
export const DoIcon: S = {
  render: () => (
    <Button variant="outline">
      <Icon>
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 6.5h3l1.5-2h5L14 6.5h3v9H3Z" strokeLinejoin="round" />
          <circle cx="10" cy="11" r="2.75" />
        </svg>
      </Icon>
      Capture
    </Button>
  ),
};

/** A bare `<svg>` with its own size and colour is a one-off: each one picks its own size and colour, and none follows the theme's muted text. */
export const DontIcon: S = {
  render: () => (
    <Button variant="outline">
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="#5ec8ff"
        strokeWidth="1.6"
        width="18"
        height="18"
      >
        <path d="M3 6.5h3l1.5-2h5L14 6.5h3v9H3Z" strokeLinejoin="round" />
        <circle cx="10" cy="11" r="2.75" />
      </svg>
      Capture
    </Button>
  ),
};
