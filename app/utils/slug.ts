/**
 * Slugify a string for use in heading IDs. Must match the logic in
 * app/components/mdx.tsx createHeading so TOC links match DOM ids.
 */
export function slugifyString(str: string): string {
  if (str == null || typeof str !== "string") return "";
  return (
    str
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/&/g, "-and-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-") || "section"
  );
}
