"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TableOfContents } from "./TableOfContents";
import type { TocHeading } from "app/utils/headings";

const TOC_PORTAL_ID = "toc-portal";

export function TocPortal({ headings }: { headings: TocHeading[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const target = typeof document !== "undefined" ? document.getElementById(TOC_PORTAL_ID) : null;
  if (!target) return null;

  return createPortal(
    <TableOfContents headings={headings} variant="sidebar" />,
    target
  );
}
