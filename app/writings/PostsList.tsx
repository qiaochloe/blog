"use client";
import { useState } from "react";
import Link from "next/link";

// Props passed to PostLists
type Post = {
  data: {
    [key: string]: any;
  };
  slug: string;
  content: string;
};

type PostsListProps = {
  allPosts: Post[];
};

// Tags
type Tag = "general" | "academic" | "technical" | "archive" | "extra";

const defaultSelectedTags: Record<Tag, boolean> = {
  general: true,
  academic: true,
  technical: true,
  archive: false,
  extra: false,
};

const tagClass: Record<Tag, string> = {
  general: "bg-amber-100 text-amber-800",
  academic: "bg-sky-100 text-sky-800",
  technical: "bg-rose-100 text-rose-800",
  archive: "bg-emerald-100 text-emerald-800",
  extra: "bg-indigo-100 text-indigo-800",
};

export function PostsList({ allPosts }: PostsListProps) {
  const [selectedTags, setSelectedTags] =
    useState<Record<Tag, boolean>>(defaultSelectedTags);

  const toggleTag = (tag: Tag) => {
    setSelectedTags((prevTags) => ({
      ...prevTags,
      [tag]: !prevTags[tag],
    }));
  };

  return (
    <div>
      <div className="pb-2">
        {Object.keys(selectedTags).map((tag: Tag) => (
          <button
            key={tag}
            className={`${
              selectedTags[tag] ? tagClass[tag] : "bg-gray-300 text-gray-600"
            } text-sm font-medium me-2 px-2.5 py-0.5 rounded-full cursor-pointer`}
            onClick={() => toggleTag(tag)}
          >
            {tag.charAt(0).toUpperCase() + tag.slice(1)}
          </button>
        ))}
      </div>

      <div>
        {allPosts
          .filter((post) => {
            return (
              post.data.tags?.some((tag: Tag) => selectedTags[tag]) ?? false
            );
          })
          .sort((a, b) => {
            const isArchiveA = a.data.tags.includes("archive");
            const isArchiveB = b.data.tags.includes("archive");
            const isExtraA = a.data.tags.includes("extra");
            const isExtraB = b.data.tags.includes("extra");

            // Archive posts go to the end
            if (isArchiveA !== isArchiveB) {
              return isArchiveA ? 1 : -1;
            }

            // Extra posts go to the end too
            if (isExtraA !== isExtraB) {
              return isExtraA ? 1 : -1;
            }

            // If both are archive or extra, sort by published date (oldest first)
            if ((isArchiveA && isArchiveB) || (isExtraA && isExtraB)) {
              return a.data.publishedAt.localeCompare(b.data.publishedAt);
            }

            // Otherwise, sort alphabetically by title
            return a.data.title.localeCompare(b.data.title);
          })
          .map((post) => (
            <Link key={post.slug} href={`/${post.slug}`}>
              <div className="w-full py-4">
                <h2 className="text-neutral-900 tracking-tight">
                  {post.data.title}
                </h2>
                <p className="text-neutral-600 italic">{post.data.summary}</p>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
