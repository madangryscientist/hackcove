import { Avatar, Card, ListRow, Text } from "@hackcove/ui-react";

/** A dense ListRow in a small flush Card, and a compact bordered list: a flush Card of `static` `size="sm"` rows, and a static row with `detail`. */
export function DenseRows() {
  return (
    <>
      <Card flush size="sm">
        <ListRow size="sm" trailing="R 9 500">
          Dense row
        </ListRow>
      </Card>
      <Card flush>
        <ListRow size="sm" trailing="R 1 200">
          Compact list
        </ListRow>
        <ListRow size="sm" divided trailing="R 640">
          Static rows, divided
        </ListRow>
      </Card>
      <Card flush>
        <ListRow
          leading={<Avatar name="Linus T" />}
          trailing="10:42"
          panel={<Text>A thread opens under the label.</Text>}
        >
          Static row with detail
        </ListRow>
      </Card>
    </>
  );
}
