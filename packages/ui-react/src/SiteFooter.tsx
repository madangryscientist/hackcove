import type { ReactElement, ReactNode } from "react";
import { Cluster } from "./Cluster.js";
import { cx, focusRing } from "./cx.js";
import { renderLink } from "./link.js";
import { MetaList } from "./MetaList.js";
import type { Passthrough } from "./props.js";
import { Stack } from "./Stack.js";
import { TextLink } from "./TextLink.js";
import { Caption } from "./typography.js";

/** One link in a `SiteFooter`'s row: its words, where it goes, and whether it opens a new tab. */
export type SiteFooterLink = { label: string; href: string; external?: boolean | undefined };

/**
 * The footer a site puts in `AppShell`'s `footer` slot: the site's mark linked home with a contact
 * line beside it, a row of the site's own links (Privacy, Terms, GitHub), then lines of fine print.
 * It is not a `<footer>`: the shell draws the one `contentinfo` landmark around its slot. No link
 * columns, newsletter form or social icons: a site footer is this and nothing else.
 */
export function SiteFooter({
  brand,
  brandHref = "/",
  brandLabel,
  links = [],
  notes = [],
  children,
  ...rest
}: {
  /** The site's mark (a wordmark, a logo), linked to `brandHref`. Left out, there is no brand. */
  brand?: ReactNode;
  /**
   * Where the brand links. Needs `brand`.
   * @default "/"
   */
  brandHref?: string | undefined;
  /** Names the brand link for assistive tech ("PixelSlash home"). Needs `brand`. */
  brandLabel?: string | undefined;
  /** The site's own links (Privacy, Terms, GitHub, a mail address), one wrapping row. */
  links?: SiteFooterLink[] | undefined;
  /** Lines of fine print under the links (a licence, a trademark, a credit), one paragraph each. */
  notes?: ReactNode[] | undefined;
  /** A sentence at body size beside the brand: the contact line ("Email hello@..."). */
  children?: ReactNode;
} & Passthrough): ReactElement {
  const top = brand != null || children != null;
  return (
    <Stack {...rest} gap="sm">
      {top && (
        <Cluster gap="md">
          {brand != null &&
            renderLink({
              href: brandHref,
              "aria-label": brandLabel,
              className: cx("rounded text-slate-900", focusRing),
              children: brand,
            })}
          {children}
        </Cluster>
      )}
      {links.length > 0 && (
        <MetaList>
          {links.map((link) => (
            <TextLink key={`${link.label} ${link.href}`} href={link.href} external={link.external}>
              {link.label}
            </TextLink>
          ))}
        </MetaList>
      )}
      {notes.map((note, index) => (
        <Caption key={index}>{note}</Caption>
      ))}
    </Stack>
  );
}
