import { Card, ProgressBar } from "@hackcove/ui-react";

/** Card `inset` (a full-bleed band) and a nested `Card tone="neutral"` (the bordered sub-card). */
export function InsetAndNested() {
  return (
    <>
      <Card title="Kitchen" inset={<ProgressBar value={62} label="Kitchen progress" />}>
        Card inset: a full-bleed band.
      </Card>
      <Card title="Order 1042">
        <Card tone="neutral" size="sm">
          A bordered sub-card: Card tone neutral.
        </Card>
      </Card>
    </>
  );
}
