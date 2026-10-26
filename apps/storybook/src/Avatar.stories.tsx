import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, BodyStrong, Cluster } from "@hackcove/ui";
import { samplePhoto } from "./samplePhoto";

const meta: Meta = { title: "UI/Avatar" };
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
      <Avatar name="octocat" size="sm" />
      <Avatar name="octocat" size="md" />
      <Avatar name="octocat" size="lg" />
      <Avatar name="octocat" size="xl" />
      <Avatar name="octocat" size="2xl" />
    </div>
  ),
};

export const RingedStack: S = {
  render: () => (
    <div className="flex bg-slate-50 p-4">
      {["ada", "grace", "linus", "margaret"].map((name) => (
        <Avatar key={name} name={name} ring />
      ))}
    </div>
  ),
};

export const Photo: S = {
  render: () => (
    <div className="flex items-center gap-3">
      {(["md", "lg", "xl", "2xl"] as const).map((size) => (
        <Avatar key={size} name="Jacobus Langner" src={samplePhoto} size={size} />
      ))}
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
      <BodyStrong>Ada Lovelace</BodyStrong>
    </Cluster>
  ),
};

/** An initials Avatar on its own is `aria-hidden`: it names no one to a screen reader. Put the name beside it. */
export const DontBeside: S = {
  render: () => <Avatar name="Ada Lovelace" />,
};
