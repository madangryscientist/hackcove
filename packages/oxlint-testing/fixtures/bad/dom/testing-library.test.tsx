import { render, screen, waitFor } from "@testing-library/react";
import { expect, test } from "vitest";

test("walks the DOM", async () => {
  const { container } = render(<a href="/">Home</a>);
  expect(container.querySelector("a")).toBeTruthy(); // expect: testing-library/no-container testing-library/no-node-access
  expect(screen.getByRole("link").parentElement).toBeTruthy(); // expect: testing-library/no-node-access
  const view = render(<p>Hi</p>);
  expect(view.getByText("Hi")).toBeTruthy(); // expect: testing-library/prefer-screen-queries
  await waitFor(() => {
    render(<p>Again</p>); // expect: testing-library/no-wait-for-side-effects
  });
});
