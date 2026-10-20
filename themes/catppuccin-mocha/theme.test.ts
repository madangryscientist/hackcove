import { readFileSync } from "node:fs";
import { describeTheme } from "@hackcove/tools/contract";
import { expect, it } from "vitest";

describeTheme(import.meta.dirname);

it("credits Catppuccin: NOTICE carries its MIT notice and theme.css keeps a banner", () => {
  const notice = readFileSync(`${import.meta.dirname}/NOTICE`, "utf8");
  expect(notice).toContain("Copyright (c) 2021 Catppuccin");
  expect(notice).toContain("Permission is hereby granted");
  expect(readFileSync(`${import.meta.dirname}/theme.css`, "utf8")).toMatch(/^\/\*! .*Catppuccin/);
});
