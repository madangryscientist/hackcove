/** A page's section of `/ui/llms.txt`, from its `## <name>` to the next `## ` (or the end). */
export function llmsSection(text: string, name: string): string {
  const start = text.indexOf(`\n## ${name}\n`);
  const end = text.indexOf("\n## ", start + 1);
  return text.slice(start, end === -1 ? undefined : end);
}
