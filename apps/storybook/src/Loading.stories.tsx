import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardGrid,
  KeyValue,
  KeyValueList,
  Markdown,
  MetaList,
  Pill,
  Stack,
  StatTile,
  Text,
  ListLayout,
  ListRow,
} from "@hackcove/ui-react";

const meta: Meta = { title: "Feedback/Loading" };
export default meta;
type S = StoryObj<{ loading: boolean }>;

type Quote = { total: string; customer: string; lines: string; vat: string };
const QUOTE: Quote = {
  total: "R 18 400",
  customer: "Cove Hardware",
  lines: "R 16 000",
  vat: "R 2 400",
};

/**
 * Give the part `loading` and the same tree it draws with data: the captions it knows stay, and a
 * bone stands where each figure will land. A button lands the data here; an app passes its query's
 * pending flag.
 */
export const DoWait: S = {
  render: () => {
    const [vat, setVat] = useState<string | undefined>(undefined);
    return (
      <Stack gap="md">
        <Button variant="outline" onClick={() => setVat(vat === undefined ? "R 2 400" : undefined)}>
          {vat === undefined ? "Land the data" : "Wait again"}
        </Button>
        <Card>
          <KeyValueList loading={vat === undefined} loadingLabel="Loading the quote">
            <KeyValue label="Customer">{vat && "Cove Hardware"}</KeyValue>
            <KeyValue label="Lines">{vat && "R 16 000"}</KeyValue>
            <KeyValue label="VAT">{vat}</KeyValue>
          </KeyValueList>
        </Card>
      </Stack>
    );
  },
};

/** A "Loading..." line drops every caption the reader could already see, and the page jumps when the rows arrive. */
export const DontWait: S = {
  render: () => (
    <Card>
      <Text tone="muted">Loading...</Text>
    </Card>
  ),
};

/** Every text and figure part while it waits, each with its known caption drawn. Flip `loading` to land the data. */
export const Parts: S = {
  args: { loading: true },
  render: ({ loading }) => {
    const data = loading ? undefined : QUOTE;
    return (
      <div className="max-w-md">
        <KeyValueList loading={loading} loadingLabel="Loading the quote">
          <KeyValue label="Customer">{data?.customer}</KeyValue>
          <KeyValue label="VAT">{data?.vat}</KeyValue>
        </KeyValueList>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <StatTile loading={loading} label="Total" value={data?.total} />
          <Stack gap="xs">
            <Text loading={loading}>{data && "Cove Hardware asked for a second quote."}</Text>
            <MetaList loading={loading}>{data ? ["Q-1043", "Cove Hardware"] : []}</MetaList>
            <div className="flex gap-2">
              <Pill loading={loading} tone="positive">
                {data && "Accepted"}
              </Pill>
              <Badge loading={loading} count={3} />
            </div>
            <Markdown loading={loading} md={data && "- **Two** lines changed"} />
          </Stack>
        </div>
      </div>
    );
  },
};

/**
 * Set `loading` once, on the page layout, and render the page you render with data: the header,
 * the actions and the filters draw as themselves, and every part inside waits with the layout.
 */
export const DoPage: S = {
  render: () => {
    const [rows, setRows] = useState<string[] | undefined>(undefined);
    return (
      <ListLayout
        title="Quotes"
        loading={rows === undefined}
        loadingLabel="Loading quotes"
        actions={
          <Button
            variant="outline"
            onClick={() => setRows(rows === undefined ? ["Q-1043", "Q-1042", "Q-1041"] : undefined)}
          >
            {rows === undefined ? "Land the data" : "Wait again"}
          </Button>
        }
      >
        <CardGrid>
          <StatTile label="Open" value={rows && "3"} />
          <StatTile label="Total" value={rows && "R 41 200"} />
          <StatTile label="Accepted" value={rows && "1"} />
        </CardGrid>
        <Card flush>
          {rows?.map((ref, i) => (
            <ListRow key={ref} divided={i > 0}>
              {ref}
            </ListRow>
          ))}
        </Card>
      </ListLayout>
    );
  },
};

/** A page swapped for a "Loading..." line loses its header and actions, and jumps when the data lands. */
export const DontPage: S = {
  render: () => <Text tone="muted">Loading quotes...</Text>,
};
