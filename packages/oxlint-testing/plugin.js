import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

/**
 * The testing rules no published plugin has, loaded by oxlint's `jsPlugins` as `ui-testing`.
 * Plain ESM over the ESTree AST oxlint hands an ESLint-style plugin; `.oxlintrc.json` turns each on
 * for the files it belongs to. Every message names the ob-ui-testing rule it enforces
 * (README.md, "The rules").
 */

const TICKET = /\b([A-Z]{2,})-\d+\b/g;
// Standards that read like a ticket ref (`UTF-8`, `SHA-256`, `ISO-8601`) and are not one.
const NOT_TICKETS = new Set(["AES", "CVE", "ES", "HTTP", "ISO", "MD", "RFC", "RSA", "SHA", "UTF"]);

const namesTicket = (text) =>
  [...text.matchAll(TICKET)].some(([, prefix]) => !NOT_TICKETS.has(prefix));

/** A string literal or a template literal. */
const isString = (node) =>
  Boolean(node) &&
  ((node.type === "Literal" && typeof node.value === "string") || node.type === "TemplateLiteral");

/** The text of a string literal, a template literal (`${}` per hole) or a `+` chain of them. */
function textOf(node) {
  if (!node) return undefined;
  if (node.type === "Literal") return typeof node.value === "string" ? node.value : undefined;
  if (node.type === "TemplateLiteral") return node.quasis.map((q) => q.value.cooked).join("${}");
  if (node.type === "BinaryExpression" && node.operator === "+") {
    const parts = [textOf(node.left), textOf(node.right)];
    return parts.some((part) => part !== undefined) ? parts.join("") : undefined;
  }
  return undefined;
}

/** The called or read name: `x` for `x` and `a.x`, nothing for `a[x]`. */
function nameOf(node) {
  if (!node) return undefined;
  if (node.type === "Identifier") return node.name;
  if (node.type === "MemberExpression" && !node.computed) return node.property.name;
  return undefined;
}

/** A property key's name, written bare (`className`) or quoted (`"class"`). */
const keyOf = (property) => nameOf(property.key) ?? property.key?.value;

const isFunction = (node) =>
  node?.type === "ArrowFunctionExpression" || node?.type === "FunctionExpression";

const rule = (description, create) => ({
  meta: { type: "problem", docs: { description } },
  create,
});

// Page methods whose first argument is a selector: `page.click('#x')`. A locator's own method of
// the same name takes no string first (`locator.click()`, `locator.fill('value')`).
const SELECTOR_FIRST = new Set([
  "click",
  "dblclick",
  "hover",
  "tap",
  "check",
  "uncheck",
  "focus",
  "textContent",
  "innerText",
  "innerHTML",
  "inputValue",
  "isVisible",
  "isHidden",
  "isChecked",
  "isEnabled",
  "isDisabled",
  "isEditable",
]);
// Page methods that take a selector then a value: `page.fill('.y', v)`. The locator form takes the
// value first and options second (`locator.fill('ok', { force: true })`, `locator.fill('ok', opts)`),
// so a selector is read when the second argument is a value (a string or an array), or when the
// call is on the page or a frame itself (`page.fill('#name', name)`).
const SELECTOR_THEN_VALUE = new Set([
  "fill",
  "type",
  "press",
  "selectOption",
  "setInputFiles",
  "dispatchEvent",
]);
// Element handle queries: a selector string every time.
const HANDLE_QUERIES = new Set(["$", "$$", "$eval", "$$eval"]);

const PAGE = /^(page|frame|\w+Page|\w+Frame)$/;
const isValue = (node) => isString(node) || node?.type === "ArrayExpression";

function takesSelector(callee, args) {
  const method = nameOf(callee);
  if (HANDLE_QUERIES.has(method)) return true;
  if (SELECTOR_FIRST.has(method)) return isString(args[0]);
  if (!SELECTOR_THEN_VALUE.has(method) || args.length < 2 || !isString(args[0])) return false;
  return isValue(args[1]) || PAGE.test(nameOf(callee.object) ?? "");
}

const noSelectorActions = rule("act through a role locator, not a selector string", (context) => ({
  CallExpression(node) {
    if (node.callee.type !== "MemberExpression") return;
    const method = nameOf(node.callee);
    if (!method || !takesSelector(node.callee, node.arguments)) return;
    context.report({
      node,
      message: `${method}() with a selector string: find it the way a user does, page.getByRole(...).${method === "$" || method === "$$" ? "locator" : method}() (ob-ui-testing rule 1: Find elements the way a user does)`,
    });
  },
}));

const LOOK_ATTRIBUTE = /^(class|className|classList|style)(\.|$)/;
const ATTRIBUTE_READS = new Set([
  "toHaveAttribute",
  "getAttribute",
  "hasAttribute",
  "toHaveProperty",
]);
const OBJECT_MATCHERS = new Set(["toMatchObject", "toEqual", "toStrictEqual"]);
const LOOK_KEYS = new Set(["className", "class", "style", "classList"]);
const LOOK_MESSAGE = "assert the state the user sees; the look is the visual check's";

function reportLookKeys(context, expected) {
  if (expected?.type !== "ObjectExpression") return;
  for (const property of expected.properties) {
    if (property.type !== "Property" || !LOOK_KEYS.has(keyOf(property))) continue;
    context.report({
      node: property,
      message: `${keyOf(property)} in an expected object checks look: ${LOOK_MESSAGE} (ob-ui-testing rule 7: Behaviour in tests, look in PixelSlash)`,
    });
  }
}

const noStyleAssertions = rule("assert behaviour, not class or style", (context) => ({
  CallExpression(node) {
    const method = nameOf(node.callee);
    const [first] = node.arguments;
    if (ATTRIBUTE_READS.has(method) && isString(first) && LOOK_ATTRIBUTE.test(textOf(first))) {
      context.report({
        node,
        message: `${method}('${textOf(first)}') checks look: ${LOOK_MESSAGE} (ob-ui-testing rule 7: Behaviour in tests, look in PixelSlash)`,
      });
    }
    if (OBJECT_MATCHERS.has(method)) reportLookKeys(context, first);
  },
}));

const SKIPS = new Set(["skip", "fixme", "fail"]);

/** The reason a skip gives: the last string argument (a `+` chain counts as one). */
function reasonOf(args) {
  return args
    .map(textOf)
    .filter((text) => text !== undefined)
    .at(-1);
}

const skipNamesTicket = rule("a skip names its ticket", (context) => ({
  CallExpression(node) {
    const callee = node.callee;
    const kind = nameOf(callee);
    if (callee.type !== "MemberExpression" || !SKIPS.has(kind)) return;
    const args = node.arguments;
    // A skip or fixme that declares a test (a title and a body) is a skipped test, which
    // playwright/no-skipped-test reports. A fail that declares one is a test expected to fail, and
    // its title names the ticket.
    const declares = args.length >= 2 && isFunction(args.at(-1)) && isString(args[0]);
    if (declares && kind !== "fail") return;
    const reason = declares ? textOf(args[0]) : reasonOf(args);
    if (reason !== undefined && namesTicket(reason)) return;
    context.report({
      node,
      message: `${kind}() needs a reason that names its ticket, e.g. 'no hover on touch, FS-12' (ob-ui-testing rule 8: One config shape)`,
    });
  },
}));

// The values every Playwright config holds. `trace` must be written down, since its default is
// "off"; `retries` and `reuseExistingServer` already default to these.
const HOUSE = { retries: 0, reuseExistingServer: false, trace: "retain-on-failure" };

const modeOf = (object) =>
  object.properties.find((property) => property.type === "Property" && keyOf(property) === "mode")
    ?.value;

const configShape = rule("the Playwright config keeps the house values", (context) => {
  let traced = false;
  return {
    Property(node) {
      const key = keyOf(node);
      if (!Object.hasOwn(HOUSE, key)) return;
      if (key === "trace") traced = true;
      // `trace` may be an object, `{ mode: "retain-on-failure", sources: false }`.
      const mode =
        node.value.type === "ObjectExpression" && key === "trace" ? modeOf(node.value) : node.value;
      if (mode?.type === "Literal" && mode.value === HOUSE[key]) return;
      context.report({
        node,
        message: `${key} must be ${JSON.stringify(HOUSE[key])} (ob-ui-testing rule 8: One config shape)`,
      });
    },
    "Program:exit"(node) {
      if (traced) return;
      context.report({
        node,
        message: `use.trace must be "retain-on-failure"; its default is "off" (ob-ui-testing rule 8: One config shape)`,
      });
    },
  };
});

// Testing Library's own modules (eslint-plugin-testing-library 7.16.2, `LIBRARY_MODULES`,
// `OLD_LIBRARY_MODULES` and `USER_EVENT_MODULE`).
const TESTING_LIBRARY = new Set([
  "@testing-library/dom",
  "@testing-library/angular",
  "@testing-library/react",
  "@testing-library/preact",
  "@testing-library/vue",
  "@testing-library/svelte",
  "@marko/testing-library",
  "dom-testing-library",
  "vue-testing-library",
  "react-testing-library",
  "@testing-library/user-event",
]);

// The reads that return a DOM node, from eslint-plugin-testing-library 7.16.2
// (`PROPERTIES_RETURNING_NODES` and `METHODS_RETURNING_NODES`), less `activeElement`: reading where
// focus is, is the keyboard outcome a test asserts.
const NODE_ACCESS = new Set([
  "children",
  "childElementCount",
  "firstChild",
  "firstElementChild",
  "fullscreenElement",
  "lastChild",
  "lastElementChild",
  "nextElementSibling",
  "nextSibling",
  "parentElement",
  "parentNode",
  "pointerLockElement",
  "previousElementSibling",
  "previousSibling",
  "rootNode",
  "scripts",
  "closest",
  "getElementById",
  "getElementsByClassName",
  "getElementsByName",
  "getElementsByTagName",
  "getElementsByTagNameNS",
  "querySelector",
  "querySelectorAll",
]);
// Calls on a query result that act on the node, not as a user (the same plugin's
// `EVENT_HANDLER_METHODS`): `screen.getByRole("button").click()`.
const NODE_EVENTS = new Set(["click", "select", "submit"]);
const QUERY =
  /^(get|getAll|query|queryAll|find|findAll)By(LabelText|PlaceholderText|Text|AltText|Title|DisplayValue|Role|TestId)$/;

const REEXPORTS_TESTING_LIBRARY =
  /\bexport\s+(\*|\{[^}]*\})(\s+as\s+\w+)?\s+from\s+["']@testing-library\//;
const SOURCE_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js"];
const reexports = new Map();

/** A source file's text, or "" when there is no such file. Any other failure is a real one. */
function sourceOf(path) {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return "";
    throw error;
  }
}

/**
 * Whether the relative module `specifier`, imported from `file`, re-exports Testing Library. The
 * repo writes `./render.harness.js` for `render.harness.tsx`, so the extension is swapped for each
 * source one in turn. Read once per path per lint run, one level deep.
 */
function reexportsTestingLibrary(file, specifier) {
  const base = resolve(dirname(file), specifier).replace(/\.[cm]?[jt]sx?$/, "");
  return SOURCE_EXTENSIONS.some((extension) => {
    const path = base + extension;
    if (!reexports.has(path)) reexports.set(path, REEXPORTS_TESTING_LIBRARY.test(sourceOf(path)));
    return reexports.get(path);
  });
}

/** The names a file imports from Testing Library, directly or through a local re-export. */
function testingLibraryNames(program, file) {
  const names = new Set();
  for (const statement of program.body) {
    if (statement.type !== "ImportDeclaration") continue;
    const source = statement.source.value;
    const fromTestingLibrary =
      TESTING_LIBRARY.has(source) ||
      (source.startsWith(".") && reexportsTestingLibrary(file, source));
    if (!fromTestingLibrary) continue;
    names.add(source);
    for (const specifier of statement.specifiers) names.add(specifier.local.name);
  }
  return names;
}

/** Inside an expression statement or a variable declarator, where Testing Library's rule looks. */
function inStatement(node) {
  for (let up = node.parent; up; up = up.parent) {
    if (up.type === "ExpressionStatement" || up.type === "VariableDeclarator") return true;
  }
  return false;
}

/** The identifier a chain starts from: `screen` for `screen.getByRole("x").click`. */
function rootOf(node) {
  if (node?.type === "Identifier") return node;
  if (node?.type === "MemberExpression") return rootOf(node.object);
  if (node?.type === "CallExpression") return rootOf(node.callee);
  return undefined;
}

/**
 * A Testing Library query call on an imported name: `screen.getByRole("x")`. An awaited one
 * (`(await screen.findByRole("x")).click()`) is not, as in Testing Library's own rule.
 */
function isImportedQuery(node, imported) {
  if (node.type !== "CallExpression" || !QUERY.test(nameOf(node.callee) ?? "")) return false;
  return imported.has(rootOf(node)?.name);
}

const walkMessage = (name) =>
  `${name} walks the DOM: find it the way a user does, screen.getByRole(...) (ob-ui-testing rule 1: Find elements the way a user does)`;

// Testing Library's `no-node-access`, which runs only in a file that imports a Testing Library
// module by name. This one also runs when the file imports a local module that re-exports one
// (`./render.harness.js` with `export { render, screen } from "@testing-library/react"`).
const noNodeAccess = rule("find elements by role, not by walking the DOM", (context) => {
  let imported = new Set();
  return {
    Program(node) {
      imported = testingLibraryNames(node, context.filename);
    },
    MemberExpression(node) {
      if (imported.size === 0 || node.computed) return;
      const name = node.property.name;
      if (!NODE_ACCESS.has(name)) return;
      if (node.parent?.type === "MemberExpression" && node.parent.object === node) return;
      if (node.object.type === "Identifier" && node.object.name === "props") return;
      if (!inStatement(node)) return;
      context.report({ node: node.property, message: walkMessage(name) });
    },
    CallExpression(node) {
      const callee = node.callee;
      if (callee.type !== "MemberExpression" || !NODE_EVENTS.has(nameOf(callee))) return;
      if (!isImportedQuery(callee.object, imported)) return;
      context.report({ node: callee.property, message: walkMessage(`${nameOf(callee)}()`) });
    },
  };
});

export default {
  meta: { name: "ui-testing" },
  rules: {
    "no-selector-actions": noSelectorActions,
    "no-style-assertions": noStyleAssertions,
    "skip-names-ticket": skipNamesTicket,
    "config-shape": configShape,
    "no-node-access": noNodeAccess,
  },
};
