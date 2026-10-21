import { focusRing } from "./cx.js";

/** Shared look of text controls; each control adds its own horizontal padding. */
export const controlClass = `w-full rounded-lg border border-slate-300 bg-white py-2 text-sm text-slate-900 placeholder:text-slate-400 transition hover:border-violet-400 disabled:opacity-50 ${focusRing}`;
