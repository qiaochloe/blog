"use client";

import { useEffect } from "react";
import { getFootnoteBodyHtml } from "app/utils/footnote-dom";

/**
 * Prepares the post for printing: a copy of each footnote beside the line
 * that cites it, and every collapsed <Extra> panel expanded.
 *
 * The desktop Sidenotes component can't be reused for the notes. It positions
 * them absolutely from measurements of the live screen layout, which
 * pagination invalidates. These are plain right floats instead, so the print
 * engine places and breaks them along with the text.
 *
 * The notes are built on mount and kept `display: none` until print media
 * applies, rather than built from a beforeprint handler. Printing then needs
 * no script at all, so it can't depend on when (or whether) a browser fires
 * that event. Only the <details> panels still do, since their open state
 * isn't something CSS can set.
 */
export function PrintView() {
  useEffect(() => {
    const article = document.querySelector<HTMLElement>(
      "article.prose, .prose-notes article",
    );
    if (!article) return;

    /**
     * Where to insert a note so its float lands beside the referencing line.
     * Normally that's right after the ref's <sup>; inside a table it's after
     * the table, since a float can't escape its cell.
     */
    const insertionPoint = (ref: HTMLElement): HTMLElement => {
      const cell = ref.closest<HTMLElement>("td, th");
      if (cell) return cell.closest<HTMLElement>("table") ?? cell;
      return ref.closest<HTMLElement>("sup") ?? ref;
    };

    const notes: HTMLElement[] = [];
    const footnotesList = article.querySelector<HTMLElement>(".footnotes");

    if (footnotesList) {
      const refs = Array.from(
        article.querySelectorAll<HTMLAnchorElement>('a[id^="ref-"]'),
      );
      const seen = new Set<string>();

      for (const ref of refs) {
        const num = ref.id.replace(/^ref-/, "");
        // A footnote cited twice gets one note, at its first citation.
        if (seen.has(num)) continue;

        const item = article.querySelector<HTMLElement>(`#fn-${num}`);
        if (!item) continue;
        seen.add(num);

        // A span, not a div: these land inside paragraphs and list items,
        // where a block-level child would be invalid. The float makes it a
        // block box anyway. The body gets its own wrapper so its first
        // paragraph is a first child, which is how .sidenote tells the
        // paragraph that runs on from the note number from the ones that
        // break onto their own line.
        const note = document.createElement("span");
        note.className = "sidenote sidenote-print";
        note.setAttribute("aria-hidden", "true");
        note.innerHTML =
          `<span class="sidenote-number">${num}</span>` +
          `<span class="sidenote-body">${getFootnoteBodyHtml(item)}</span>`;
        insertionPoint(ref).insertAdjacentElement("afterend", note);
        notes.push(note);
      }

      if (notes.length > 0) {
        footnotesList.classList.add("print-footnotes-hidden");
      }
    }

    const opened: HTMLDetailsElement[] = [];

    const expandPanels = () => {
      if (opened.length > 0) return;
      const panels = Array.from(
        article.querySelectorAll<HTMLDetailsElement>("details"),
      );
      for (const panel of panels) {
        if (panel.open) continue;
        panel.open = true;
        opened.push(panel);
      }
    };

    const collapsePanels = () => {
      for (const panel of opened) panel.open = false;
      opened.length = 0;
    };

    // beforeprint/afterprint cover Chrome and Firefox; the print media query
    // is the fallback for browsers that only report the change that way.
    const mql = window.matchMedia("print");
    const onMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) expandPanels();
      else collapsePanels();
    };

    window.addEventListener("beforeprint", expandPanels);
    window.addEventListener("afterprint", collapsePanels);
    mql.addEventListener("change", onMediaChange);

    return () => {
      window.removeEventListener("beforeprint", expandPanels);
      window.removeEventListener("afterprint", collapsePanels);
      mql.removeEventListener("change", onMediaChange);
      collapsePanels();
      for (const note of notes) note.remove();
      footnotesList?.classList.remove("print-footnotes-hidden");
    };
  }, []);

  return null;
}
