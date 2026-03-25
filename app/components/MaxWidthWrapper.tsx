"use client";

import { usePathname } from "next/navigation";

const NARROW_PATHS = new Set(["writings", "now", "rss", "projects"]);

export function MaxWidthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const segments = pathname.replace(/^\//, "").split("/").filter(Boolean);
  const isPostPage =
    segments.length === 1 && !NARROW_PATHS.has(segments[0]);
  const maxWidthClass = isPostPage ? "max-w-5xl" : "max-w-xl";

  const paddingClass = isPostPage ? "pl-0 pr-4" : "px-2";

  return (
    <div className={`${maxWidthClass} mt-8 mx-auto ${paddingClass} overflow-visible`}>
      {children}
    </div>
  );
}
