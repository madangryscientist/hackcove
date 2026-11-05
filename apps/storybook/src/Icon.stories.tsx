import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Caption, Icon, Stack, Text } from "@hackcove/ui-react";
import { iconIdeas, iconNames } from "./iconIdeas.js";

const meta: Meta = { title: "Actions/Icon" };
export default meta;
type S = StoryObj;

const flagIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path d="M4 2.75a.75.75 0 0 0-1.5 0v14.5a.75.75 0 0 0 1.5 0v-4.4l1.6-.4a6 6 0 0 1 4 .4 7.5 7.5 0 0 0 5 .5l1.3-.3a.75.75 0 0 0 .6-.7V3.6a.75.75 0 0 0-.9-.7l-1.3.3a6 6 0 0 1-4-.4 7.5 7.5 0 0 0-5-.5L4 2.6Z" />
  </svg>
);

/** `sm` (14px), `md` (16px, the default), `lg` (20px) and `feature` (32px). The `<svg>` fills the box. */
export const Sizes: S = {
  render: () => (
    <div className="flex items-center gap-4">
      {(["sm", "md", "lg", "feature"] as const).map((size) => (
        <Icon key={size} size={size}>
          {flagIcon}
        </Icon>
      ))}
    </div>
  ),
};

/** `name` picks an icon from the set: one grid, one stroke, round caps and joins, in `currentColor`. At `feature` size each reads as its idea with no label. */
export const Names: S = {
  render: () => (
    <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
      {iconNames.map((name) => (
        <div key={name} className="flex flex-col items-start gap-2">
          <Icon name={name} size="feature" tone="info" />
          <Text as="p" mono>
            {name}
          </Text>
          <Caption as="p">{iconIdeas[name]}</Caption>
        </div>
      ))}
    </div>
  ),
};

/** The set at each size, in the colour of the text around it: the strokes stay one weight, so a small icon is as legible as a large one. */
export const SetSizes: S = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(["sm", "md", "lg", "feature"] as const).map((size) => (
        <div key={size} className="flex items-center gap-4">
          {iconNames.map((name) => (
            <Icon key={name} name={name} size={size} />
          ))}
        </div>
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
      <Text as="p">
        <Icon tone="warn" label="Flaky">
          {flagIcon}
        </Icon>{" "}
        Dashboard
      </Text>
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
