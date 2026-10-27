import { Code, InlineLinks, MetaList, TextLink, type LinkRenderProps } from "@hackcove/ui";

/** Stands in for a router's <Link to>: takes `to`, spreads the rest on an anchor. */
function FakeLink({ to, ...rest }: { to: string } & LinkRenderProps) {
  return <a href={`#${to}`} {...rest} />;
}

/** The links block of the Gallery: a TextLink in a sentence, toned TextLinks, an InlineLinks row, MetaList rows (a mixed one and a mono one), a router-Link TextLink and a row with a stretched link. */
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
        <TextLink href="#sm" size="sm">
          TextLink sm
        </TextLink>
        <TextLink href="#path" size="md" mono>
          TextLink md mono
        </TextLink>
        <TextLink href="#skipped" tone="warn">
          TextLink warn
        </TextLink>
        <TextLink href="#failed" tone="danger">
          TextLink danger
        </TextLink>
      </p>
      <InlineLinks>
        <TextLink href="#privacy">Privacy</TextLink>
        <TextLink href="#terms">Terms</TextLink>
        <TextLink render={(p) => <FakeLink to="/contact" {...p} />}>Contact</TextLink>
      </InlineLinks>
      <MetaList>
        <TextLink href="#branch">hc-139</TextLink>
        <Code>0f9d376</Code>
        <span>26 Oct 2026</span>
      </MetaList>
      <MetaList mono>
        <span>chromium</span>
        <span>desktop</span>
        <span>1280×800</span>
      </MetaList>
      <div className="relative flex max-w-sm justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
        <TextLink href="#quote-12" stretch>
          Quote 12
        </TextLink>
        <span className="text-slate-500">the whole row opens it</span>
      </div>
    </div>
  );
}
