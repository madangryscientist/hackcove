import {
  Button,
  Card,
  CardGrid,
  Cluster,
  ListRow,
  Pill,
  rowLinkClass,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  TextLink,
} from "@hackcove/ui";

/** A linked ListRow (and an `active` one), a linked TableRow and a link Card, each holding its own link and button above the stretched link, then a badged link Card and an `attention` Card. */
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
        <ListRow href="#ada" divided active>
          Active row
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
            <Text as="p" color="muted">
              A link card with its own link and button.
            </Text>
            <TextLink href="#shot-9-history">History</TextLink>
            <Button size="sm" variant="outline">
              Accept
            </Button>
          </Stack>
        </Card>
        <Card href="#shot-10" title="Dashboard" badge={<Pill tone="amber">Flaky</Pill>}>
          <Text as="p" color="muted">
            A link card with a badge.
          </Text>
        </Card>
        <Card title="Flaky" attention>
          <Text as="p" color="muted">
            A card that needs a look.
          </Text>
        </Card>
      </CardGrid>
    </div>
  );
}
