import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Video } from "./Video.js";

describe("Video", () => {
  it("renders a full-width, rounded video with controls that loads metadata only", () => {
    const out = renderToStaticMarkup(<Video src="/intro.mp4" />);
    expect(out.startsWith("<video")).toBe(true);
    expect(out).toContain("controls");
    expect(out).toContain('preload="metadata"');
    expect(out).toContain('src="/intro.mp4"');
    expect(out).toContain("w-full rounded-lg");
    expect(out).not.toContain("<track");
  });

  it("adds the poster, a default captions track and the fallback children", () => {
    const out = renderToStaticMarkup(
      <Video src="/intro.mp4" poster="/intro.jpg" captions="/intro.vtt">
        Your browser cannot play video.
      </Video>,
    );
    expect(out).toContain('poster="/intro.jpg"');
    expect(out).toContain('<track kind="captions" src="/intro.vtt" default=""/>');
    expect(out).toContain("Your browser cannot play video.");
  });
});
