/**
 * The four testing rules no published plugin has, loaded by oxlint's `jsPlugins` as `ui-testing`.
 * Plain ESM over the ESTree AST oxlint hands an ESLint-style plugin; `.oxlintrc.json` turns each on
 * for the files it belongs to. Every message names the ob-ui-testing rule it enforces
 * (README.md, "The rules").
 */

const TICKET = /\b[A-Z]{2,}-\d+\b/;

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
// value first and an options object second (`locator.fill('ok', { force: true })`).
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

function takesSelector(method, args) {
  if (HANDLE_QUERIES.has(method)) return true;
  if (SELECTOR_FIRST.has(method)) return isString(args[0]);
  if (SELECTOR_THEN_VALUE.has(method)) {
    return args.length >= 2 && isString(args[0]) && args[1].type !== "ObjectExpression";
  }
  return false;
}

const noSelectorActions = rule("act through a role locator, not a selector string", (context) => ({
  CallExpression(node) {
    if (node.callee.type !== "MemberExpression") return;
    const method = nameOf(node.callee);
    if (!method || !takesSelector(method, node.arguments)) return;
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
    if (reason !== undefined && TICKET.test(reason)) return;
    context.report({
      node,
      message: `${kind}() needs a reason that names its ticket, e.g. 'no hover on touch, FS-12' (ob-ui-testing rule 8: One config shape)`,
    });
  },
}));

// The values every Playwright config holds. `trace` must be written down, since its default is
// "off"; `retries` and `reuseExistingServer` already default to these.
const HOUSE = { retries: 0, reuseExistingServer: false, trace: "retain-on-failure" };

const configShape = rule("the Playwright config keeps the house values", (context) => {
  let traced = false;
  return {
    Property(node) {
      const key = keyOf(node);
      if (!Object.hasOwn(HOUSE, key)) return;
      if (key === "trace") traced = true;
      if (node.value.type === "Literal" && node.value.value === HOUSE[key]) return;
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

export default {
  meta: { name: "ui-testing" },
  rules: {
    "no-selector-actions": noSelectorActions,
    "no-style-assertions": noStyleAssertions,
    "skip-names-ticket": skipNamesTicket,
    "config-shape": configShape,
  },
};
