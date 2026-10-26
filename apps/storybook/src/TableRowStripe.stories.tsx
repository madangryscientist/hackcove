import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Legend,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@hackcove/ui";

const meta: Meta = { title: "UI/Table row stripe" };
export default meta;
type S = StoryObj;

/** `stripe` is the stripe alone, in the same tones as a `StackedBar` segment, with no fill: the row keeps its hover and its look. Name the status in a cell too. */
export const RowStripes: S = {
  render: () => (
    <Table caption="Pages">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Page</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow stripe="warn">
          <TableCell tone="strong">/pricing</TableCell>
          <TableCell>Changed</TableCell>
        </TableRow>
        <TableRow stripe="info">
          <TableCell tone="strong">/security</TableCell>
          <TableCell>New</TableCell>
        </TableRow>
        <TableRow stripe="danger">
          <TableCell tone="strong">/old-landing</TableCell>
          <TableCell>Removed</TableCell>
        </TableRow>
        <TableRow stripe="positive">
          <TableCell tone="strong">/docs</TableCell>
          <TableCell>Accepted</TableCell>
        </TableRow>
        <TableRow stripe="muted">
          <TableCell tone="strong">/about</TableCell>
          <TableCell>Same</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

/** `stripe` marks a row's status by colour alone and keeps its hover; a `Legend` and a status word in the row say what each colour means. */
export const DoStripe: S = {
  render: () => (
    <Stack gap="xs">
      <Legend
        items={[
          { label: "Changed", tone: "warn" },
          { label: "Removed", tone: "danger" },
        ]}
      />
      <Table caption="Pages">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Page</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow stripe="warn">
            <TableCell tone="strong">/pricing</TableCell>
            <TableCell>Changed</TableCell>
          </TableRow>
          <TableRow stripe="danger">
            <TableCell tone="strong">/old-landing</TableCell>
            <TableCell>Removed</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Stack>
  ),
};

/** Stripes with no key and no status word in the row: the colour is the only signal, and it means nothing to anyone who cannot tell the colours apart. */
export const DontStripe: S = {
  render: () => (
    <Table caption="Pages">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Page</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow stripe="warn">
          <TableCell tone="strong">/pricing</TableCell>
        </TableRow>
        <TableRow stripe="danger">
          <TableCell tone="strong">/old-landing</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
