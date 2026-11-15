import { test } from "@playwright/test";

test("skips without a ticket", async ({ isMobile }) => {
  test.skip(isMobile, "no hover on touch"); // expect: ui-testing/skip-names-ticket
  test.skip(isMobile, "UTF-8 paths break on the phone"); // expect: ui-testing/skip-names-ticket
  test.skip(); // expect: ui-testing/skip-names-ticket playwright/no-skipped-test
  test.fixme(isMobile, "flaky on phone"); // expect: ui-testing/skip-names-ticket
  test.fail(isMobile, `the menu does not open`); // expect: ui-testing/skip-names-ticket
  test.skip(
    // expect: ui-testing/skip-names-ticket
    isMobile,
    "a long reason that wraps " + "onto two lines and names nothing",
  );
});

test.fail("the menu opens on tap", async () => {}); // expect: ui-testing/skip-names-ticket
