// @vitest-environment jsdom
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { Avatar } from "./Avatar.js";
import { Button } from "./Button.js";
import { ButtonLink } from "./ButtonLink.js";
import { Card } from "./Card.js";
import { Checkbox } from "./Checkbox.js";
import { Cluster } from "./Cluster.js";
import { ColourSchemeToggle } from "./ColourSchemeToggle.js";
import { DateField } from "./DateField.js";
import { DatePicker } from "./DatePicker.js";
import { Dialog } from "./Dialog.js";
import { mount, unmount } from "./dom.harness.js";
import { FileDrop } from "./FileDrop.js";
import { IconButton } from "./IconButton.js";
import { Input } from "./Input.js";
import { ListRow } from "./ListRow.js";
import { NavTabs } from "./NavTabs.js";
import { Radio, RadioGroup } from "./RadioGroup.js";
import { SearchInput } from "./SearchInput.js";
import { SegmentedControl } from "./SegmentedControl.js";
import { Select } from "./Select.js";
import type { Size } from "./size.js";
import { Section, Stack } from "./Stack.js";
import { Tabs } from "./Tabs.js";
import { Textarea } from "./Textarea.js";
import { TextLink } from "./TextLink.js";
import { ToggleChip } from "./ToggleChip.js";
import { SubsectionHeading } from "./typography.js";

afterEach(unmount);

const items = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
];

// A size prop, or none at all (exactOptionalPropertyTypes takes no explicit undefined).
const at = (size?: Size) => (size ? { size } : {});

// Each sized component, drawn at a size (or with none), and a class only that size carries.
const sized: [string, (size?: Size) => ReactElement, Record<Size, string>][] = [
  [
    "Button",
    (size) => <Button {...at(size)}>Go</Button>,
    { sm: "px-2.5 py-1", md: "px-4 py-2", lg: "px-5 py-2.5" },
  ],
  [
    "ButtonLink",
    (size) => (
      <ButtonLink href="/a" {...at(size)}>
        Go
      </ButtonLink>
    ),
    { sm: "px-2.5 py-1", md: "px-4 py-2", lg: "px-5 py-2.5" },
  ],
  [
    "Input",
    (size) => <Input aria-label="x" {...at(size)} />,
    { sm: "py-1 text-xs", md: "py-2 text-sm", lg: "py-2.5 text-base" },
  ],
  [
    "Select",
    (size) => (
      <Select aria-label="x" {...at(size)}>
        <option>a</option>
      </Select>
    ),
    { sm: "py-1 text-xs", md: "py-2 text-sm", lg: "py-2.5 text-base" },
  ],
  [
    "Textarea",
    (size) => <Textarea aria-label="x" {...at(size)} />,
    { sm: "py-1 text-xs", md: "py-2 text-sm", lg: "py-2.5 text-base" },
  ],
  [
    "SearchInput",
    (size) => <SearchInput aria-label="x" {...at(size)} />,
    { sm: "pl-2 pr-7", md: "pl-3 pr-9", lg: "pl-4 pr-11" },
  ],
  [
    "Checkbox",
    (size) => <Checkbox label="x" {...at(size)} />,
    { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" },
  ],
  [
    "IconButton",
    (size) => (
      <IconButton label="x" {...at(size)}>
        x
      </IconButton>
    ),
    { sm: "size-6.5", md: "size-9.5", lg: "size-11.5" },
  ],
  [
    "ColourSchemeToggle",
    (size) => <ColourSchemeToggle {...at(size)} />,
    { sm: "size-6.5", md: "size-9.5", lg: "size-11.5" },
  ],
  [
    "SegmentedControl",
    (size) => (
      <SegmentedControl items={items} value="a" label="x" onChange={() => {}} {...at(size)} />
    ),
    { sm: "px-2.5 py-1 text-xs", md: "px-3 py-2 text-sm", lg: "px-4 py-2.5 text-base" },
  ],
  [
    "Tabs pill",
    (size) => (
      <Tabs variant="pill" items={items} value="a" label="x" onChange={() => {}} {...at(size)} />
    ),
    { sm: "px-2.5 py-1 text-xs", md: "px-3 py-2 text-sm", lg: "px-4 py-2.5 text-base" },
  ],
  [
    "NavTabs",
    (size) => <NavTabs items={[{ label: "A", href: "/a" }]} label="x" {...at(size)} />,
    { sm: "px-2.5 py-1 text-xs", md: "px-3 py-2 text-sm", lg: "px-4 py-2.5 text-base" },
  ],
  [
    "Card",
    (size) => (
      <Card title="x" {...at(size)}>
        body
      </Card>
    ),
    { sm: "p-3", md: "p-5", lg: "p-6" },
  ],
  [
    "ListRow",
    (size) => <ListRow {...at(size)}>x</ListRow>,
    { sm: "px-3 py-2", md: "px-4 py-3", lg: "px-5 py-4" },
  ],
  [
    "FileDrop",
    (size) => <FileDrop {...at(size)}>x</FileDrop>,
    { sm: "px-3 py-2", md: "px-4 py-6", lg: "px-5 py-8" },
  ],
  [
    "Avatar",
    (size) => <Avatar name="a" {...at(size)} />,
    { sm: "size-6", md: "size-8", lg: "size-10" },
  ],
  [
    "SubsectionHeading",
    (size) => <SubsectionHeading {...at(size)}>x</SubsectionHeading>,
    { sm: "text-sm/5", md: "text-base/6", lg: "text-lg/7" },
  ],
  [
    "Section gap",
    (size) => <Section gap={size}>x</Section>,
    { sm: "gap-4", md: "gap-6", lg: "gap-8" },
  ],
];

const SIZES = ["sm", "md", "lg"] as const;

const chip = (size?: Size) => (
  <ToggleChip pressed={false} onChange={() => {}} {...at(size)}>
    x
  </ToggleChip>
);

// The Dialog panel's own classes.
const panel = (size?: Size) => {
  const out = renderToStaticMarkup(
    <Dialog title="x" {...at(size)} onClose={() => {}}>
      body
    </Dialog>,
  );
  return /class="([^"]+)"/.exec(out)?.[1] ?? "";
};

describe("one size scale: sm, md and lg, md the default", () => {
  it.each(sized)("%s takes sm, md and lg, and is md with no size", (_, draw, classes) => {
    for (const size of SIZES) {
      const out = renderToStaticMarkup(draw(size));
      expect(out).toContain(classes[size]);
      for (const other of SIZES.filter((o) => o !== size))
        expect(out).not.toContain(classes[other]);
    }
    expect(renderToStaticMarkup(draw())).toBe(renderToStaticMarkup(draw("md")));
  });

  it("Stack's gap runs xs to xl, and xl is the old `section`", () => {
    expect(renderToStaticMarkup(<Stack gap="xl">x</Stack>)).toContain("gap-12 sm:gap-16");
  });

  it("Cluster's gap defaults to xs, its documented exception", () => {
    expect(renderToStaticMarkup(<Cluster>x</Cluster>)).toBe(
      renderToStaticMarkup(<Cluster gap="xs">x</Cluster>),
    );
  });

  it("ToggleChip defaults to sm, its documented exception, and takes md and lg", () => {
    expect(renderToStaticMarkup(chip())).toBe(renderToStaticMarkup(chip("sm")));
    expect(renderToStaticMarkup(chip("sm"))).toContain("px-2.5 py-1 text-xs");
    expect(renderToStaticMarkup(chip("md"))).toContain("px-3 py-2 text-sm");
    expect(renderToStaticMarkup(chip("lg"))).toContain("px-4 py-2.5 text-base");
  });

  it("TextLink inherits with no size, and pins sm, md or lg", () => {
    expect(renderToStaticMarkup(<TextLink href="/a">a</TextLink>)).not.toMatch(/text-(xs|sm|base)/);
    expect(
      renderToStaticMarkup(
        <TextLink href="/a" size="lg">
          a
        </TextLink>,
      ),
    ).toContain("text-base/6");
  });

  it("Dialog is md (w-110) by default, and lg is w-160", () => {
    expect(panel()).toContain("w-110");
    expect(panel("lg")).toContain("w-160");
    expect(panel("lg")).not.toContain("w-110");
  });
});

describe("sized react-aria controls", () => {
  it.each([
    ["sm", "h-3.5 w-3.5", "text-xs"],
    ["md", "h-4 w-4", "text-sm"],
    ["lg", "h-5 w-5", "text-base"],
  ] as const)("RadioGroup size %s gives every Radio a %s circle", (size, circle, text) => {
    const container = mount(
      <RadioGroup label="x" size={size}>
        <Radio value="a" label="A" />
      </RadioGroup>,
    );
    expect(container.innerHTML).toContain(circle);
    expect(container.innerHTML).toContain(text);
  });

  it("RadioGroup is md with no size", () => {
    const container = mount(
      <RadioGroup label="x">
        <Radio value="a" label="A" />
      </RadioGroup>,
    );
    expect(container.innerHTML).toContain("h-4 w-4");
  });

  it.each([
    [undefined, "py-2 pl-2.5 pr-2.5 text-sm"],
    ["sm", "py-1 pl-2 pr-2 text-xs"],
    ["lg", "py-2.5 pl-3 pr-3 text-base"],
  ] as const)("DateField size %s is %s", (size, cls) => {
    expect(mount(<DateField aria-label="x" {...at(size)} />).innerHTML).toContain(cls);
  });

  it.each([
    [undefined, "py-1 pl-2.5 pr-1 text-sm", "h-7 w-7"],
    ["sm", "py-0.5 pl-2 pr-0.5 text-xs", "h-5 w-5"],
    ["lg", "py-1.5 pl-3 pr-1.5 text-base", "h-8 w-8"],
  ] as const)("DatePicker size %s is %s with a %s button", (size, frame, button) => {
    const html = mount(<DatePicker aria-label="x" {...at(size)} />).innerHTML;
    expect(html).toContain(frame);
    expect(html).toContain(button);
  });
});
