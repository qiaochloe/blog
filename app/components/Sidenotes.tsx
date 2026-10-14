"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getFootnoteBodyHtml } from "app/utils/footnote-dom";

const SIDENOTES_PORTAL_ID = "sidenotes-portal";
const WIDE_QUERY = "(min-width: 1024px)";
const MIN_GAP = 16;

type Sidenote = {
  id: string;
  num: string;
  /** Desired position, from the footnote ref's location in the text. */
  baseTop: number;
  /** Actual render position, pushed down to clear earlier notes if needed. */
  top: number;
  html: string;
};

function extractNotes(container: HTMLElement): Sidenote[] {
  const refs = Array.from(
    container.querySelectorAll<HTMLAnchorElement>('a[id^="ref-"]'),
  );

  const notes: Sidenote[] = [];
  const containerTop = container.getBoundingClientRect().top;

  for (const ref of refs) {
    const num = ref.id.replace(/^ref-/, "");
    const item = container.querySelector<HTMLElement>(`#fn-${num}`);
    if (!item) continue;

    const baseTop = ref.getBoundingClientRect().top - containerTop;
    notes.push({
      id: `fn-${num}`,
      num,
      baseTop,
      top: baseTop,
      html: getFootnoteBodyHtml(item),
    });
  }

  return notes.sort((a, b) => a.baseTop - b.baseTop);
}

export function Sidenotes() {
  const [notes, setNotes] = useState<Sidenote[]>([]);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const nodeRefs = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    const article = document.querySelector<HTMLElement>(
      "article.prose, .prose-notes article",
    );
    const footnotesList = article?.querySelector<HTMLElement>(".footnotes");
    const portal = document.getElementById(SIDENOTES_PORTAL_ID);

    if (!article || !footnotesList || !portal) {
      setPortalTarget(null);
      setNotes([]);
      return;
    }

    const mql = window.matchMedia(WIDE_QUERY);

    const recompute = () => {
      if (!mql.matches) {
        setPortalTarget(null);
        setNotes([]);
        footnotesList.classList.remove("sidenotes-hidden");
        return;
      }

      const computed = extractNotes(article);
      if (computed.length === 0) {
        setPortalTarget(null);
        setNotes([]);
        footnotesList.classList.remove("sidenotes-hidden");
        return;
      }

      setPortalTarget(portal);
      setNotes(computed);
      footnotesList.classList.add("sidenotes-hidden");
    };

    recompute();

    const debounced = (() => {
      let frame: number | null = null;
      return () => {
        if (frame != null) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(recompute);
      };
    })();

    mql.addEventListener("change", debounced);
    window.addEventListener("resize", debounced);
    const observer = new ResizeObserver(debounced);
    observer.observe(article);

    return () => {
      mql.removeEventListener("change", debounced);
      window.removeEventListener("resize", debounced);
      observer.disconnect();
      footnotesList.classList.remove("sidenotes-hidden");
    };
  }, []);

  // After layout, push notes down by their actual rendered height so
  // multi-line notes in close proximity don't overlap.
  useLayoutEffect(() => {
    if (notes.length === 0) return;

    let prevBottom = -Infinity;
    let changed = false;
    const adjusted = notes.map((note) => {
      const el = nodeRefs.current.get(note.id);
      const height = el?.getBoundingClientRect().height ?? 0;
      const top = Math.max(note.baseTop, prevBottom + MIN_GAP);
      prevBottom = top + height;
      if (Math.abs(top - note.top) > 0.5) changed = true;
      return { ...note, top };
    });

    if (changed) setNotes(adjusted);
  }, [notes]);

  if (!portalTarget || notes.length === 0) return null;

  return createPortal(
    <>
      {notes.map((note) => (
        <div
          key={note.id}
          ref={(el) => {
            if (el) nodeRefs.current.set(note.id, el);
            else nodeRefs.current.delete(note.id);
          }}
          className="sidenote"
          style={{ position: "absolute", top: note.top }}
        >
          <span className="sidenote-number">{note.num}</span>
          <span dangerouslySetInnerHTML={{ __html: note.html }} />
        </div>
      ))}
    </>,
    portalTarget,
  );
}
