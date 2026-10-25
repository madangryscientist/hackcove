import {
  Button,
  Callout,
  Card,
  ListRow,
  Pill,
  rowLinkClass,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Timeline,
  TimelineItem,
} from "@hackcove/ui";

/** The Card variants (flush, header bar, dashed, dashed filled), the Callout actions and banner, the ListRow set, a Table with a stretched row link, a plain Table with a second-line cell and a Timeline. */
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
      <Card title="PixelSlash" status={<Pill tone="amber">Coming soon</Pill>}>
        Status beside the title.
      </Card>
      <Card dashed>No statements yet.</Card>
      <Card dashed="filled">No quotes yet.</Card>
      <Callout tone="info" title="Heads up." actions={<Button size="sm">Retry</Button>}>
        The last import did not finish.
      </Callout>
      <GalleryTables />
      <Timeline label="Status history">
        <TimelineItem title={<Pill tone="emerald">accepted</Pill>} time="12 Oct 2026, 09:14">
          Client confirmed by phone.
        </TimelineItem>
        <TimelineItem title={<Pill tone="amber">sent</Pill>} time="10 Oct 2026, 16:02" />
      </Timeline>
    </div>
  );
}

/** A Table with a stretched row link, then a plain Table with a second-line cell inside a Card. */
function GalleryTables() {
  return (
    <>
      <Table caption="Quotes">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Reference</TableHeaderCell>
            <TableHeaderCell>Client</TableHeaderCell>
            <TableHeaderCell align="end">Premium</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell mono>
              <a href="#Q-1042" className={rowLinkClass}>
                Q-1042
              </a>
            </TableCell>
            <TableCell tone="strong">Naledi Dlamini</TableCell>
            <TableCell align="end" numeric>
              R 1 249.00
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell mono>
              <a href="#Q-1043" className={rowLinkClass}>
                Q-1043
              </a>
            </TableCell>
            <TableCell tone="muted">Pieter van Wyk</TableCell>
            <TableCell align="end" numeric>
              R 880.50
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Card title="Clients">
        <Table variant="plain" caption="Clients">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Client</TableHeaderCell>
              <TableHeaderCell align="end">Premium</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell tone="strong" secondary="Q-1042">
                Naledi Dlamini
              </TableCell>
              <TableCell align="end" numeric>
                R 1 249.00
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
