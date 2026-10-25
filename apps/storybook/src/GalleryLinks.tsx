import { InlineLinks, TextLink, type LinkRenderProps } from "@hackcove/ui";

/** Stands in for a router's <Link to>: takes `to`, spreads the rest on an anchor. */
function FakeLink({ to, ...rest }: { to: string } & LinkRenderProps) {
  return <a href={`#${to}`} {...rest} />;
}

/** The links block of the Gallery: a TextLink in a sentence, an InlineLinks row, a router-Link TextLink and a row with a stretched link. */
export function GalleryLinks() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-slate-700">
        Email <TextLink href="mailto:hello@example.com">hello@example.com</TextLink>, or read the{" "}
        <TextLink href="#terms" external>
          terms
        </TextLink>
        .
      </p>
      <p className="flex gap-4">
        <TextLink href="#xs" size="xs">
          TextLink xs
        </TextLink>
        <TextLink href="#path" size="sm" mono>
          TextLink sm mono
        </TextLink>
      </p>
      <InlineLinks>
        <TextLink href="#privacy">Privacy</TextLink>
        <TextLink href="#terms">Terms</TextLink>
        <TextLink render={(p) => <FakeLink to="/contact" {...p} />}>Contact</TextLink>
      </InlineLinks>
      <div className="relative flex max-w-sm justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
        <TextLink href="#quote-12" stretch>
          Quote 12
        </TextLink>
        <span className="text-slate-500">the whole row opens it</span>
      </div>
    </div>
  );
}
