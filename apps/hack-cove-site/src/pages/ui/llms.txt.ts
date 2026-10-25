import { renderLlms } from "../../docs/llms";

export function GET() {
  return new Response(renderLlms(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
