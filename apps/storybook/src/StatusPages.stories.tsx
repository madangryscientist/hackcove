import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, ErrorPage, Forbidden, Maintenance, NotFound, Offline } from "@hackcove/ui-react";
import { DemoShell, layoutPage } from "./layout/DemoShell";

/** Whole pages for the states every site has. Each renders as the content of an AppShell, with fixed copy; `title` and the body can be overridden. */
const meta: Meta = {
  title: "Pages/Status pages",
  parameters: { layout: "fullscreen", bare: true },
  beforeEach: layoutPage,
};
export default meta;
type S = StoryObj;

export const NotFoundPage: S = {
  render: () => (
    <DemoShell>
      <NotFound />
    </DemoShell>
  ),
};

/** A designed 404: the large numeral above the title. */
export const NotFoundWithNumeral: S = {
  render: () => (
    <DemoShell>
      <NotFound numeral />
    </DemoShell>
  ),
};

/** A 404 with its own action, worded for what it does, before the "Back to home" link. */
export const NotFoundOwnAction: S = {
  render: () => (
    <DemoShell>
      <NotFound action={<Button href="#">Open the map</Button>} />
    </DemoShell>
  ),
};

export const ErrorWithRetry: S = {
  render: () => (
    <DemoShell>
      <ErrorPage detail="Request 4f2a91 failed: upstream timed out" onRetry={() => {}} />
    </DemoShell>
  ),
};

export const ErrorPlain: S = {
  render: () => (
    <DemoShell>
      <ErrorPage />
    </DemoShell>
  ),
};

export const OfflinePage: S = {
  render: () => (
    <DemoShell>
      <Offline onRetry={() => {}} />
    </DemoShell>
  ),
};

export const MaintenancePage: S = {
  render: () => (
    <DemoShell>
      <Maintenance>Back at 14:00 UTC. Your data is safe.</Maintenance>
    </DemoShell>
  ),
};

export const ForbiddenPage: S = {
  render: () => (
    <DemoShell>
      <Forbidden />
    </DemoShell>
  ),
};

export const CustomAction: S = {
  render: () => (
    <DemoShell>
      <Forbidden title="Members only" action={<Button>Request access</Button>}>
        Ask an owner of this organisation to invite you.
      </Forbidden>
    </DemoShell>
  ),
};

/** A missing page is `NotFound`: the reader needs a way home, and a retry would load the same nothing. */
export const DoPickPage: S = {
  parameters: { bare: false },
  render: () => <NotFound />,
};

/** `ErrorPage` with a retry for a missing page promises that trying again helps, and it does not. */
export const DontPickPage: S = {
  parameters: { bare: false },
  render: () => <ErrorPage onRetry={() => {}} />,
};

/** `detail` is a request id or a short message the reader can quote, and `onRetry` offers another go. */
export const DoErrorDetail: S = {
  parameters: { bare: false },
  render: () => <ErrorPage detail="Request 4f2a91 failed: upstream timed out" onRetry={() => {}} />,
};

/** A stack trace shows the reader your internals and buries the one line they can act on. */
export const DontErrorDetail: S = {
  parameters: { bare: false },
  render: () => (
    <ErrorPage
      detail={
        "TypeError: Cannot read properties of undefined\n  at loadBuild (build.ts:42:9)\n" +
        "  at async handler (route.ts:17:3)"
      }
      onRetry={() => {}}
    />
  ),
};

/** Without an AppShell: in a Container, as the whole page. */
export const Standalone: S = {
  parameters: { bare: false },
  render: () => <NotFound />,
};
