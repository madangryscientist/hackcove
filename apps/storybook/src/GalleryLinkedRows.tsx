import {
  Button,
  Card,
  CardGrid,
  Cluster,
  Empty,
  ListRow,
  rowLinkClass,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextLink,
} from "@hackcove/ui";

/** A linked ListRow, a linked TableRow and a link Card, each holding its own link and button above the stretched link. */
export function GalleryLinkedRows() {
  return (
    <div className="flex flex-col gap-4">
      <Card flush>
        <ListRow
          href="#grace"
          trailing={
            <Cluster as="span">
              <TextLink href="#grace-notes">Notes</TextLink>
              <Button size="sm">Accept</Button>
            </Cluster>
          }
        >
          Linked row with a link and a button
        </ListRow>
      </Card>
      <Table caption="Linked rows">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Reference</TableHeaderCell>
            <TableHeaderCell>Client</TableHeaderCell>
            <TableHeaderCell align="end" srLabel="Actions" />
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell mono>
              <a href="#Q-2001" className={rowLinkClass}>
                Q-2001
              </a>
            </TableCell>
            <TableCell>
              <TextLink href="#Q-2001-client">Naledi Dlamini</TextLink>
            </TableCell>
            <TableCell align="end">
              <Button variant="outline" size="sm">
                Resend
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <CardGrid>
        <Card href="#shot-9" title="Settings">
          <Stack>
            <Empty>A link card with its own link and button.</Empty>
            <TextLink href="#shot-9-history">History</TextLink>
            <Button size="sm" variant="outline">
              Accept
            </Button>
          </Stack>
        </Card>
      </CardGrid>
    </div>
  );
}
