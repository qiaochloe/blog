"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";

const NARROW_PATHS = new Set(["writings", "now", "rss", "projects"]);

function isPostPage(pathname: string): boolean {
  const segments = pathname.replace(/^\//, "").split("/").filter(Boolean);
  return segments.length === 1 && !NARROW_PATHS.has(segments[0]);
}

export function BackToTopButton() {
  const pathname = usePathname();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    if (!isPostPage(pathname)) return;

    const onScroll = () => {
      setShowTop(window.scrollY > 400);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  if (!isPostPage(pathname)) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={
        showTop
          ? "fixed bottom-5 right-5 z-[100] flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-opacity opacity-100 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
          : "fixed bottom-5 right-5 z-[100] pointer-events-none flex h-10 w-10 items-center justify-center opacity-0"
      }
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5" aria-hidden />
    </button>
  );
}
