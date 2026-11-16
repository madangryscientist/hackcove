import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  ButtonGroup,
  Checkbox,
  Cluster,
  Field,
  Fieldset,
  FormGrid,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
} from "@hackcove/ui-react";

const meta: Meta = { title: "Forms/Fieldset" };
export default meta;
type S = StoryObj;

/** Several checkboxes that answer one question, named by the group's label. */
export const Checkboxes: S = {
  render: () => (
    <Fieldset label="What is wrong?" hint="Tick all that apply.">
      <Checkbox label="Wrong opening hours" />
      <Checkbox label="Wrong address" />
      <Checkbox label="Closed for good" />
    </Fieldset>
  ),
};

/** A set of fields that belong together, laid out by a `FormGrid` inside, the format as the hint. */
export const Fields: S = {
  render: () => (
    <Fieldset label="Opening hours" hint="HH:MM to HH:MM; leave a day blank when it is closed.">
      <FormGrid>
        <Field label="Monday to Friday">
          <Input defaultValue="09:00 to 17:00" />
        </Field>
        <Field label="Saturday">
          <Input defaultValue="09:00 to 13:00" />
        </Field>
      </FormGrid>
    </Fieldset>
  ),
};

/** The filter chips of one facet: a `ButtonGroup` of outline, small, pressed Buttons. */
export const Chips: S = {
  render: () => (
    <Fieldset label="Type of shop">
      <ButtonGroup>
        <Button variant="outline" size="sm" pressed={false}>
          Charity
        </Button>
        <Button variant="outline" size="sm" pressed>
          Vintage
        </Button>
        <Button variant="outline" size="sm" pressed={false}>
          Books
        </Button>
        <Button variant="outline" size="sm" pressed={false}>
          Furniture
        </Button>
      </ButtonGroup>
    </Fieldset>
  ),
};

/** The group's error replaces its hint, in red, and is announced. */
export const Invalid: S = {
  render: () => (
    <Fieldset label="What is wrong?" hint="Tick all that apply." error="Pick at least one.">
      <Checkbox label="Wrong opening hours" />
      <Checkbox label="Wrong address" />
      <Checkbox label="Closed for good" />
    </Fieldset>
  ),
};

/** `disabled` disables every control inside. */
export const Disabled: S = {
  render: () => (
    <Fieldset label="What is wrong?" disabled>
      <Checkbox label="Wrong opening hours" defaultChecked />
      <Checkbox label="Closed for good" />
    </Fieldset>
  ),
};

/** Checkboxes for one question go in a `Fieldset`, so a screen reader hears the question on entering the group. */
export const DoGroup: S = {
  render: () => (
    <Fieldset label="What is wrong?">
      <Checkbox label="Wrong opening hours" />
      <Checkbox label="Closed for good" />
    </Fieldset>
  ),
};

/** Bold text over loose checkboxes looks like a group, but the question is not their name. */
export const DontGroup: S = {
  render: () => (
    <Stack gap="xs">
      <Text strong>What is wrong?</Text>
      <Checkbox label="Wrong opening hours" />
      <Checkbox label="Closed for good" />
    </Stack>
  ),
};

/** One `Fieldset` per facet, stacked: each keeps its own name and its own row of chips. */
export const DoFacets: S = {
  render: () => (
    <Stack gap="sm">
      <Fieldset label="Type of shop">
        <ButtonGroup>
          <Button variant="outline" size="sm" pressed>
            Vintage
          </Button>
          <Button variant="outline" size="sm" pressed={false}>
            Books
          </Button>
        </ButtonGroup>
      </Fieldset>
      <Fieldset label="Open">
        <ButtonGroup>
          <Button variant="outline" size="sm" pressed={false}>
            Now
          </Button>
          <Button variant="outline" size="sm" pressed>
            Saturdays
          </Button>
        </ButtonGroup>
      </Fieldset>
    </Stack>
  ),
};

/** Chips with no group have no name: a screen reader hears a row of buttons and not what they filter. */
export const DontFacets: S = {
  render: () => (
    <Cluster gap="xs" wrap>
      <Button variant="outline" size="sm" pressed>
        Vintage
      </Button>
      <Button variant="outline" size="sm" pressed={false}>
        Books
      </Button>
      <Button variant="outline" size="sm" pressed={false}>
        Now
      </Button>
    </Cluster>
  ),
};

/** One choice of several is a `RadioGroup`, which is its own named group. */
export const DoRadio: S = {
  render: () => (
    <RadioGroup label="Kind" defaultValue="layout">
      <Radio value="layout" label="Layout" />
      <Radio value="colour" label="Colour" />
    </RadioGroup>
  ),
};

/** A `RadioGroup` inside a `Fieldset` is two names for one question. */
export const DontRadio: S = {
  render: () => (
    <Fieldset label="Detection">
      <RadioGroup label="Kind" defaultValue="layout">
        <Radio value="layout" label="Layout" />
        <Radio value="colour" label="Colour" />
      </RadioGroup>
    </Fieldset>
  ),
};
