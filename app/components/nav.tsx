"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";
import { TocMobileButton } from "app/components/TocMobileButton";
import type { TocHeading } from "app/utils/headings";

const NARROW_PATHS = new Set(["writings", "about", "now", "rss"]);

function isPostPage(pathname: string): boolean {
  const segments = pathname.replace(/^\//, "").split("/").filter(Boolean);
  return segments.length === 1 && !NARROW_PATHS.has(segments[0]);
}

const navItems = {
  "/": {
    name: "Home",
  },
  "/writings": {
    name: "Writings",
  },
  "/now": {
    name: "Now",
  },
  "/rss": {
    name: "RSS",
  },
};

type SearchSnippet = {
  text: string;
  highlightStart: number;
  highlightEnd: number;
};

type SearchResult = {
  slug: string;
  title: string;
  summary?: string;
  snippets: SearchSnippet[];
};

function SnippetWithHighlight({
  text,
  highlightStart,
  highlightEnd,
}: SearchSnippet) {
  const before = text.slice(0, highlightStart);
  const match = text.slice(highlightStart, highlightEnd);
  const after = text.slice(highlightEnd);
  return (
    <span className="text-neutral-600 text-sm">
      {before}
      <mark className="bg-yellow-200 rounded px-0.5">{match}</mark>
      {after}
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [tocHeadings, setTocHeadings] = useState<TocHeading[]>([]);

  useEffect(() => {
    if (!isPostPage(pathname)) {
      setTocHeadings([]);
      return;
    }
    const t = setTimeout(() => {
      const el = document.getElementById("toc-headings");
      const raw = el?.getAttribute("data-headings");
      if (raw) {
        try {
          setTocHeadings(JSON.parse(raw));
        } catch {
          setTocHeadings([]);
        }
      } else {
        setTocHeadings([]);
      }
    }, 0);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((res) => res.json())
        .then((data: { results: SearchResult[] }) => {
          setResults(data.results ?? []);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
      debounceRef.current = null;
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const showResults = query.trim().length >= 2 && showDropdown;

  const handleSearchFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    if (query.trim().length >= 2) setShowDropdown(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.trim().length >= 2) setShowDropdown(true);
  };

  const handleSearchBlur = () => {
    blurTimeoutRef.current = setTimeout(() => setShowDropdown(false), 150);
  };

  const closeSearchAndClear = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setShowDropdown(false);
    setMobileSearchOpen(false);
    setQuery("");
    setResults([]);
  };

  const openMobileSearch = () => {
    setMobileSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (mobileSearchOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [mobileSearchOpen]);

  const mobileSearchModal =
    typeof document !== "undefined" &&
    mobileSearchOpen &&
    createPortal(
      <div
        className="fixed inset-0 z-50 flex flex-col bg-white"
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        <div className="flex items-center gap-2 p-4 border-b border-neutral-200 shrink-0">
          <div className="flex-1 min-w-0 relative flex items-center rounded-full border border-neutral-200 bg-neutral-50 focus-within:border-neutral-300 focus-within:bg-white">
            <Search className="size-4 text-neutral-400 shrink-0 absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search"
              value={query}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="w-full min-w-0 py-2 pl-9 pr-3 text-base bg-transparent rounded-full text-neutral-600 placeholder:text-neutral-400 focus:outline-none"
              aria-label="Search writings"
            />
          </div>
          <button
            type="button"
            onClick={() => setMobileSearchOpen(false)}
            className="p-2 -m-2 text-neutral-500 hover:text-neutral-700 touch-manipulation shrink-0"
            aria-label="Close search"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
          {query.trim().length >= 2 ? (
            loading ? (
              <p className="py-4 text-neutral-500 text-sm">Searching…</p>
            ) : results.length === 0 ? (
              <p className="py-4 text-neutral-500 text-sm">
                No results for &quot;{query.trim()}&quot;
              </p>
            ) : (
              <ul className="py-2">
                {results.map((r) => (
                  <li key={r.slug} className="border-b border-neutral-100 last:border-0">
                    <Link
                      href={`/${r.slug}`}
                      className="block py-3 px-0 hover:bg-neutral-50 active:bg-neutral-100 transition-colors touch-manipulation"
                      onClick={closeSearchAndClear}
                    >
                      <span className="font-medium text-neutral-900 block">
                        {r.title}
                      </span>
                      {r.snippets[0] && (
                        <SnippetWithHighlight
                          text={r.snippets[0].text}
                          highlightStart={r.snippets[0].highlightStart}
                          highlightEnd={r.snippets[0].highlightEnd}
                        />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <p className="py-4 text-neutral-400 text-sm">Type to search…</p>
          )}
        </div>
      </div>,
      document.body
    );

  return (
    <aside className="-ml-[8px] mb-8 tracking-tight pl-4">
      <div className="lg:sticky lg:top-20">
        <nav
          className="flex flex-row items-start relative px-0 pb-0 scroll-pr-6 md:relative"
          id="nav"
        >
          <div className="flex flex-row flex-wrap items-center gap-x-0 gap-y-2 w-full">
            <div className="flex flex-row space-x-0 pr-4 min-w-0 shrink">
              {Object.entries(navItems).map(([path, { name }]) => {
                return (
                  <Link
                    key={path}
                    href={path}
                    className={`flex align-middle relative py-1 px-2 transition-colors ${
                      path === pathname ? "underline" : "hover:underline"
                    }`}
                  >
                    {name}
                  </Link>
                );
              })}
            </div>
            <div className="relative ml-auto flex items-center gap-0 shrink-0">
              {tocHeadings.length > 0 && (
                <div className="lg:hidden">
                  <TocMobileButton headings={tocHeadings} />
                </div>
              )}
              {/* Mobile: magnifying glass opens search modal */}
              <button
                type="button"
                onClick={openMobileSearch}
                className="lg:hidden flex items-center justify-center py-1 px-2 text-neutral-500 hover:text-neutral-700 touch-manipulation"
                aria-label="Open search"
              >
                <Search className="size-5" />
              </button>
              {/* Desktop: inline search bar and dropdown */}
              <div className="hidden lg:block relative w-44">
                <div className="relative flex items-center w-44 rounded-full border border-neutral-200 bg-neutral-50 focus-within:border-neutral-300 focus-within:bg-white">
                  <Search className="size-3 text-neutral-400 shrink-0 absolute left-2.5 pointer-events-none" />
                  <input
                    type="search"
                    placeholder="Search"
                    value={query}
                    onChange={handleSearchChange}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    className="w-full min-w-0 py-1 pl-7 pr-2.5 text-xs bg-transparent rounded-full text-neutral-600 placeholder:text-neutral-400 focus:outline-none"
                    aria-label="Search writings"
                  />
                </div>
                {showResults && (
                  <div className="absolute left-0 top-full mt-1 w-80 max-h-[70vh] overflow-y-auto bg-white border border-neutral-200 rounded-md py-1 z-10 shadow-md">
                    {loading ? (
                      <p className="py-3 px-3 text-neutral-500 text-sm">
                        Searching…
                      </p>
                    ) : results.length === 0 ? (
                      <p className="py-3 px-3 text-neutral-500 text-sm">
                        No results for &quot;{query.trim()}&quot;
                      </p>
                    ) : (
                      <ul className="py-0">
                        {results.map((r) => (
                          <li key={r.slug} className="border-b border-neutral-100 last:border-0">
                            <Link
                              href={`/${r.slug}`}
                              className="block py-2 px-3 hover:bg-neutral-50 transition-colors"
                              onClick={closeSearchAndClear}
                            >
                              <span className="font-medium text-neutral-900 block">
                                {r.title}
                              </span>
                              {r.snippets[0] && (
                                <SnippetWithHighlight
                                  text={r.snippets[0].text}
                                  highlightStart={r.snippets[0].highlightStart}
                                  highlightEnd={r.snippets[0].highlightEnd}
                                />
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>
      {mobileSearchModal}
    </aside>
  );
}
