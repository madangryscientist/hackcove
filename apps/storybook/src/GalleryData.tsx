import {
  Avatar,
  Button,
  Callout,
  Caption,
  Card,
  EmptyState,
  ListRow,
  Pill,
  TextLink,
  Table,
  TableBody,
  TableCell,
  TableFoot,
  TableGroupRow,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Timeline,
  TimelineItem,
} from "@slashsuite/ui-react";
import { samplePhoto } from "./samplePhoto";
import { InsetAndNested } from "./GalleryCardInset";
import { DenseRows } from "./GalleryDenseRows";
import { GallerySortableList } from "./GallerySortableList";
import { GalleryTableOptions } from "./GalleryTableOptions";

/** A Callout with an action, in info and in danger. */
function GalleryCalloutActions() {
  return (
    <>
      <Callout tone="info" title="Heads up." actions={<Button size="sm">Retry</Button>}>
        The last import did not finish.
      </Callout>
      <Callout
        tone="danger"
        title="Build failed."
        actions={
          <Button size="sm" variant="outline">
            Rerun
          </Button>
        }
      >
        3 visual checks did not match.
      </Callout>
    </>
  );
}

/** The Card variants (flush, header bar, dense, toned), a standalone EmptyState, the Callout actions (info and danger), banner and link, the ListRow set (a dense row and a compact bordered list of `size="sm"` rows with no action, a row with leading, selected and hover actions), a SortableList with an empty section, a link Card, a Table with a stretched row link and toned rows, a Table with a group row, cell tones, a truncated cell and a totals foot, a Table in a Card (plain) with a second-line cell and a `label` actions column and a Timeline. */
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
          <ListRow divided secondary="Debit order" trailing="R 640">
            Insurance
          </ListRow>
          <ListRow divided href="#bills" trailing="3">
            A link row
          </ListRow>
        </div>
      </Card>
      <Card title="PixelSlash" status={<Pill tone="warn">Coming soon</Pill>}>
        Status beside the title.
      </Card>
      <Card size="sm" tone="positive" title="Forecast">
        Dense and toned.
      </Card>
      <Card tone="warn">A toned data panel.</Card>
      <InsetAndNested />
      <Card href="#shot" title="Dashboard" status={<Pill tone="warn">changed</Pill>}>
        A card that is one link.
      </Card>
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
      <DenseRows />
      <GalleryStaticRows />
      <GallerySortableList />
      <EmptyState title="No statements yet" icon="page">
        <Text>Import a statement to get started.</Text>
      </EmptyState>
      <Callout tone="positive" title="Callout align" align="center">
        Centred, as a success state.
      </Callout>
      <GalleryCalloutActions />
      <GalleryTables />
      <Timeline label="Status history">
        <TimelineItem
          tone="positive"
          title={<Pill tone="positive">accepted</Pill>}
          time="12 Oct 2026, 09:14"
        >
          Client confirmed by phone.
        </TimelineItem>
        <TimelineItem title={<Pill tone="warn">sent</Pill>} time="10 Oct 2026, 16:02" />
      </Timeline>
    </div>
  );
}

/** A static ListRow with `leading`, `selected` and `revealOnHover` actions, a `focused` row, and a thumbnail row with a block label. */
function GalleryStaticRows() {
  return (
    <Card flush>
      <ListRow selected leading={<Avatar name="Ada Lovelace" size="sm" />} trailing="admin">
        Selected static row
      </ListRow>
      <ListRow
        divided
        revealOnHover
        leading={<Avatar name="Grace Hopper" size="sm" />}
        actions={<Button size="sm">Remove</Button>}
      >
        Static row, actions on hover
      </ListRow>
      <ListRow divided focused trailing="R 1 850">
        Focused row
      </ListRow>
      <ListRow
        divided
        href="#dashboard"
        leadingWidth="thumbnail"
        leading={<img alt="" src={samplePhoto} />}
        trailing={<Pill tone="warn">changed</Pill>}
      >
        <Text>Thumbnail row</Text>
        <Caption>A block label under the title.</Caption>
      </ListRow>
    </Card>
  );
}

/** A Table with a stretched row link and toned rows (danger, warn, muted), a Table with a group row, cell tones, a truncated cell and a foot, then a plain Table with a second-line cell inside a Card. */
function GalleryTables() {
  return (
    <>
      <QuotesTable />
      <BudgetTable />
      <GalleryTableOptions />
      <ClientsCard />
    </>
  );
}

function QuotesTable() {
  return (
    <Table label="Quotes">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Reference</TableHeaderCell>
          <TableHeaderCell>Client</TableHeaderCell>
          <TableHeaderCell numeric>Premium</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell mono>
            <TextLink href="#Q-1042" stretch>
              Q-1042
            </TextLink>
          </TableCell>
          <TableCell tone="strong">Naledi Dlamini</TableCell>
          <TableCell numeric>R 1 249.00</TableCell>
        </TableRow>
        <TableRow tone="danger">
          <TableCell mono>
            <TextLink href="#Q-1043" stretch>
              Q-1043
            </TextLink>
          </TableCell>
          <TableCell tone="muted">Pieter van Wyk</TableCell>
          <TableCell numeric>R 880.50</TableCell>
        </TableRow>
        <TableRow tone="warn">
          <TableCell mono>Q-1044</TableCell>
          <TableCell>Thandi Mokoena</TableCell>
          <TableCell numeric>R 2 310.00</TableCell>
        </TableRow>
        <TableRow tone="muted">
          <TableCell mono>Q-1045</TableCell>
          <TableCell>Transfer</TableCell>
          <TableCell numeric>R 500.00</TableCell>
        </TableRow>
        <TableRow stripe="info">
          <TableCell mono>Q-1046</TableCell>
          <TableCell>Lindiwe Khumalo</TableCell>
          <TableCell numeric>R 1 120.00</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

function BudgetTable() {
  return (
    <Table label="Budget">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Line</TableHeaderCell>
          <TableHeaderCell numeric>Spent</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableGroupRow label="Home" trailing="R 4 120.00" colSpan={2} />
        <TableRow>
          <TableCell mono truncate>
            feature/a-branch-name-long-enough-to-be-cut-at-the-cell-width-by-truncate
          </TableCell>
          <TableCell numeric tone="positive">
            + R 1 200.00
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Groceries</TableCell>
          <TableCell numeric tone="danger">
            - R 4 120.00
          </TableCell>
        </TableRow>
      </TableBody>
      <TableFoot>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell numeric>- R 2 920.00</TableCell>
        </TableRow>
      </TableFoot>
    </Table>
  );
}

function ClientsCard() {
  return (
    <Card title="Clients">
      <Table label="Clients">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Client</TableHeaderCell>
            <TableHeaderCell numeric>Premium</TableHeaderCell>
            <TableHeaderCell align="end" label="Actions" />
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell tone="strong" secondary="Q-1042">
              Naledi Dlamini
            </TableCell>
            <TableCell numeric>R 1 249.00</TableCell>
            <TableCell align="end">
              <Button variant="outline" size="sm">
                Open
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
        <TableFoot>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell numeric>R 1 249.00</TableCell>
            <TableCell>{null}</TableCell>
          </TableRow>
        </TableFoot>
      </Table>
    </Card>
  );
}
