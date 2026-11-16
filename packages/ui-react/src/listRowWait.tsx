import type { ListRowProps } from "./listRowProps.js";
import { BoneLines, BusyLabel, busy, isEmptySlot } from "./skeleton.js";

/**
 * A row's props as it draws them: without `loading` and `loadingLabel`, the owner's `aria-busy`,
 * and a label that is a bone while it waits with none, followed by the owner's hidden label.
 */
export function waitingRow(props: ListRowProps, loading: boolean, owner: boolean): ListRowProps {
  const { loading: _own, loadingLabel, children, ...rest } = props;
  return {
    ...rest,
    ...busy(owner, loading),
    children: (
      <>
        {loading && isEmptySlot(children) ? <BoneLines count={1} width="1/2" /> : children}
        <BusyLabel owner={owner} loading={loading} label={loadingLabel} />
      </>
    ),
  };
}
