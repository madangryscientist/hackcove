import { LOGO_PATH } from "../content/logo";
import { site } from "../content/site";

/**
 * The Hack Cove pixel wordmark (HC-144). It is one fixed blue in every theme: global.css defines
 * `--logo` (#4f86f7) on `:root`, which the ink and the halo take through `currentColor`. It is the site's
 * brand mark, not a palette utility, so no theme remaps it. A blurred copy
 * sits behind the crisp logo and breathes (`.logo-glow`: opacity and scale only, still under
 * prefers-reduced-motion). The accessible name is the site name; the halo is hidden from assistive tech.
 */
export function Logo() {
  return (
    <span className="logo relative inline-flex h-5">
      <svg
        className="logo-glow absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 89 16"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <defs>
          <filter id="logo-halo" x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" />
          </filter>
        </defs>
        <path fill="currentColor" d={LOGO_PATH} filter="url(#logo-halo)" />
      </svg>
      <svg
        className="relative h-full w-auto"
        viewBox="0 0 89 16"
        shapeRendering="crispEdges"
        role="img"
        aria-label={site.name}
      >
        <path fill="currentColor" d={LOGO_PATH} />
      </svg>
    </span>
  );
}
