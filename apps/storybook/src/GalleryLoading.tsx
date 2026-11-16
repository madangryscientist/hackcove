import {
  Badge,
  Card,
  KeyValue,
  KeyValueList,
  Markdown,
  MetaList,
  Pill,
  SectionHeading,
  StatTile,
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
    </>
  );
}
