import type { Meta, StoryObj } from "@storybook/react-vite";
import { Body, Callout, Disclosure, Stack } from "@hackcove/ui";

const meta: Meta = { title: "UI/Disclosure" };
export default meta;
type S = StoryObj;

export const Closed: S = {
  render: () => (
    <Disclosure summary="Override trail">
      <Body>Three overrides, the latest on Tuesday.</Body>
    </Disclosure>
  ),
};
/** `defaultOpen` starts it with the body showing; it then closes and opens like any other. */
export const Open: S = {
  render: () => (
    <Disclosure summary="Override trail" defaultOpen>
      <Body>Three overrides, the latest on Tuesday.</Body>
    </Disclosure>
  ),
};
/** The summary is any inline content, and the body any parts. */
export const RichBody: S = {
  render: () => (
    <Disclosure summary="Shipping and returns" defaultOpen>
      <Stack gap="sm">
        <Body>Posted within two working days.</Body>
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
        <Body>A hold keeps an item for you for an hour.</Body>
      </Disclosure>
      <Disclosure summary="How do I cancel?">
        <Body>Open the order and choose Cancel.</Body>
      </Disclosure>
      <Disclosure summary="Can I change the address?">
        <Body>Until the order has been posted.</Body>
      </Disclosure>
    </Stack>
  ),
};

/** Detail the person may not need, behind a summary that says what it is, is a `Disclosure`. */
export const DoSecondary: S = {
  render: () => (
    <Stack gap="xs">
      <Body>Order 1042 was posted on Monday.</Body>
      <Disclosure summary="Tracking history">
        <Body>Posted Monday · Sorted Tuesday · Out for delivery Wednesday.</Body>
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
