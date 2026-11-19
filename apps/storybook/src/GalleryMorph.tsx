import { useId, useState } from "react";
import { Button, Card, CardGrid, Morph, startPageTransition, Text } from "@slashsuite/ui-react";

const items = [
  { id: "one", title: "Shop one", text: "Denim and boots." },
  { id: "two", title: "Shop two", text: "Books and records." },
];

/** The Morph block of the Gallery: two cards, and the one pressed grows into its detail. */
export function GalleryMorph() {
  const [open, setOpen] = useState<string | undefined>(undefined);
  // Overview / All themes draws the Gallery once per theme in one document: each needs its own pair.
  const id = useId();
  const shown = items.find((i) => i.id === open);
  return (
    <div className="max-w-xl">
      {shown ? (
        <Morph name="gallery" item={`${id}${shown.id}`}>
          <Card
            title={shown.title}
            size="lg"
            footer={
              <Button
                variant="outline"
                onClick={() => startPageTransition(() => setOpen(undefined))}
              >
                Back
              </Button>
            }
          >
            <Text>{shown.text}</Text>
          </Card>
        </Morph>
      ) : (
        <CardGrid columns={2}>
          {items.map((i) => (
            <Morph key={i.id} name="gallery" item={`${id}${i.id}`}>
              <Card
                title={i.title}
                footer={
                  <Button
                    variant="outline"
                    onClick={() => startPageTransition(() => setOpen(i.id))}
                  >
                    Open {i.title}
                  </Button>
                }
              >
                <Text tone="muted">{i.text}</Text>
              </Card>
            </Morph>
          ))}
        </CardGrid>
      )}
    </div>
  );
}
