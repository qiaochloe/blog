import React from "react";

export function Extra({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="my-4">
      <summary className="extra-summary">{title}</summary>
      <div className="mt-2 bg-neutral-100 px-4 py-2">{children}</div>
    </details>
  );
}
