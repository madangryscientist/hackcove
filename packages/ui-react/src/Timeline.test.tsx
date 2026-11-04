import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Timeline, TimelineItem } from "./Timeline.js";

describe("Timeline", () => {
  it("is a named ordered list of items", () => {
    const out = renderToStaticMarkup(
      <Timeline label="Status history">
        <TimelineItem title="Sent" />
        <TimelineItem title="Accepted" />
      </Timeline>,
    );
    expect(out).toContain('<ol aria-label="Status history"');
    expect(out.match(/<li /g)).toHaveLength(2);
  });

  it("draws `empty` instead of an empty list, or nothing", () => {
    expect(renderToStaticMarkup(<Timeline label="History" empty={<p>No history.</p>} />)).toBe(
      "<p>No history.</p>",
    );
    expect(renderToStaticMarkup(<Timeline label="History" />)).toBe("");
    expect(
      renderToStaticMarkup(
        <Timeline label="History" empty="none">
          {[]}
        </Timeline>,
      ),
    ).toBe("none");
  });
});

describe("TimelineItem", () => {
  it("lays out the title, the time and the note", () => {
    const out = renderToStaticMarkup(
      <ol>
        <TimelineItem title="Accepted" time="12 Oct 2026, 09:14">
          Client confirmed by phone.
        </TimelineItem>
      </ol>,
    );
    expect(out).toContain(">Accepted</span>");
    expect(out).toContain("tabular-nums");
    expect(out).toContain(">12 Oct 2026, 09:14</span>");
    expect(out).toContain("Client confirmed by phone.");
  });

  it("leaves out the time and the note when not given; the rail dot is hidden from assistive tech", () => {
    const out = renderToStaticMarkup(
      <ol>
        <TimelineItem title="Sent" />
      </ol>,
    );
    expect(out).not.toContain("tabular-nums");
    expect(out).not.toContain("mt-1");
    expect(out).toContain('aria-hidden="true"');
  });
});

const dot = (tone: "info" | "positive" | "warn" | "danger") =>
  renderToStaticMarkup(<TimelineItem title="x" tone={tone} />);

describe("TimelineItem tone", () => {
  it("defaults to the neutral ring", () => {
    expect(renderToStaticMarkup(<TimelineItem title="Sent" />)).toContain(
      "border-slate-300 bg-white",
    );
  });

  it("colours the dot with the Callout's tones", () => {
    expect(dot("danger")).toContain("bg-current text-red-700");
  });
});
