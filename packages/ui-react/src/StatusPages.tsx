import type { ReactElement, ReactNode } from "react";
import { Button } from "./Button.js";
import { CodeBlock } from "./CodeBlock.js";
import { useHome } from "./link.js";
import { CenteredLayout } from "./PageLayouts.js";
import type { Passthrough } from "./props.js";

// Whole pages for the states every site has: not found, failed, offline, down for maintenance,
// not allowed. Each is a CenteredLayout card with fixed copy, so they look the same on every site
// and in every theme. Render one as the content of an AppShell, or on its own in a Container.

type StatusPageProps = {
  /** Replaces the default heading. */
  title?: ReactNode;
  /** Replaces the default body copy. */
  children?: ReactNode;
  /**
   * The page's own buttons, before "Back to home", which turns outline beside them. This is the one
   * way to a button worded differently; there is no label prop.
   */
  actions?: ReactNode;
} & Passthrough;

type Copy = { title: string; body: string };

type StatusPageInner = StatusPageProps & {
  copy: Copy;
  extra?: ReactNode;
  mark?: ReactNode;
  /** Whether the page links home. Fixed per page: only `Maintenance` does not. */
  homeward?: boolean;
};

/** "Back to home", to the `LinkProvider`'s `home`: the primary button alone, outline after the page's actions. */
function HomeLink({ outline }: { outline: boolean }): ReactElement {
  return (
    <Button href={useHome()} variant={outline ? "outline" : "primary"}>
      Back to home
    </Button>
  );
}

function StatusPage({
  copy,
  title,
  children,
  actions,
  extra,
  mark,
  homeward = true,
  ...rest
}: StatusPageInner): ReactElement {
  const home = homeward && <HomeLink outline={Boolean(actions)} />;
  return (
    <CenteredLayout
      {...rest}
      mark={mark}
      title={title ?? copy.title}
      description={children ?? copy.body}
    >
      {extra}
      {(actions || home) && (
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          {home}
        </div>
      )}
    </CenteredLayout>
  );
}

const retry = (onRetry: (() => void) | undefined): ReactNode =>
  onRetry && <Button onClick={onRetry}>Try again</Button>;

/**
 * 404: the page is not there. `numeral` draws a large "404" above the title, for a site whose 404
 * is a designed page; the digits are fixed. Off, the page is the title and copy alone.
 */
export function NotFound({
  numeral = false,
  ...props
}: StatusPageProps & {
  /** Draws a large "404" above the title. Off by default. The digits are fixed: there is no text prop. */
  numeral?: boolean | undefined;
}): ReactElement {
  return (
    <StatusPage
      copy={{
        title: "Page not found",
        body: "The page you are looking for does not exist or has moved.",
      }}
      mark={
        numeral ? (
          <p className="text-6xl font-semibold tracking-tight text-violet-600">404</p>
        ) : undefined
      }
      {...props}
    />
  );
}

/**
 * 500 or any failure. `detail` is the error text, shown in a `CodeBlock` under the copy; pass it
 * only where a reader may see it (a request id, a message), never a stack trace. `onRetry` adds a
 * "Try again" button, unless `actions` replaces it.
 */
export function ErrorPage({
  detail,
  onRetry,
  actions,
  ...props
}: StatusPageProps & {
  /** The error text, in a `CodeBlock` under the copy: a request id or a message a reader may see, never a stack trace. */
  detail?: string;
  /** Adds a "Try again" button that calls it, unless `actions` replaces the button. */
  onRetry?: () => void;
}): ReactElement {
  return (
    <StatusPage
      copy={{
        title: "Something went wrong",
        body: "An error stopped this page from loading. You can try again.",
      }}
      actions={actions ?? retry(onRetry)}
      extra={detail && <CodeBlock label="Error">{detail}</CodeBlock>}
      {...props}
    />
  );
}

/** The device has no connection. `onRetry` adds a "Try again" button, unless `actions` replaces it. */
export function Offline({
  onRetry,
  actions,
  ...props
}: StatusPageProps & {
  /** Adds a "Try again" button that calls it, unless `actions` replaces the button. */
  onRetry?: () => void;
}): ReactElement {
  return (
    <StatusPage
      copy={{
        title: "You are offline",
        body: "Check your connection and try again.",
      }}
      actions={actions ?? retry(onRetry)}
      {...props}
    />
  );
}

/**
 * The site is down on purpose and will be back: the page for planned downtime, such as an upgrade.
 * A failure is an `ErrorPage`, and no connection is `Offline`. It has no "Back to home": home is
 * the site that is down.
 */
export function Maintenance(props: StatusPageProps): ReactElement {
  return (
    <StatusPage
      homeward={false}
      copy={{
        title: "Down for maintenance",
        body: "We are making improvements and will be back shortly.",
      }}
      {...props}
    />
  );
}

/**
 * 403: signed in, or not, but not allowed here. The page for a route that exists and the reader may
 * not see; a route that is not there is a `NotFound`.
 */
export function Forbidden(props: StatusPageProps): ReactElement {
  return (
    <StatusPage
      copy={{
        title: "Access denied",
        body: "You do not have permission to view this page.",
      }}
      {...props}
    />
  );
}
