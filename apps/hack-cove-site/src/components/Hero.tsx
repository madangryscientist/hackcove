import { Display, Overline } from "@hackcove/ui";
import { site } from "../content/site";

export function Hero() {
  // Plain block flow, not a Stack: the Overline is an inline span, and as a flex item it would lose
  // its line box (8px) and move the hero.
  return (
    <header>
      <Overline>{site.legalName}</Overline>
      <Display>{site.tagline}</Display>
    </header>
  );
}
