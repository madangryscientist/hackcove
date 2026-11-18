import { sitePages } from "../test/pages";

/**
 * The pages this run checks. `PAGE_SHARD=<i>/<n>` takes the i-th of n even slices of `sitePages`, so
 * one long loop runs as n shorter leased runs that together cover every page; unset, it is every page.
 */
export function shardPages(): readonly string[] {
  const shard = process.env["PAGE_SHARD"];
  if (shard === undefined || shard === "") return sitePages;
  const match = /^(\d+)\/(\d+)$/.exec(shard);
  const index = Number(match?.[1]);
  const count = Number(match?.[2]);
  if (!match || count < 1 || index < 1 || index > count) {
    throw new Error(`PAGE_SHARD must be <i>/<n> with 1 <= i <= n, got "${shard}"`);
  }
  const size = Math.ceil(sitePages.length / count);
  return sitePages.slice((index - 1) * size, index * size);
}
