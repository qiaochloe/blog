"use client";

import { useEffect } from "react";
import { getFootnoteBodyHtml } from "app/utils/footnote-dom";

const NARROW_QUERY = "(max-width: 1023.98px)";
const BLOCK_SELECTOR = "p, li, blockquote, h1, h2, h3, h4, h5, h6";

export function MobileFootnotes() {
  useEffect(() => {
    const article = document.querySelector<HTMLElement>(
      "article.prose, .prose-notes article",
    );
    const footnotesList = article?.querySelector<HTMLElement>(".footnotes");
    if (!article || !footnotesList) return;

    const mql = window.matchMedia(NARROW_QUERY);
    const openBoxes = new Map<string, HTMLElement>();
    let refs: HTMLAnchorElement[] = [];

    const closeBox = (num: string) => {
      openBoxes.get(num)?.remove();
      openBoxes.delete(num);
      article
        .querySelector(`a[id="ref-${num}"]`)
        ?.classList.remove("footnote-ref-active");
    };

    const onClick = (e: MouseEvent) => {
      const ref = e.currentTarget as HTMLAnchorElement;
      e.preventDefault();

      const num = ref.id.replace(/^ref-/, "");
      if (openBoxes.has(num)) {
        closeBox(num);
        return;
      }

      const item = article.querySelector<HTMLElement>(`#fn-${num}`);
      const block = ref.closest<HTMLElement>(BLOCK_SELECTOR);
      if (!item || !block) return;

      const box = document.createElement("div");
      box.className = "footnote-inline-box";
      box.innerHTML = `<span class="sidenote-number">${num}</span>${getFootnoteBodyHtml(item)}`;
      block.insertAdjacentElement("afterend", box);

      openBoxes.set(num, box);
      ref.classList.add("footnote-ref-active");
    };

    const teardown = () => {
      for (const num of Array.from(openBoxes.keys())) closeBox(num);
      for (const ref of refs) ref.removeEventListener("click", onClick);
      refs = [];
      footnotesList.classList.remove("mobile-footnotes-hidden");
    };

    const setup = () => {
      refs = Array.from(
        article.querySelectorAll<HTMLAnchorElement>('a[id^="ref-"]'),
      );
      if (refs.length === 0) return;

      for (const ref of refs) ref.addEventListener("click", onClick);
      footnotesList.classList.add("mobile-footnotes-hidden");
    };

    const recompute = () => {
      teardown();
      if (mql.matches) setup();
    };

    recompute();
    mql.addEventListener("change", recompute);

    return () => {
      mql.removeEventListener("change", recompute);
      teardown();
    };
  }, []);

  return null;
}
