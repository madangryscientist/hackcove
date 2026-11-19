import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, Card, ListRow } from "@slashsuite/ui-react";

const meta: Meta = { title: "Data/ListRow" };
export default meta;
type S = StoryObj;

/** `disabledReason` on a button row: it dims and does nothing, stays in the tab order, and the reason is its tooltip. */
export const DoDisabledReason: S = {
  render: () => (
    <Card flush>
      <ListRow onClick={() => undefined} trailing="R 1 850">
        Rent
      </ListRow>
      <ListRow
        divided
        onClick={() => undefined}
        trailing="R 640"
        disabledReason="Paid by the landlord this month"
      >
        Water
      </ListRow>
    </Card>
  ),
};

/** A row that silently ignores its click leaves the person tapping it again. */
export const DontDisabledReason: S = {
  render: () => (
    <Card flush>
      <ListRow onClick={() => undefined} trailing="R 1 850">
        Rent
      </ListRow>
      <ListRow divided onClick={() => undefined} trailing="R 640">
        Water
      </ListRow>
    </Card>
  ),
};

/** While `loading`, what a row has is drawn and an empty label is a bone. */
export const Loading: StoryObj<{ loading: boolean }> = {
  args: { loading: true },
  render: ({ loading }) => (
    <Card flush>
      <ListRow loading={loading} trailing="Today">
        {loading ? null : "Cove Hardware"}
      </ListRow>
      <ListRow loading={loading} divided leading={<Avatar name={loading ? "" : "Mia Botha"} />}>
        {loading ? null : "Mia Botha"}
      </ListRow>
    </Card>
  ),
};
