import type { ReactElement, ReactNode } from "react";
import { Button } from "./Button.js";
import { ButtonLink } from "./ButtonLink.js";
import { CodeBlock } from "./CodeBlock.js";
import { type LinkRender } from "./link.js";
import { CenteredLayout } from "./PageLayouts.js";

// Whole pages for the states every site has: not found, failed, offline, down for maintenance,
// not allowed. Each is a CenteredLayout card with fixed copy, so they look the same on every site
// and in every theme. Render one as the content of an AppShell, or on its own in a Container.

type StatusPageProps = {
  /** Replaces the default heading. */
  title?: ReactNode;
  /** Replaces the default body copy. */
  children?: ReactNode;
  /** The primary action; the home link turns outline beside it. */
  action?: ReactNode;
  /** Adds a "Back to home" button linking here. With neither this nor `renderHome` there is no home link. */
  homeHref?: string;
  /** Draws the home link with the app's own router `<Link>`, as on `ButtonLink`. */
  renderHome?: LinkRender;
};

type Copy = { title: string; body: string };

function homeLink(
  variant: "primary" | "outline",
  href: string | undefined,
  render: LinkRender | undefined,
): ReactNode {
  if (render) {
    return (
      <ButtonLink render={render} variant={variant}>
        Back to home
      </ButtonLink>
    );
  }
  if (href === undefined) return null;
  return (
    <ButtonLink href={href} variant={variant}>
      Back to home
    </ButtonLink>
  );
}

function StatusPage({
  copy,
  title,
  children,
  action,
  homeHref,
  renderHome,
  extra,
}: StatusPageProps & { copy: Copy; extra?: ReactNode }): ReactElement {
  const home = homeLink(action === undefined ? "primary" : "outline", homeHref, renderHome);
  return (
    <CenteredLayout title={title ?? copy.title} subtitle={children ?? copy.body}>
      {extra}
      {(action || home) && (
        <div className="flex flex-wrap items-center gap-2">
          {action}
          {home}
        </div>
      )}
    </CenteredLayout>
  );
}

const retry = (onRetry: (() => void) | undefined): ReactNode =>
  onRetry && <Button onClick={onRetry}>Try again</Button>;

/** 404: the page is not there. */
export function NotFound(props: StatusPageProps): ReactElement {
  return (
    <StatusPage
      copy={{
        title: "Page not found",
        body: "The page you are looking for does not exist or has moved.",
      }}
      {...props}
    />
  );
}

/**
 * 500 or any failure. `detail` is the error text, shown in a `CodeBlock` under the copy; pass it
 * only where a reader may see it (a request id, a message), never a stack trace. `onRetry` adds a
 * "Try again" button, unless `action` replaces it.
 */
export function ErrorPage({
  detail,
  onRetry,
  action,
  ...props
}: StatusPageProps & {
  detail?: string;
  onRetry?: () => void;
}): ReactElement {
  return (
    <StatusPage
      copy={{
        title: "Something went wrong",
        body: "An error stopped this page from loading. You can try again.",
      }}
      action={action ?? retry(onRetry)}
      extra={detail && <CodeBlock label="Error">{detail}</CodeBlock>}
      {...props}
    />
  );
}

/** The device has no connection. `onRetry` adds a "Try again" button, unless `action` replaces it. */
export function Offline({
  onRetry,
  action,
  ...props
}: StatusPageProps & { onRetry?: () => void }): ReactElement {
  return (
    <StatusPage
      copy={{
        title: "You are offline",
        body: "Check your connection and try again.",
      }}
      action={action ?? retry(onRetry)}
      {...props}
    />
  );
}

/** The site is down on purpose and will be back. */
export function Maintenance(props: StatusPageProps): ReactElement {
  return (
    <StatusPage
      copy={{
        title: "Down for maintenance",
        body: "We are making improvements and will be back shortly.",
      }}
      {...props}
    />
  );
}

/** 403: signed in, or not, but not allowed here. */
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
