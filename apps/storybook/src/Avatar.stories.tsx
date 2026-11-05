import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, Cluster, Text } from "@hackcove/ui-react";
import { samplePhoto } from "./samplePhoto";

const meta: Meta = { title: "Content/Avatar" };
export default meta;
type S = StoryObj;

const names = ["ada", "grace", "linus", "margaret", "dennis", "ken", "barbara", "alan", "?"];

export const Colours: S = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {names.map((name) => (
        <Avatar key={name} name={name} />
      ))}
    </div>
  ),
};

export const Sizes: S = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar name="octocat" size="xs" />
      <Avatar name="octocat" size="sm" />
      <Avatar name="octocat" size="md" />
      <Avatar name="octocat" size="lg" />
      <Avatar name="octocat" size="xl" />
      <Avatar name="octocat" size="2xl" />
      <Avatar name="octocat" size="3xl" />
    </div>
  ),
};

/** `xs` is 16px, for an inline mention in a line of text, such as a chat message's sender. */
export const Inline: S = {
  render: () => (
    <p className="flex items-center gap-1.5">
      <Avatar name="Ada Lovelace" size="xs" />
      <span>Ada Lovelace replied to the thread</span>
    </p>
  ),
};

/** When `src` fails to load the initials show instead, so a missing photo never leaves a broken-image icon. */
export const PhotoFails: S = {
  render: () => (
    <div className="flex items-center gap-3">
      {(["xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const).map((size) => (
        <Avatar key={size} name="Ada Lovelace" src="/missing/ada.jpg" size={size} />
      ))}
    </div>
  ),
};

/** `shape="square"` for an org, a team or a project: rounded corners that scale with the size. */
export const Square: S = {
  render: () => (
    <div className="flex items-center gap-3">
      {(["sm", "md", "lg", "xl", "2xl", "3xl"] as const).map((size) => (
        <Avatar key={size} name="Hack Cove" shape="square" size={size} />
      ))}
      <Avatar name="Jacobus Langner" src={samplePhoto} shape="square" size="xl" />
    </div>
  ),
};

export const Photo: S = {
  render: () => (
    <div className="flex items-center gap-3">
      {(["md", "lg", "xl", "2xl", "3xl"] as const).map((size) => (
        <Avatar key={size} name="Jacobus Langner" src={samplePhoto} size={size} />
      ))}
    </div>
  ),
};

/** `onClick` makes the whole Avatar one button, named by `name`: an account menu, a profile. It keeps its shape and size, with a focus ring. */
export const Interactive: S = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar name="Ada Lovelace" size="2xl" onClick={() => undefined} />
      <Avatar name="Ada Lovelace" size="2xl" src={samplePhoto} onClick={() => undefined} />
      <Avatar name="Hack Cove" size="2xl" shape="square" onClick={() => undefined} />
      <Avatar name="Ada Lovelace" size="sm" onClick={() => undefined} />
    </div>
  ),
};

/** Give the person's full name every time: the same name gets the same colour and initials in every list and header. */
export const DoIdentity: S = {
  render: () => (
    <Cluster>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Ada Lovelace" size="lg" />
      <Avatar name="Grace Hopper" />
    </Cluster>
  ),
};

/** The colour comes from the name, so "Ada" in one place and "A. Lovelace" in another read as two different people. */
export const DontIdentity: S = {
  render: () => (
    <Cluster>
      <Avatar name="Ada" />
      <Avatar name="A. Lovelace" />
    </Cluster>
  ),
};

/** The initials are hidden from a screen reader, so the person's name sits beside the Avatar as text. */
export const DoBeside: S = {
  render: () => (
    <Cluster>
      <Avatar name="Ada Lovelace" />
      <Text strong>Ada Lovelace</Text>
    </Cluster>
  ),
};

/** An initials Avatar on its own is `aria-hidden`: it names no one to a screen reader. Put the name beside it. */
export const DontBeside: S = {
  render: () => <Avatar name="Ada Lovelace" />,
};
