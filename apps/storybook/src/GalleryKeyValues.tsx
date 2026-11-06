import { Kbd, KeyValue, KeyValueList } from "@hackcove/ui-react";

/** The KeyValueList block of the Gallery: a label/value row with a value and a Kbd key, then the left-aligned variant, a total and a total in the `warn` tone. */
export function GalleryKeyValues() {
  return (
    <div className="flex max-w-sm flex-col gap-4">
      <KeyValueList>
        <KeyValue label="Size">1280×720</KeyValue>
        <KeyValue label="Next shot">
          <Kbd>j</Kbd>
        </KeyValue>
      </KeyValueList>
      <KeyValueList align="start">
        <KeyValue label="Size">1280×720</KeyValue>
        <KeyValue label="Changed pixels">0.4%</KeyValue>
      </KeyValueList>
      <KeyValueList>
        <KeyValue label="Income">R 42 000</KeyValue>
        <KeyValue label="Left over" total>
          R 30 650
        </KeyValue>
      </KeyValueList>
      <KeyValueList>
        <KeyValue label="Bank balance">R 31 200</KeyValue>
        <KeyValue label="Unreconciled" total tone="warn">
          R 550 off
        </KeyValue>
      </KeyValueList>
    </div>
  );
}
