import { Caption, SectionHeading, Subtitle } from "@hackcove/ui";
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
          Email{" "}
          <a className="link" href={`mailto:${site.contactEmail}`}>
            {site.contactEmail}
          </a>
          .
        </Subtitle>
        <Caption as="p" className="mt-8">
          {site.legalName}
        </Caption>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 text-sm">
          <a className="link" href="/privacy">
            Privacy
          </a>
          <Caption aria-hidden="true">·</Caption>
          <a className="link" href="/terms">
            Terms
          </a>
        </p>
      </div>
    </div>
  );
}
