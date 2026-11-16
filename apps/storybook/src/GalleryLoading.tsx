import {
  Avatar,
  AvatarStack,
  Badge,
  Card,
  Checkbox,
  DateField,
  DetailLayout,
  Field,
  FormRow,
  FormRowField,
  Image,
  Input,
  ListLayout,
  ListRow,
  MediaTile,
  ProgressBar,
  Radio,
  RadioGroup,
  SplitBar,
  StackedBar,
  Table,
  TableBody,
  TableHead,
  TableHeaderCell,
  TableRow,
  Timeline,
  TrendChart,
  KeyValue,
  KeyValueList,
  Markdown,
  MetaList,
  Pill,
  SectionHeading,
  StatTile,
  Switch,
  Text,
} from "@hackcove/ui-react";

/** The parts that wait for their data, while they wait: known captions drawn, the rest bones. */
export function GalleryLoading() {
  return (
    <>
      <SectionHeading loading>{undefined}</SectionHeading>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile loading label="Revenue" value={undefined} />
        <Card>
          <KeyValueList loading>
            <KeyValue label="Customer">{undefined}</KeyValue>
            <KeyValue label="VAT">{undefined}</KeyValue>
          </KeyValueList>
        </Card>
      </div>
      <Text loading>{undefined}</Text>
      <div className="flex items-center gap-3">
        <MetaList loading>{[]}</MetaList>
        <Pill loading tone="positive">
          {undefined}
        </Pill>
        <Badge loading count={0} />
      </div>
      <Markdown loading md={undefined} />
      <GalleryLoadingCollections />
      <GalleryLoadingForms />
      <GalleryLoadingPages />
    </>
  );
}

/** The collections, pictures and figures while they wait. */
function GalleryLoadingCollections() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="Notes" loading>
          {null}
        </Card>
        <Card title="Recent quotes" bar flush loading>
          {null}
        </Card>
      </div>
      <Table label="Quotes" loading>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Quote</TableHeaderCell>
            <TableHeaderCell>Customer</TableHeaderCell>
            <TableHeaderCell numeric>Total</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody />
      </Table>
      <div className="grid gap-4 sm:grid-cols-2">
        <Timeline label="Status history" loading />
        <Card flush>
          <ListRow loading leading={<Avatar name="" />}>
            {null}
          </ListRow>
        </Card>
      </div>
      <div className="flex items-center gap-4">
        <AvatarStack loading items={[]} />
        <Avatar loading name="" size="lg" shape="square" />
        <Image loading alt="The shop front" width="sm" />
        <MediaTile loading alt="The shop front" width="sm" caption="Today" />
      </div>
      <div className="flex flex-col gap-2">
        <ProgressBar loading value={0} label="Upload" />
        <SplitBar loading a={0} b={0} label="Pot split" />
        <StackedBar
          loading
          legend
          label="Screenshots by status"
          items={[
            { label: "Changed", value: 0, tone: "warn" },
            { label: "Same", value: 0, tone: "muted" },
          ]}
        />
      </div>
      <TrendChart
        loading
        label="Tickets opened and closed per week"
        buckets={["W1", "W2", "W3", "W4", "W5", "W6"]}
        series={[
          { label: "Opened", tone: "warn", values: [] },
          { label: "Closed", tone: "info", values: [] },
        ]}
      />
    </>
  );
}

/** The form parts while they wait: labels drawn, controls bones. */
function GalleryLoadingForms() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-4">
        <Field label="Display name" loading>
          <Input />
        </Field>
        <DateField label="Delivery date" loading />
        <FormRow>
          <FormRowField label="Street" htmlFor="gallery-loading-street" span={2} loading>
            <Input id="gallery-loading-street" />
          </FormRowField>
          <FormRowField label="Code" htmlFor="gallery-loading-code" loading>
            <Input id="gallery-loading-code" />
          </FormRowField>
        </FormRow>
      </div>
      <div className="flex flex-col gap-4">
        <Checkbox label="Email me when a quote is accepted" loading />
        <Switch label="Weekly summary" loading />
        <RadioGroup label="Delivery" loading>
          <Radio label="Friday" value="fri" />
          <Radio label="Monday" value="mon" />
        </RadioGroup>
      </div>
    </div>
  );
}

/** Two whole pages while they wait: one `loading` on the layout, the same tree as with data. */
function GalleryLoadingPages() {
  return (
    <>
      <ListLayout title="Quotes" loading>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile label="Open" value={undefined} />
          <StatTile label="Total" value={undefined} />
          <StatTile label="Accepted" value={undefined} />
        </div>
      </ListLayout>
      <DetailLayout
        title={null}
        loading
        aside={
          <Card title="Customer">
            <KeyValueList>
              <KeyValue label="Name">{undefined}</KeyValue>
              <KeyValue label="Phone">{undefined}</KeyValue>
            </KeyValueList>
          </Card>
        }
      >
        <Card title="Notes">{null}</Card>
      </DetailLayout>
    </>
  );
}
