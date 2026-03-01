"use client";

import { usePathname } from "next/navigation";

const NARROW_PATHS = new Set(["writings", "about", "now", "rss"]);
const TOC_PORTAL_ID = "toc-portal";

export function PostPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const segments = pathname.replace(/^\//, "").split("/").filter(Boolean);
  const isPostPage =
    segments.length === 1 && !NARROW_PATHS.has(segments[0]);

  if (!isPostPage) {
    return <>{children}</>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_36rem_1fr] gap-x-16 gap-y-8 items-stretch">
      <div
        id={TOC_PORTAL_ID}
        className="hidden lg:block min-w-0"
        aria-hidden
      />
      <div className="min-w-0">{children}</div>
      <div className="hidden lg:block min-w-0" aria-hidden />
    </div>
  );
}
