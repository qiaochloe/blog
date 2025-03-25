"use client";

export function formatDate(date: string | Date | null): string {
  if (!date) {
    return "";
  }

  if (typeof date === "string") {
    return date;
  }

  const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
  });

  return dateTimeFormatter.format(date);
}
