import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination } from "@slashsuite/ui-react";

const meta: Meta = { title: "Navigation/Pagination" };
export default meta;
type S = StoryObj;

const pageHref = (page: number) => `#page-${page}`;

/** The first page: Previous is plain text, not a link, and the window runs to page 5. */
export const FirstPage: S = {
  render: () => <Pagination label="Pages" page={1} pageCount={20} pageHref={pageHref} />,
};

/** A middle page: the first and last page, the current one and its neighbours, and a gap each side. */
export const MiddlePage: S = {
  render: () => <Pagination label="Pages" page={10} pageCount={20} pageHref={pageHref} />,
};

/** The last page: Next is plain text, and the window runs back to page 16. */
export const LastPage: S = {
  render: () => <Pagination label="Pages" page={20} pageCount={20} pageHref={pageHref} />,
};

/** Seven pages or fewer show every page, with no gap. */
export const FewPages: S = {
  render: () => <Pagination label="Pages" page={3} pageCount={7} pageHref={pageHref} />,
};

/** Below `sm` the numbers give way to the summary, "Page 4 of 12", between Previous and Next. */
export const PhoneSummary: S = {
  globals: { viewport: { value: "phone", isRotated: false } },
  render: () => <Pagination label="Pages" page={4} pageCount={12} pageHref={pageHref} />,
};
