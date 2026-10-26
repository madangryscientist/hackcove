import type { Meta, StoryObj } from "@storybook/react-vite";
import { Body, Card, TextLink, type LinkRenderProps } from "@hackcove/ui";

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

/** `tone` gives the link a meaning's colour (the `TextTone` names), underlined on hover. */
export const Tones: S = {
  render: () => (
    <p className="max-w-xl text-sm text-slate-700">
      <TextLink href="#skipped" tone="warn">
        3 skipped as flaky
      </TextLink>
      {" · "}
      <TextLink href="#ok" tone="positive">
        All passed
      </TextLink>
      {" · "}
      <TextLink href="#failed" tone="danger">
        2 failed
      </TextLink>
      {" · "}
      <TextLink href="#info" tone="info">
        What changed
      </TextLink>
      {" · "}
      <TextLink href="#muted" tone="muted">
        Details
      </TextLink>
    </p>
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

/** A link in running text is a `TextLink` inside a `Body`. */
export const DoInSentence: S = {
  render: () => (
    <Body as="p">
      Questions? Email <TextLink href="mailto:hello@example.com">hello@example.com</TextLink>, or
      read the <TextLink href="#terms">terms</TextLink> first.
    </Body>
  ),
};

/** A bare `<a>` has none of the theme's link colour, weight or focus ring. */
export const DontInSentence: S = {
  render: () => (
    <Body as="p">
      Questions? Email <a href="mailto:hello@example.com">hello@example.com</a>, or read the{" "}
      <a href="#terms">terms</a> first.
    </Body>
  ),
};

/** `external` opens another site in a new tab and adds `rel="noreferrer"` with it. */
export const DoExternal: S = {
  render: () => (
    <TextLink href="https://example.com" external>
      example.com
    </TextLink>
  ),
};

/** `target="_blank"` by hand leaves out the `rel`. Say `external` and the link gets both. */
export const DontExternal: S = {
  render: () => (
    <TextLink href="https://example.com" target="_blank">
      example.com
    </TextLink>
  ),
};

/** In an app with a router, `render` draws the router's own `<Link>`; here an anchor stands in. */
export const DoRouter: S = {
  render: () => <TextLink render={(p) => <a href="#terms" {...p} />}>Read the terms</TextLink>,
};

/** `stretch` makes the whole of the nearest `relative` ancestor the click target: a `Card` here, a `TableRow` in a table. */
export const DoStretch: S = {
  render: () => (
    <Card title="Quote 12">
      <TextLink href="#quote-12" stretch>
        Open the quote
      </TextLink>
    </Card>
  ),
};
