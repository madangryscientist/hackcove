import { Display, Lead, Overline, TextLink } from "@hackcove/ui";
import { site } from "../content/site";

export function Hero() {
  return (
    <header className="max-w-3xl pb-16 sm:pb-24">
      <Overline>{site.legalName}</Overline>
      <Display className="mt-4">{site.tagline}</Display>
      <Lead className="mt-6">{site.intro}</Lead>
      <p className="mt-8">
        <TextLink className="text-base" href={`mailto:${site.contactEmail}`}>
          {site.contactEmail}
        </TextLink>
      </p>
    </header>
  );
}
