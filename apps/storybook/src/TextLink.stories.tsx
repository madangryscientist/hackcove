import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextLink } from "@hackcove/ui";

const meta: Meta = { title: "UI/TextLink" };
export default meta;
type S = StoryObj;

export const InText: S = {
  render: () => (
    <p className="max-w-xl text-sm text-slate-700">
      Questions? Email <TextLink href="mailto:hello@example.com">hello@example.com</TextLink>, or
      read the <TextLink href="#terms">terms</TextLink> first.
    </p>
  ),
};

export const External: S = {
  render: () => (
    <TextLink href="https://example.com" external>
      example.com
    </TextLink>
  ),
};

export const Sizes: S = {
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <TextLink href="#small" className="text-sm">
        Small link
      </TextLink>
      <TextLink href="#base" className="text-base">
        Base link
      </TextLink>
    </div>
  ),
};
