import { Body, Disclosure, Radio, RadioGroup } from "@hackcove/ui";

/** The RadioGroup (a description, an error) and the Disclosure (closed, open) of the Gallery. */
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
          <Body>Three overrides, the latest on Tuesday.</Body>
        </Disclosure>
        <Disclosure summary="Tracking history">
          <Body>Posted Monday · Sorted Tuesday.</Body>
        </Disclosure>
      </div>
    </div>
  );
}
