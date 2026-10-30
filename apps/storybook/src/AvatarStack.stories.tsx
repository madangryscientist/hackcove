import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarStack, Cluster, Stack } from "@hackcove/ui";
import { samplePhoto } from "./samplePhoto";

const meta: Meta = { title: "UI/AvatarStack" };
export default meta;
type S = StoryObj;

const team = [
  "Ada Lovelace",
  "Grace Hopper",
  "Linus Torvalds",
  "Margaret Hamilton",
  "Dennis Ritchie",
  "Ken Thompson",
  "Barbara Liskov",
].map((name) => ({ name }));

export const Default: S = {
  render: () => (
    <AvatarStack people={[{ name: "Jacobus Langner", src: samplePhoto }, ...team.slice(0, 3)]} />
  ),
};

/** `max` shows the first few and a "+N" chip for the rest; the chip's `title` names who it stands for. */
export const Overflow: S = {
  render: () => <AvatarStack people={team} max={3} />,
};

export const Sizes: S = {
  render: () => (
    <Stack gap="sm">
      {(["sm", "md", "lg", "xl", "2xl"] as const).map((size) => (
        <AvatarStack key={size} people={team} max={3} size={size} />
      ))}
    </Stack>
  ),
};

/** `shape="square"` for a stack of orgs or teams. */
export const Square: S = {
  render: () => (
    <AvatarStack
      people={["Hack Cove", "PixelSlash", "Omnibus", "Thrifty", "Quotes"].map((name) => ({ name }))}
      max={3}
      size="lg"
      shape="square"
    />
  ),
};

/** With many people, `max` keeps the row short and the "+N" says how many more there are. */
export const DoMax: S = {
  render: () => (
    <AvatarStack
      people={[
        { name: "Ada Lovelace" },
        { name: "Grace Hopper" },
        { name: "Linus Torvalds" },
        { name: "Margaret Hamilton" },
        { name: "Dennis Ritchie" },
        { name: "Ken Thompson" },
      ]}
      max={4}
    />
  ),
};

/** Avatars side by side are a row of separate marks: they take the width of the whole team and read as a list, not a group. */
export const DontMax: S = {
  render: () => (
    <Cluster gap="xs">
      <Avatar name="Ada Lovelace" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Linus Torvalds" />
      <Avatar name="Margaret Hamilton" />
      <Avatar name="Dennis Ritchie" />
      <Avatar name="Ken Thompson" />
    </Cluster>
  ),
};
