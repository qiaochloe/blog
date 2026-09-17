/**
 * Preprocess markdown to convert ==text== to <mark>text</mark> elements.
 * This runs before MDX processing so it handles all cases uniformly.
 */

export function preprocessHighlightMarker(content: string): string {
  return content.replace(/==((?:(?!==).)+)==/g, "<mark>$1</mark>");
}
