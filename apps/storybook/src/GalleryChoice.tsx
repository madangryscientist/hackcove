import { useState } from "react";
import { Disclosure, Radio, RadioGroup, Switch, Text } from "@hackcove/ui-react";

/** The Switch (off, on, a description, busy, disabled, bare), the RadioGroup (a description, an error) and the Disclosure (closed, open, `bordered`) of the Gallery. */
export function GalleryChoice() {
  const [live, setLive] = useState(true);
  const [staging, setStaging] = useState(false);
  return (
    <div className="flex max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-3">
        <Switch label="Live in production" checked={live} onChange={setLive} />
        <Switch label="Live in staging" checked={staging} onChange={setStaging} />
        <Switch
          label="Live in preview"
          description="Branch previews only."
          checked={live}
          onChange={setLive}
        />
        <Switch size="sm" label="Small, busy" checked busy onChange={setLive} />
        <Switch size="lg" label="Large, disabled" checked={false} disabled onChange={setLive} />
        <Switch
          aria-label="Bare, in a table cell"
          size="sm"
          checked={staging}
          onChange={setStaging}
        />
      </div>
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
