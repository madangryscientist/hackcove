import { InlineLinks, TextLink } from "@hackcove/ui";

/** The links block of the Gallery: a TextLink in a sentence, and an InlineLinks row. */
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
      <InlineLinks>
        <TextLink href="#privacy">Privacy</TextLink>
        <TextLink href="#terms">Terms</TextLink>
        <TextLink href="#contact">Contact</TextLink>
      </InlineLinks>
    </div>
  );
}
