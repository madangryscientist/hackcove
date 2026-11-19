import {
  Button,
  Card,
  CardGrid,
  Cluster,
  ListRow,
  Pill,
  TextLink,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
} from "@slashsuite/ui-react";

/** A linked ListRow (and an `active` one), a linked TableRow and a link Card, each holding its own link and button above the stretched link, then a badged link Card and an `attention` Card, then Cards with an `icon`. */
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
        <ListRow href="#ada" divided highlighted>
          Active row
        </ListRow>
      </Card>
      <Table label="Linked rows">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Reference</TableHeaderCell>
            <TableHeaderCell>Client</TableHeaderCell>
            <TableHeaderCell align="end" label="Actions" />
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell mono>
              <TextLink href="#Q-2001" stretch>
                Q-2001
              </TextLink>
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
            <Text tone="muted">A link card with its own link and button.</Text>
            <TextLink href="#shot-9-history">History</TextLink>
            <Button size="sm" variant="outline">
              Accept
            </Button>
          </Stack>
        </Card>
        <Card href="#shot-10" title="Dashboard" badge={<Pill tone="warn">Flaky</Pill>}>
          <Text tone="muted">A link card with a badge.</Text>
        </Card>
        <Card title="Flaky" attention>
          <Text tone="muted">A card that needs a look.</Text>
        </Card>
      </CardGrid>
      <IconCards />
    </div>
  );
}

function IconCards() {
  return (
    <CardGrid>
      <Card icon="diff" title="Visual diffs">
        <Text tone="muted">A feature card: an icon above the title.</Text>
      </Card>
      <Card icon="self-host" title="Self-host" href="#self-host">
        <Text tone="muted">A link card with an icon.</Text>
      </Card>
      <Card icon="privacy" title="Privacy" size="sm">
        <Text tone="muted">A dense one.</Text>
      </Card>
    </CardGrid>
  );
}
