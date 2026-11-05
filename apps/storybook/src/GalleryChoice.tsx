import { Disclosure, Radio, RadioGroup, Text } from "@hackcove/ui-react";

/** The RadioGroup (a description, an error) and the Disclosure (closed, open, `bordered`) of the Gallery. */
export function GalleryChoice() {
  return (
    <div className="flex max-w-sm flex-col gap-4">
      <RadioGroup label="Who can see your reviews" defaultValue="followers">
        <Radio value="public" label="Everyone" description="Anyone with the link." />
        <Radio value="followers" label="Followers" />
        <Radio value="me" label="Only me" isDisabled />
      </RadioGroup>
      <RadioGroup label="Shop type" error="Choose a shop type to continue.">
        <Radio value="vintage" label="Vintage" />
        <Radio value="books" label="Books" />
      </RadioGroup>
      <div className="flex flex-col">
        <Disclosure summary="Override trail" defaultOpen>
          <Text>Three overrides, the latest on Tuesday.</Text>
        </Disclosure>
        <Disclosure summary="Tracking history">
          <Text>Posted Monday · Sorted Tuesday.</Text>
        </Disclosure>
      </div>
      <Disclosure bordered summary="Customise by month" defaultOpen>
        <Text>Override the split for individual months.</Text>
      </Disclosure>
      <Disclosure bordered summary="2027">
        <Text>Twelve months.</Text>
      </Disclosure>
    </div>
  );
}
