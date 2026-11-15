import { useState } from "react";
import { BottomSheet, ListRow, Pill, SectionHeading } from "@hackcove/ui-react";

/** A BottomSheet at its first snap over a dummy full-screen view, with a header and three rows. */
export function GalleryBottomSheet() {
  const [snap, setSnap] = useState(0);
  return (
    <div className="relative h-72 overflow-hidden bg-slate-100">
      <BottomSheet
        label="Shops"
        snaps={[0.55, 0.9]}
        snap={snap}
        onSnapChange={setSnap}
        header={
          <>
            <SectionHeading>Shops nearby</SectionHeading>
            <Pill>3</Pill>
          </>
        }
      >
        <ListRow static trailing="0.2 km">
          Shop 1
        </ListRow>
        <ListRow static divided trailing="0.5 km">
          Shop 2
        </ListRow>
        <ListRow static divided trailing="0.8 km">
          Shop 3
        </ListRow>
      </BottomSheet>
    </div>
  );
}
