import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, type LinkAdapter, LinkProvider, Text, TextLink } from "@hackcove/ui-react";

const meta: Meta = { title: "Text/TextLink" };
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

/** With no `size`, a link takes the size of the text around it. The `size` scale is in "size and mono". */
export const InheritsSize: S = {
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <p className="text-sm">
        <TextLink href="#in-small-text">A link in text-sm</TextLink>
      </p>
      <p className="text-base">
        <TextLink href="#in-base-text">A link in text-base</TextLink>
      </p>
    </div>
  ),
};

export const SizeAndMono: S = {
  name: "size and mono",
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <TextLink href="#sm" size="sm">
        size sm
      </TextLink>
      <TextLink href="#md" size="md">
        size md
      </TextLink>
      <TextLink href="#lg" size="lg">
        size lg
      </TextLink>
      <TextLink href="#path" size="md" mono>
        packages/ui-react/src/TextLink.tsx
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

/** Stands in for a router's <Link>: the app's adapter, set once on a `LinkProvider`. */
const FakeLink: LinkAdapter = ({ href, ...rest }) => <a {...rest} href={`#${href}`} />;

export const WithRouterLink: S = {
  render: () => <TextLink href="/terms">Read the terms</TextLink>,
};

/** `stretch` covers the nearest `relative` ancestor, so the whole row is the click target. */
export const Stretch: S = {
  parameters: { layout: "padded" },
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

/** A link in running text is a `TextLink` inside a `Text`. */
export const DoInSentence: S = {
  render: () => (
    <Text>
      Questions? Email <TextLink href="mailto:hello@example.com">hello@example.com</TextLink>, or
      read the <TextLink href="#terms">terms</TextLink> first.
    </Text>
  ),
};

/** A bare `<a>` has none of the theme's link colour, weight or focus ring. */
export const DontInSentence: S = {
  render: () => (
    <Text>
      Questions? Email <a href="mailto:hello@example.com">hello@example.com</a>, or read the{" "}
      <a href="#terms">terms</a> first.
    </Text>
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

/** The app names its router's link once, on a `LinkProvider`: every part below takes a plain `href`, and only the in-app ones reach the adapter. */
export const RouterLinks: S = {
  render: () => (
    <LinkProvider link={FakeLink}>
      <Card title="Shot 12">
        <Text>
          Back to <TextLink href="/builds/7">build 7</TextLink>, or open the{" "}
          <TextLink href="https://example.com/docs" external>
            docs
          </TextLink>
          .
        </Text>
      </Card>
    </LinkProvider>
  ),
};

/** In an app with a router, set the router's `<Link>` once on a `LinkProvider` and give each link its `href`; here an anchor stands in. */
export const DoRouter: S = {
  render: () => <TextLink href="/terms">Read the terms</TextLink>,
};

/** A router `<Link>` drawn by hand at each link loses the TextLink look and its focus ring: give `TextLink` the `href`, and the app's `LinkProvider` draws the router link. */
export const DontRouter: S = {
  render: () => <a href="#terms">Read the terms</a>,
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

/** Two stretched links in one card both claim the whole card, so a click lands on whichever is last. Stretch the one link; the other sits above it. */
export const DontStretch: S = {
  render: () => (
    <Card title="Quote 12">
      <TextLink href="#quote-12" stretch>
        Open the quote
      </TextLink>
      <TextLink href="#client-4" stretch>
        Open the client
      </TextLink>
    </Card>
  ),
};
