import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button, Dialog, Lightbox } from "@hackcove/ui";
import { sampleScenes } from "./sampleScene";

const meta: Meta = { title: "UI/Lightbox" };
export default meta;
type S = StoryObj;

/** Three photos to step through, open on the first. Esc, the scrim or the close button closes it; the button opens it again. */
function Photos() {
  const [at, setAt] = useState<number | null>(0);
  const photo = at === null ? undefined : sampleScenes[at];
  return (
    <div className="p-6">
      <Button variant="outline" onClick={() => setAt(0)}>
        View photos
      </Button>
      {at !== null && photo && (
        <Lightbox
          label={`Photo ${at + 1} of ${sampleScenes.length}`}
          title="Anna"
          meta={`Today, 09:1${at} · ${at + 1} of ${sampleScenes.length}`}
          caption={photo.caption}
          onClose={() => setAt(null)}
          onPrevious={at > 0 ? () => setAt(at - 1) : undefined}
          onNext={at < sampleScenes.length - 1 ? () => setAt(at + 1) : undefined}
        >
          <img src={photo.src} alt={photo.alt} />
        </Lightbox>
      )}
    </div>
  );
}

/** Open on a photo with its title, meta and caption, and a next step (the first photo has no previous). */
export const Default: S = { render: () => <Photos /> };

/** The media alone: no text, no steps, just the close button. */
export const MediaOnly: S = {
  render: () => {
    const [open, setOpen] = useState(true);
    const photo = sampleScenes[1];
    return (
      <div className="p-6">
        <Button variant="outline" onClick={() => setOpen(true)}>
          View photo
        </Button>
        {open && photo && (
          <Lightbox label={photo.alt} onClose={() => setOpen(false)}>
            <img src={photo.src} alt={photo.alt} />
          </Lightbox>
        )}
      </div>
    );
  },
};

/** A photo or a video opens in a Lightbox: full screen, on its own dark scrim, with steps between items. */
export const DoViewer: S = {
  render: () => {
    const [at, setAt] = useState<number | null>(null);
    const photo = at === null ? undefined : sampleScenes[at];
    return (
      <>
        <Button variant="outline" onClick={() => setAt(0)}>
          View photos
        </Button>
        {at !== null && photo && (
          <Lightbox
            label={photo.alt}
            title="Anna"
            caption={photo.caption}
            onClose={() => setAt(null)}
            onPrevious={at > 0 ? () => setAt(at - 1) : undefined}
            onNext={at < sampleScenes.length - 1 ? () => setAt(at + 1) : undefined}
          >
            <img src={photo.src} alt={photo.alt} />
          </Lightbox>
        )}
      </>
    );
  },
};

/** A Dialog is for a question: its panel boxes a photo in at a form's width, on the theme's light surface. */
export const DontViewer: S = {
  render: () => {
    const [open, setOpen] = useState(false);
    const photo = sampleScenes[0];
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          View photo
        </Button>
        {open && photo && (
          <Dialog title="Anna" onClose={() => setOpen(false)}>
            <img src={photo.src} alt={photo.alt} />
          </Dialog>
        )}
      </>
    );
  },
};
