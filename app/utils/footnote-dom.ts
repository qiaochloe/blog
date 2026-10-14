/**
 * Shared client-side helper for reading rendered footnote content out of the
 * bottom `.footnotes` list (see app/utils/footnotes.ts for the markup it
 * produces), used by both the desktop sidenotes and mobile tap-to-expand.
 */
export function getFootnoteBodyHtml(item: HTMLElement): string {
  const clone = item.cloneNode(true) as HTMLElement;
  clone.querySelector(".footnote-back")?.remove();
  // The li wraps its body in a flex (block-level) div; unwrap it so callers
  // can place the body inline (e.g. next to a note number) without it
  // forcing a line break.
  const body = clone.querySelector("div") ?? clone;
  return body.innerHTML;
}
