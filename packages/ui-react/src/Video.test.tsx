// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { render, screen } from "./render.harness.js";
import { Video } from "./Video.js";

/** A video has no role; the test names it, as a page would when it has no caption beside it. */
const video = () => screen.getByLabelText<HTMLVideoElement>("Intro");

describe("Video", () => {
  it("shows the browser's controls and loads metadata only", () => {
    render(<Video src="/intro.mp4" aria-label="Intro" />);
    expect(video().controls).toBe(true);
    expect(video().preload).toBe("metadata");
    expect(video().getAttribute("src")).toBe("/intro.mp4");
  });

  it("adds the poster and the fallback children", () => {
    render(
      <Video src="/intro.mp4" poster="/intro.jpg" aria-label="Intro">
        Your browser cannot play video.
      </Video>,
    );
    expect(video().getAttribute("poster")).toBe("/intro.jpg");
    expect(screen.getByText("Your browser cannot play video.")).toBeInstanceOf(HTMLElement);
  });

  // A <track> has no role, name or text, and jsdom has no `textTracks`, so its markup is read as
  // data: the captions file is a default captions track, and there is none without one.
  it("adds a default captions track only when given captions", () => {
    expect(renderToStaticMarkup(<Video src="/intro.mp4" captions="/intro.vtt" />)).toContain(
      '<track kind="captions" src="/intro.vtt" default=""/>',
    );
    expect(renderToStaticMarkup(<Video src="/intro.mp4" />)).not.toContain("<track");
  });
});
