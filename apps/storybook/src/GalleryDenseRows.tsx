import { Card, ListRow } from "@hackcove/ui-react";

/** A dense ListRow in a small flush Card, and a compact bordered list: a flush Card of `static` `size="sm"` rows. */
export function DenseRows() {
  return (
    <>
      <Card flush size="sm">
        <ListRow size="sm" trailing="R 9 500">
          Dense row
        </ListRow>
      </Card>
      <Card flush>
        <ListRow static size="sm" trailing="R 1 200">
          Compact list
        </ListRow>
        <ListRow static size="sm" divided trailing="R 640">
          Static rows, divided
        </ListRow>
      </Card>
    </>
  );
}
