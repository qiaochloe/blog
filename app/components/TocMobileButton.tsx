"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, List } from "lucide-react";
import type { TocHeading } from "app/utils/headings";

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

export function TocMobileButton({ headings }: { headings: TocHeading[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const sections = groupHeadings(headings);

  return (
    <div ref={containerRef} className="relative lg:hidden shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
        aria-expanded={isOpen}
        aria-label="Table of contents"
      >
        <List className="w-4 h-4" />
        <span>Contents</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 w-72 max-h-[70vh] overflow-y-auto bg-white border border-neutral-200 rounded-lg shadow-lg py-2 z-50"
          role="dialog"
          aria-label="Table of contents"
        >
          <ul className="space-y-0.5 text-sm px-2">
            {sections.map(({ heading, children: subheadings }) => {
              const hasChildren = subheadings.length > 0;
              const isExpanded = expandedIds.has(heading.id);

              return (
                <li key={heading.id} className="leading-tight">
                  <div className="flex items-start gap-0.5 min-w-0">
                    {hasChildren ? (
                      <button
                        type="button"
                        onClick={() => toggleExpanded(heading.id)}
                        className="shrink-0 p-0.5 -m-0.5 mt-0.5 text-neutral-500 hover:text-neutral-700 rounded"
                        aria-expanded={isExpanded}
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
                      onClick={() => setIsOpen(false)}
                      className="toc-link flex-1 min-w-0 py-px text-neutral-600 hover:text-neutral-900 block break-words"
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
                            onClick={() => setIsOpen(false)}
                            className="toc-link block py-px text-neutral-600 hover:text-neutral-900 break-words"
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
        </div>
      )}
    </div>
  );
}
