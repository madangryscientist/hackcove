import type { ReactElement, ReactNode } from "react";
import { ListRow } from "./ListRow.js";
import { BoneLines, BusyLabel, isEmptySlot } from "./skeleton.js";

/**
 * What a card holds while it may be waiting: its children, or, loading with none yet, three lines
 * of text bones (three `ListRow` bones in a `flush` card, the compact list it usually holds); then
 * the owner's hidden label.
 */
export function CardWait({
  loading,
  owner,
  label,
  flush,
  children,
}: {
  loading: boolean;
  owner: boolean;
  label: string | undefined;
  flush: boolean | undefined;
  children: ReactNode;
}): ReactElement {
  return (
    <>
      {loading && isEmptySlot(children) ? <CardBones flush={flush ?? false} /> : children}
      <BusyLabel owner={owner} loading={loading} label={label} />
    </>
  );
}

function CardBones({ flush }: { flush: boolean }): ReactElement {
  if (!flush) return <BoneLines />;
  return (
    <>
      {[0, 1, 2].map((i) => (
        <ListRow key={i} divided={i > 0}>
          {null}
        </ListRow>
      ))}
    </>
  );
}
