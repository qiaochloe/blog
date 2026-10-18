"use client";

import { usePathname } from "next/navigation";

const NARROW_PATHS = new Set(["writings", "now", "rss", "projects"]);

export function MaxWidthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segments = pathname.replace(/^\//, "").split("/").filter(Boolean);
  const isPostPage = segments.length === 1 && !NARROW_PATHS.has(segments[0]);
  const maxWidthClass = isPostPage
    ? "max-w-5xl xl:max-w-6xl 2xl:max-w-7xl"
    : "max-w-[38rem]";

  return (
    <div className={`${maxWidthClass} w-full mt-8 mx-auto px-4 overflow-visible`}>
      {children}
    </div>
  );
}
