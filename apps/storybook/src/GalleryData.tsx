import { Button, Callout, Card, ListRow } from "@hackcove/ui";

/** The Card variants (flush, header bar, dashed), the Callout actions and banner, and the ListRow set. */
export function GalleryData() {
  return (
    <div className="flex flex-col gap-4">
      <Card
        bar
        flush
        title="Bills"
        count={2}
        actions={
          <Button size="sm" variant="outline">
            Add
          </Button>
        }
      >
        <Callout banner tone="warn" actions={<Button size="sm">Fix</Button>}>
          One bill has no due date.
        </Callout>
        <div>
          <ListRow trailing="R 9 500">Rent</ListRow>
          <ListRow className="border-t border-slate-200/70" trailing="R 1 850">
            Transport
          </ListRow>
          <ListRow className="border-t border-slate-200/70" href="#bills" trailing="3">
            A link row
          </ListRow>
        </div>
      </Card>
      <Card dashed>No statements yet.</Card>
      <Callout tone="info" title="Heads up." actions={<Button size="sm">Retry</Button>}>
        The last import did not finish.
      </Callout>
    </div>
  );
}
