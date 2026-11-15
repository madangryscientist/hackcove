import { expect, test } from "vitest";
import { render, screen } from "../../shared/harness.js";

test("walks the DOM through a local harness", () => {
  render(
    <ul>
      <li id="first">
        <a href="/">Home</a>
      </li>
    </ul>,
  );
  expect(document.querySelector("a")).toBeTruthy(); // expect: ui-testing/no-node-access
  expect(screen.getByRole("link").parentElement).toBeTruthy(); // expect: ui-testing/no-node-access
  expect(screen.getByRole("link").closest("ul")).toBeTruthy(); // expect: ui-testing/no-node-access
  const row = screen.getByRole("link").closest("li"); // expect: ui-testing/no-node-access
  expect(row).toBeTruthy();
  expect(document.getElementById("first")).toBe(row); // expect: ui-testing/no-node-access
  screen.getByRole("link").click(); // expect: ui-testing/no-node-access
});
