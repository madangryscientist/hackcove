import { Caption, InlineLinks, SectionHeading, Subtitle, TextLink } from "@hackcove/ui";
import { site } from "../content/site";

/**
 * Email only — there is deliberately no contact form (ticket 164), which is also
 * why the site needs no server: a form would arrive later as its own section
 * plus a Worker, without changing anything here.
 */
export function Contact() {
  return (
    <div className="max-w-3xl">
      <div className="pt-4 pb-14">
        <SectionHeading>Get in touch</SectionHeading>
        <Subtitle className="mt-2">
          Email <TextLink href={`mailto:${site.contactEmail}`}>{site.contactEmail}</TextLink>.
        </Subtitle>
        <Caption as="p" className="mt-8">
          {site.legalName}
        </Caption>
        <InlineLinks className="mt-2">
          <TextLink href="/privacy">Privacy</TextLink>
          <TextLink href="/terms">Terms</TextLink>
        </InlineLinks>
      </div>
    </div>
  );
}
