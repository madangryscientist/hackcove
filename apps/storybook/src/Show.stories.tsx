import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Card,
  Field,
  Input,
  ListRow,
  Show,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@slashsuite/ui-react";

/** Content shown only from a width up, or only below it, by CSS alone. Narrow the viewport to see each swap. */
const meta: Meta = { title: "Layout/Show", parameters: { layout: "padded" } };
export default meta;
type S = StoryObj;

/** The builds list: a stack of rows on a phone (`Show below="sm"`), a table from `sm` (`Show from="sm"`). An input in a `Show below="lg"` keeps its value across a resize, since hidden content stays mounted. */
export const Default: S = {
  render: () => (
    <Stack>
      <Show below="sm">
        <Card flush>
          <Stack as="ul" divided aria-label="Builds">
            <li>
              <ListRow secondary="3 changed">Build 412</ListRow>
            </li>
            <li>
              <ListRow secondary="No changes">Build 411</ListRow>
            </li>
          </Stack>
        </Card>
      </Show>
      <Show from="sm">
        <Table label="Builds">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Build</TableHeaderCell>
              <TableHeaderCell>Branch</TableHeaderCell>
              <TableHeaderCell numeric>Changed</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Build 412</TableCell>
              <TableCell mono>main</TableCell>
              <TableCell numeric>3</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Build 411</TableCell>
              <TableCell mono>main</TableCell>
              <TableCell numeric>0</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Show>
      <Show below="lg">
        <Field label="Note for a narrow screen" htmlFor="show-note">
          <Input id="show-note" placeholder="Type, then resize" />
        </Field>
      </Show>
    </Stack>
  ),
};

/** A table that only fits a wide screen is in a `Show from`; its phone form, a stack of rows, is in a `Show below` at the same breakpoint. */
export const DoSwap: S = {
  render: () => (
    <Stack>
      <Show below="sm">
        <Card flush>
          <Stack as="ul" divided aria-label="Builds">
            <li>
              <ListRow secondary="main, 3 changed">Build 412</ListRow>
            </li>
            <li>
              <ListRow secondary="main, no changes">Build 411</ListRow>
            </li>
          </Stack>
        </Card>
      </Show>
      <Show from="sm">
        <Table label="Builds">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Build</TableHeaderCell>
              <TableHeaderCell>Branch</TableHeaderCell>
              <TableHeaderCell numeric>Changed</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Build 412</TableCell>
              <TableCell mono>main</TableCell>
              <TableCell numeric>3</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Build 411</TableCell>
              <TableCell mono>main</TableCell>
              <TableCell numeric>0</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Show>
    </Stack>
  ),
};

/** The same table at every width squashes on a phone and scrolls sideways; never hide it with a class of your own either. */
export const DontSwap: S = {
  render: () => (
    <Table label="Builds">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Build</TableHeaderCell>
          <TableHeaderCell>Branch</TableHeaderCell>
          <TableHeaderCell numeric>Changed</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Build 412</TableCell>
          <TableCell mono>main</TableCell>
          <TableCell numeric>3</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Build 411</TableCell>
          <TableCell mono>main</TableCell>
          <TableCell numeric>0</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
