import { Pill, SortableItem, SortableList, SortableSection } from "@slashsuite/ui-react";

/** A SortableList: a section with two items (one with a meta line) and an empty section's Drop here row. */
export function GallerySortableList() {
  return (
    <SortableList label="Queue" onReorder={() => undefined}>
      <SortableSection id="now" title="Now">
        <SortableItem id="backup" title="Restore the nightly backup">
          <Pill>ops</Pill>
        </SortableItem>
        <SortableItem id="invoice" title="Ship the invoice export" />
      </SortableSection>
      <SortableSection id="later" title="Later" />
    </SortableList>
  );
}
