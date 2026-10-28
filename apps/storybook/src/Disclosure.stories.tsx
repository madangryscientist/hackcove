import type { Meta, StoryObj } from "@storybook/react-vite";
import { Callout, Disclosure, Stack, Text } from "@hackcove/ui";

const meta: Meta = { title: "UI/Disclosure" };
export default meta;
type S = StoryObj;

export const Closed: S = {
  render: () => (
    <Disclosure summary="Override trail">
      <Text>Three overrides, the latest on Tuesday.</Text>
    </Disclosure>
  ),
};
/** `defaultOpen` starts it with the body showing; it then closes and opens like any other. */
export const Open: S = {
  render: () => (
    <Disclosure summary="Override trail" defaultOpen>
      <Text>Three overrides, the latest on Tuesday.</Text>
    </Disclosure>
  ),
};
/** The summary is any inline content, and the body any parts. */
export const RichBody: S = {
  render: () => (
    <Disclosure summary="Shipping and returns" defaultOpen>
      <Stack gap="sm">
        <Text>Posted within two working days.</Text>
        <Callout tone="info">Returns are free for thirty days.</Callout>
      </Stack>
    </Disclosure>
  ),
};
/** Several in a column are independent: each keeps its own state. */
export const Several: S = {
  render: () => (
    <Stack gap="xs">
      <Disclosure summary="What is a hold?" defaultOpen>
        <Text>A hold keeps an item for you for an hour.</Text>
      </Disclosure>
      <Disclosure summary="How do I cancel?">
        <Text>Open the order and choose Cancel.</Text>
      </Disclosure>
      <Disclosure summary="Can I change the address?">
        <Text>Until the order has been posted.</Text>
      </Disclosure>
    </Stack>
  ),
};

/** Detail the person may not need, behind a summary that says what it is, is a `Disclosure`. */
export const DoSecondary: S = {
  render: () => (
    <Stack gap="xs">
      <Text>Order 1042 was posted on Monday.</Text>
      <Disclosure summary="Tracking history">
        <Text>Posted Monday · Sorted Tuesday · Out for delivery Wednesday.</Text>
      </Disclosure>
    </Stack>
  ),
};

/** What the person must read to carry on, such as an error, is in view: a `Callout`, not a `Disclosure`. */
export const DoEssential: S = {
  render: () => (
    <Callout tone="danger">Your payment was declined. Your order is not placed.</Callout>
  ),
};

/** What the person must read to carry on, such as an error, is not hidden behind a summary: show it. */
export const DontEssential: S = {
  render: () => (
    <Disclosure summary="Details">
      <Callout tone="danger">Your payment was declined. Your order is not placed.</Callout>
    </Disclosure>
  ),
};
