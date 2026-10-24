import { Display, Lead, Overline, Stack, TextLink } from "@hackcove/ui";
import { site } from "../content/site";

export function Hero() {
  // The Stack is only the reading measure. The header inside keeps normal block flow: the Overline
  // is an inline span, and as a flex item it would lose its line box (8px) and move the hero.
  return (
    <Stack width="narrow" className="pb-16 sm:pb-24">
      <header>
        <Overline>{site.legalName}</Overline>
        <Display className="mt-4">{site.tagline}</Display>
        <Lead className="mt-6">{site.intro}</Lead>
        <p className="mt-8">
          <TextLink className="text-base" href={`mailto:${site.contactEmail}`}>
            {site.contactEmail}
          </TextLink>
        </p>
      </header>
    </Stack>
  );
}
