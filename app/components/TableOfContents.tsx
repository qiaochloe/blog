"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { TocHeading } from "app/utils/headings";

type TableOfContentsProps = {
  headings: TocHeading[];
  variant?: "mobile" | "sidebar";
};

type TocSection = {
  heading: TocHeading;
  children: TocHeading[];
};

function groupHeadings(headings: TocHeading[]): TocSection[] {
  const sections: TocSection[] = [];
  let current: TocSection | null = null;

  for (const h of headings) {
    if (h.level === 2) {
      current = { heading: h, children: [] };
      sections.push(current);
    } else if (current) {
      current.children.push(h);
    }
  }

  return sections;
}

export function TableOfContents({ headings, variant = "sidebar" }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    const ids = headings.map((h) => h.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el != null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: "-80px 0% -80% 0%",
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  const sections = groupHeadings(headings);

  const sidebarList = (
    <ul className="space-y-0.5 text-sm">
      {sections.map(({ heading, children: subheadings }) => {
        const hasChildren = subheadings.length > 0;
        const isExpanded = expandedIds.has(heading.id);
        const activeSubheadingIsHidden =
          hasChildren && !isExpanded && subheadings.some((s) => s.id === activeId);
        const isParentActive = activeId === heading.id || activeSubheadingIsHidden;

        return (
          <li key={heading.id} className="leading-tight">
            <div className="flex items-start gap-0.5 min-w-0">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleExpanded(heading.id)}
                  className="shrink-0 p-0.5 -m-0.5 mt-0.5 text-neutral-500 hover:text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 rounded"
                  aria-expanded={isExpanded}
                  aria-label={isExpanded ? "Collapse subheadings" : "Expand subheadings"}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              ) : (
                <span className="w-3.5 shrink-0" aria-hidden />
              )}
              <a
                href={`#${heading.id}`}
                className={`toc-link flex-1 min-w-0 py-px text-neutral-600 hover:text-neutral-900 transition-colors break-words ${
                  isParentActive ? "toc-link-active font-bold text-neutral-900" : ""
                }`}
              >
                {heading.text}
              </a>
            </div>
            {hasChildren && isExpanded && (
              <ul className="space-y-0.5 mt-0.5 pl-6">
                {subheadings.map(({ level, text, id }) => (
                  <li
                    key={id}
                    style={{ paddingLeft: (level - 3) * 10 }}
                    className="break-words"
                  >
                    <a
                      href={`#${id}`}
                      className={`toc-link block py-px text-neutral-600 hover:text-neutral-900 transition-colors break-words ${
                        activeId === id ? "toc-link-active font-bold text-neutral-900" : ""
                      }`}
                    >
                      {text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );

  if (variant === "mobile") {
    return (
      <nav
        className="toc toc-mobile mb-6 lg:hidden"
        aria-label="On this page"
      >
        <p className="text-xs font-semibold text-neutral-900 tracking-tight mb-1.5">
          Contents
        </p>
        <ul className="space-y-0.5 text-sm">
          {sections.map(({ heading, children: subheadings }) => (
            <li key={heading.id} className="leading-tight">
              <a
                href={`#${heading.id}`}
                className={`toc-link block py-px text-neutral-600 hover:text-neutral-900 transition-colors break-words ${
                  activeId === heading.id ? "toc-link-active font-semibold text-neutral-900" : ""
                }`}
              >
                {heading.text}
              </a>
              {subheadings.length > 0 && (
                <ul className="space-y-0.5 mt-0.5 pl-4">
                  {subheadings.map(({ level, text, id }) => (
                    <li key={id} style={{ paddingLeft: (level - 3) * 8 }} className="break-words">
                      <a
                        href={`#${id}`}
                        className={`toc-link block py-px text-neutral-600 hover:text-neutral-900 transition-colors break-words ${
                          activeId === id ? "toc-link-active font-semibold text-neutral-900" : ""
                        }`}
                      >
                        {text}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav
      className="toc toc-sidebar sticky top-20 hidden lg:block shrink-0 w-48 min-w-[12rem] max-h-[calc(100vh-6rem)] overflow-y-auto"
      aria-label="On this page"
    >
      <h2 className="text-xs font-semibold text-neutral-900 tracking-tight mb-1.5">
        Contents
      </h2>
      {sidebarList}
    </nav>
  );
}