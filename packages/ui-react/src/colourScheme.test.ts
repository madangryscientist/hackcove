// @vitest-environment jsdom
import { Script, runInNewContext } from "node:vm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  appliedColourScheme,
  applyColourScheme,
  colourSchemeScript,
  readColourScheme,
  schemeClass,
  storeColourScheme,
  type ColourScheme,
} from "./colourScheme.js";

const KEY = "hackcove:colour-scheme";
const root = document.documentElement;

/** jsdom has no matchMedia: answer the dark query with `dark`, or remove matchMedia when undefined. */
function systemPrefers(dark: boolean | undefined): void {
  if (dark === undefined) {
    vi.stubGlobal("matchMedia", undefined);
    return;
  }
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query === "(prefers-color-scheme: dark)" && dark,
  }));
}

function resetRoot(): void {
  // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
  root.classList.remove("dark", "my-light");
  root.style.removeProperty("color-scheme");
}

function reset(): void {
  localStorage.clear();
  resetRoot();
}

/** Run the head script as a browser would, against this document, storage and (stubbed) matchMedia. */
function runScript(): void {
  runInNewContext(colourSchemeScript, {
    document,
    localStorage,
    matchMedia: Reflect.get(globalThis, "matchMedia"),
  });
}

beforeEach(reset);
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  reset();
});

describe("applyColourScheme", () => {
  it("toggles the dark class and sets color-scheme on <html>", () => {
    applyColourScheme("dark");
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    expect(root.classList.contains("dark")).toBe(true);
    expect(root.style.colorScheme).toBe("dark");
    applyColourScheme("light");
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    expect(root.classList.contains("dark")).toBe(false);
    expect(root.style.colorScheme).toBe("light");
  });

  it("applies to the root it is given and leaves <html> alone", () => {
    const scoped = document.createElement("div");
    applyColourScheme("dark", scoped);
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    expect(scoped.classList.contains("dark")).toBe(true);
    expect(scoped.style.colorScheme).toBe("dark");
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    expect(root.classList.contains("dark")).toBe(false);
  });
});

const paper = { light: "my-light", dark: "dark" };

describe("schemes with a light class of their own", () => {
  it("schemeClass names the class for each scheme, with the default of dark and none", () => {
    expect(schemeClass("dark")).toBe("dark");
    expect(schemeClass("light")).toBe("");
    expect(schemeClass("light", paper)).toBe("my-light");
    expect(schemeClass("dark", paper)).toBe("dark");
  });

  it("leaves other classes on <html> alone", () => {
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    root.classList.add("antialiased");
    applyColourScheme("dark", root, paper);
    applyColourScheme("light", root, paper);
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    expect(root.classList.contains("antialiased")).toBe(true);
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    root.classList.remove("antialiased");
  });

  it("appliedColourScheme reads which one <html> carries", () => {
    expect(appliedColourScheme(root, paper)).toBe("light");
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    root.classList.add("dark");
    expect(appliedColourScheme(root, paper)).toBe("dark");
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    root.classList.remove("dark");
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    root.classList.add("my-light");
    expect(appliedColourScheme(root, paper)).toBe("light");
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    root.classList.remove("my-light");
  });
});

describe("readColourScheme", () => {
  it("returns the stored choice over the system preference", () => {
    systemPrefers(true);
    localStorage.setItem(KEY, "light");
    expect(readColourScheme()).toBe("light");
  });

  it("falls back to the system preference when nothing is stored", () => {
    systemPrefers(true);
    expect(readColourScheme()).toBe("dark");
    systemPrefers(false);
    expect(readColourScheme()).toBe("light");
  });

  it("ignores a stored value that is not a scheme", () => {
    systemPrefers(true);
    localStorage.setItem(KEY, "sepia");
    expect(readColourScheme()).toBe("dark");
  });

  it("uses the system preference when storage throws", () => {
    systemPrefers(true);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(readColourScheme()).toBe("dark");
  });

  it("uses the fallback when neither storage nor the system answers", () => {
    systemPrefers(undefined);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(readColourScheme()).toBe("light");
    expect(readColourScheme("dark")).toBe("dark");
  });
});

describe("storeColourScheme", () => {
  it("writes the key", () => {
    storeColourScheme("dark");
    expect(localStorage.getItem(KEY)).toBe("dark");
  });

  it("swallows a storage error", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(() => storeColourScheme("dark")).not.toThrow();
  });
});

describe("colourSchemeScript", () => {
  it("is valid JavaScript and a few hundred bytes", () => {
    expect(() => new Script(colourSchemeScript)).not.toThrow();
    expect(colourSchemeScript.length).toBeLessThan(500);
  });

  it("leaves a light page light, with no dark flash, when nothing is stored and the system is light", () => {
    systemPrefers(false);
    runScript();
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    expect(root.classList.contains("dark")).toBe(false);
    expect(root.style.colorScheme).toBe("light");
  });

  // Every stored and system state; `stored` is what is in storage, empty when nothing is.
  const states = [false, true].flatMap((system) =>
    ([[], ["light"], ["dark"]] as ColourScheme[][]).map((stored) => ({ system, stored })),
  );

  it.each(states)(
    "does what readColourScheme + applyColourScheme do (stored $stored, system dark $system)",
    ({ system, stored }) => {
      systemPrefers(system);
      for (const choice of stored) localStorage.setItem(KEY, choice);
      runScript();
      // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
      const fromScript = [root.classList.contains("dark"), root.style.colorScheme];

      resetRoot();
      applyColourScheme(readColourScheme());
      // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
      const fromApi = [root.classList.contains("dark"), root.style.colorScheme];

      expect(fromScript).toEqual(fromApi);
    },
  );

  it("uses the system preference when storage throws", () => {
    systemPrefers(true);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    runScript();
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    expect(root.classList.contains("dark")).toBe(true);
  });

  it("touches nothing when neither storage nor the system answers", () => {
    systemPrefers(undefined);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    root.classList.add("dark");
    runScript();
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    expect(root.classList.contains("dark")).toBe(true);
    expect(root.style.colorScheme).toBe("");
  });
});
