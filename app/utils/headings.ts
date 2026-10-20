import { slugifyString } from "./slug";

export type TocHeading = {
  level: number;
  text: string;
  id: string;
};

/**
 * Strip inline markdown from heading text for display (e.g. **bold**, [link](url)).
 */
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

/**
 * Extract h2–h3 headings from raw markdown content. Uses the same slug logic as
 * MDX createHeading so TOC anchor links match the rendered heading ids.
 * h4 and below are intentionally excluded from the table of contents.
 */
export function extractHeadings(content: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (!match) continue;

    const level = match[1].length;
    const rawText = match[2].trim();
    const text = stripInlineMarkdown(rawText);
    const id = slugifyString(text) || "section";

    headings.push({ level, text, id });
  }

  return headings;
}
