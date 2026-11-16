import { SiteFooter, Text, TextLink } from "@hackcove/ui-react";
import { site } from "../content/site";

/**
 * Every page's footer: the email line, the legal pages and the legal name, as a `SiteFooter`.
 * Email only: there is deliberately no contact form (ticket 164), which is also why the site
 * needs no server: a form would arrive later as its own section plus a Worker, without changing
 * anything here.
 */
export function Contact() {
  return (
    <SiteFooter
      links={[
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ]}
      notes={[site.legalName]}
    >
      <Text>
        Get in touch: email{" "}
        <TextLink href={`mailto:${site.contactEmail}`}>{site.contactEmail}</TextLink>.
      </Text>
    </SiteFooter>
  );
}
