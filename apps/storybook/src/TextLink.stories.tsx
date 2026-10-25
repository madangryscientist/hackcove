import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextLink, type LinkRenderProps } from "@hackcove/ui";

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
      <p className="text-sm">
        <TextLink href="#small">Small link</TextLink>
      </p>
      <p className="text-base">
        <TextLink href="#base">Base link</TextLink>
      </p>
    </div>
  ),
};

export const SizeAndMono: S = {
  name: "size and mono",
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <TextLink href="#xs" size="xs">
        size xs
      </TextLink>
      <TextLink href="#sm" size="sm">
        size sm
      </TextLink>
      <TextLink href="#path" size="sm" mono>
        packages/ui/src/TextLink.tsx
      </TextLink>
    </div>
  ),
};

/** Stands in for a router's <Link to>: takes `to`, spreads the rest on an anchor. */
function FakeLink({ to, ...rest }: { to: string } & LinkRenderProps) {
  return <a href={`#${to}`} {...rest} />;
}

export const WithRouterLink: S = {
  render: () => <TextLink render={(p) => <FakeLink to="/terms" {...p} />}>Read the terms</TextLink>,
};

/** `stretch` covers the nearest `relative` ancestor, so the whole row is the click target. */
export const Stretch: S = {
  render: () => (
    <ul className="max-w-sm divide-y divide-slate-200 rounded-lg border border-slate-200 text-sm">
      {["Quote 12", "Quote 13", "Quote 14"].map((name) => (
        <li key={name} className="relative flex justify-between px-3 py-2 hover:bg-slate-50">
          <TextLink href={`#${name}`} stretch>
            {name}
          </TextLink>
          <span className="text-slate-500">draft</span>
        </li>
      ))}
    </ul>
  ),
};
