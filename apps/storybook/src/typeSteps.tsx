import {
  AppShell,
  Button,
  Caption,
  Input,
  PageHeading,
  SectionHeading,
  Select,
  SubsectionHeading,
  Text,
  Textarea,
} from "@hackcove/ui-react";
import type { ReactNode } from "react";

/**
 * Every text role and control at one type step: the headings, `Text`, `Caption`, and an `Input`, a
 * `Select`, a `Textarea` and a `Button` at each size. Drawn at the default step on its own, and one
 * step down inside `CompactApp`.
 */
export function TypeSpecimen() {
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <PageHeading>Type specimen</PageHeading>
      <SectionHeading>Section heading</SectionHeading>
      {(["lg", "md", "sm"] as const).map((size) => (
        <SubsectionHeading key={size} size={size}>
          Subsection heading {size}
        </SubsectionHeading>
      ))}
      <Text>Running text: a paragraph a reader reads at this step.</Text>
      <Caption>Caption: fine print and metadata.</Caption>
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex items-center gap-2">
          <Input size={size} aria-label={`Input ${size}`} defaultValue={`Input ${size}`} />
          <Select size={size} aria-label={`Select ${size}`}>
            <option>Select {size}</option>
          </Select>
          <Button size={size}>Button {size}</Button>
        </div>
      ))}
      <Textarea aria-label="Textarea" defaultValue="Textarea at md" />
    </div>
  );
}

/** An app that set `AppShell density="compact"`: everything inside is one type step down. */
export function CompactApp({ children }: { children: ReactNode }) {
  return (
    <AppShell density="compact" brand={<span>Compact app</span>}>
      {children}
    </AppShell>
  );
}
