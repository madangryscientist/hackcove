import type { ReactElement } from "react";
import { BusyLabel, busy, useLoading } from "./skeleton.js";

/**
 * A page layout's or header's wait: whether it is loading (its own `loading`, else its
 * ancestors'), the owner's `aria-busy` for the element that takes its other props, and the owner's
 * one hidden label to put inside that element. The layout passes `loading` to everything inside it
 * with a `LoadingScope`.
 */
export function useWait(
  own: boolean | undefined,
  label: string | undefined,
): { loading: boolean; owner: boolean; attrs: { "aria-busy"?: true }; label: ReactElement } {
  const { loading, owner } = useLoading(own);
  return {
    loading,
    // Owning a wait that is under way: what draws the owner's label.
    owner: owner && loading,
    attrs: busy(owner, loading),
    label: <BusyLabel owner={owner} loading={loading} label={label} />,
  };
}
