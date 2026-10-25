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
  TableFoot,
  TableGroupRow,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextLink,
  Timeline,
  TimelineItem,
} from "@hackcove/ui";

/** The Card variants (flush, header bar, dashed, dashed filled, dense, toned), the Callout actions, banner and link, the ListRow set, a Table with a stretched row link and toned rows, a Table with a group row, cell tones, a truncated cell and a totals foot, a plain Table with a second-line cell and a Timeline. */
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
          <ListRow divided trailing="R 1 850">
            Transport
          </ListRow>
          <ListRow divided href="#bills" trailing="3">
            A link row
          </ListRow>
        </div>
      </Card>
      <Card title="PixelSlash" status={<Pill tone="amber">Coming soon</Pill>}>
        Status beside the title.
      </Card>
      <Card size="sm" tone="positive" title="Forecast">
        Dense and toned.
      </Card>
      <Card tone="warn">A toned data panel.</Card>
      <Callout
        tone="warn"
        actions={
          <TextLink stretch href="#bills">
            Review
          </TextLink>
        }
      >
        A linked callout.
      </Callout>
      <Card flush size="sm">
        <ListRow size="sm" trailing="R 9 500">
          Dense row
        </ListRow>
      </Card>
      <Card dashed>No statements yet.</Card>
      <Card dashed="filled">No quotes yet.</Card>
      <Callout tone="info" title="Heads up." actions={<Button size="sm">Retry</Button>}>
        The last import did not finish.
      </Callout>
      <GalleryTables />
      <Timeline label="Status history">
        <TimelineItem
          tone="positive"
          title={<Pill tone="emerald">accepted</Pill>}
          time="12 Oct 2026, 09:14"
        >
          Client confirmed by phone.
        </TimelineItem>
        <TimelineItem title={<Pill tone="amber">sent</Pill>} time="10 Oct 2026, 16:02" />
      </Timeline>
    </div>
  );
}

/** A Table with a stretched row link and toned rows (danger, warn, muted), a Table with a group row, cell tones, a truncated cell and a foot, then a plain Table with a second-line cell inside a Card. */
function GalleryTables() {
  return (
    <>
      <QuotesTable />
      <BudgetTable />
      <ClientsCard />
    </>
  );
}

function QuotesTable() {
  return (
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
        <TableRow tone="danger">
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
        <TableRow tone="warn">
          <TableCell mono>Q-1044</TableCell>
          <TableCell>Thandi Mokoena</TableCell>
          <TableCell align="end" numeric>
            R 2 310.00
          </TableCell>
        </TableRow>
        <TableRow tone="muted">
          <TableCell mono>Q-1045</TableCell>
          <TableCell>Transfer</TableCell>
          <TableCell align="end" numeric>
            R 500.00
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

function BudgetTable() {
  return (
    <Table caption="Budget">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Line</TableHeaderCell>
          <TableHeaderCell align="end">Spent</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableGroupRow label="Home" trailing="R 4 120.00" colSpan={2} />
        <TableRow>
          <TableCell mono truncate>
            feature/a-branch-name-long-enough-to-be-cut-at-the-cell-width-by-truncate
          </TableCell>
          <TableCell align="end" numeric tone="positive">
            + R 1 200.00
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Groceries</TableCell>
          <TableCell align="end" numeric tone="danger">
            - R 4 120.00
          </TableCell>
        </TableRow>
      </TableBody>
      <TableFoot>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell align="end" numeric>
            - R 2 920.00
          </TableCell>
        </TableRow>
      </TableFoot>
    </Table>
  );
}

function ClientsCard() {
  return (
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
        <TableFoot>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell align="end" numeric>
              R 1 249.00
            </TableCell>
          </TableRow>
        </TableFoot>
      </Table>
    </Card>
  );
}
