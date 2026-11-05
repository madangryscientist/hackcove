import type { ComponentPage } from "./types";

/** The pages for pictures: they sit in the Content section of the rail, after Video. */
export const mediaPages: ComponentPage[] = [
  {
    slug: "image",
    name: "Image",
    summary: "A picture in a fixed shape, with a placeholder if it is missing.",
    whenToUse: "Showing a picture that your app serves: a screenshot, a QR code, a product shot.",
    pairs: ["Image/Fit"],
    usage: [
      "`src` is your own picture, a local path or a data URL, and `alt` says what it shows. The corners are rounded and a hairline frames it on the inset surface.",
      "`aspect` is the shape it is cropped to: `square`, `4:3` (the default), `3:2`, `16:9`, or the portrait `3:4` and `9:16`. The shape is reserved before the picture loads, so the page does not jump. `natural` is the exception: the picture keeps its own proportions, with nothing cropped, and the space is not reserved until it loads.",
      '`fit="cover"` (the default) fills the shape and crops what overflows. `fit="contain"` shows the whole picture, for a QR code or a logo that must not lose its edges.',
      "`framed` sets the picture on a white mat with padding and shows all of it. The mat is white in every theme, dark ones included, so a QR code scans off a dark page. Use it for a code, not for a photo.",
      "`width` is `sm` (96px), `md` (160px) or `lg` (256px), each a cap that a narrower parent still wins over, or `full` (the default) for the parent's width.",
      "With no `src`, or one that fails to load, a placeholder of the same size with a picture mark takes its place. A new `src` tries again.",
      "A person's photo is an `Avatar`; a clickable thumbnail with a label is a `MediaTile`; a video is a `Video`.",
    ],
    accessibility: [
      'An `<img>` named by `alt`. The placeholder is a `role="img"` with the same `alt`, so a missing picture is still announced.',
      "An empty `alt` marks the picture as decoration: it is hidden from a screen reader, placeholder included. Do that only when the text beside it says the same thing.",
    ],
    api: ["Image"],
  },
  {
    slug: "media-tile",
    name: "MediaTile",
    summary: "A thumbnail with a label and a caption, that can open a Lightbox.",
    whenToUse:
      "A photo or video in a grid or a strip, that opens full size when it is picked: a status, a gallery, an attachment.",
    pairs: ["MediaTile/Viewer"],
    usage: [
      "`src` and `alt` are the thumbnail, cropped to `aspect` (portrait `3:4` by default; `natural` shows the picture whole at its own proportions, as a chat does) at `width` (`md`, 160px, by default; `full` fills a grid cell).",
      '`label` is a short line on the picture\'s bottom edge, on the same near-black scrim as the `Lightbox`, in every theme: who posted it, or "Earlier". `caption` is muted text under the picture, such as when.',
      "`video` draws a play mark; say it is a video in `alt` too.",
      "`onRemove` adds a round remove button on the picture's corner, named \"Remove\" and `alt`: a photo attached to a form, until it is sent. It is its own button beside the tile's, so the tile can still open a `Lightbox`.",
      "`onClick` makes the whole tile one button. Open a `Lightbox` from it, and keep the open item in your own state. Without `onClick` the tile is a plain block.",
      'With no `src`, the tile shows the `Image` placeholder, so a tile that is only a label ("Earlier") needs no picture.',
      "A row of tiles that runs past the page is a `ScrollStrip`; a wrapping grid is a `CardGrid`.",
    ],
    accessibility: [
      'A tile with `onClick` is a real `<button type="button">` named by `alt` and `label`, with the focus ring from the component; Enter and Space open it.',
      "The play mark is decorative and hidden from a screen reader.",
      "`id`, `data-*` and `aria-*` go on the tile.",
    ],
    api: ["MediaTile"],
  },
  {
    slug: "scroll-strip",
    name: "ScrollStrip",
    summary: "One row of tiles or avatars that scrolls sideways.",
    whenToUse:
      "A row of media or people that is longer than the page is wide: recent statuses, a team.",
    pairs: ["ScrollStrip/Row"],
    usage: [
      "Put `MediaTile`s or `Avatar`s as the children and name the strip with `label`. They keep their own width and never shrink or wrap.",
      "`gap` is a `Cluster`'s: `xs`, `sm` (the default) or `md`.",
      "It scrolls only when the items run past its width, with a thin themed scrollbar, and the items snap to the start edge.",
      "Do not use it for a few items that fit: that is a `Cluster`. A grid that wraps is a `CardGrid`.",
    ],
    accessibility: [
      'A `role="group"` named by `label`. It takes keyboard focus (`tabindex="0"`) with a focus ring, so the arrow keys scroll it without a pointer.',
      "`id`, `data-*` and `aria-*` go on the strip.",
    ],
    api: ["ScrollStrip"],
  },
];
