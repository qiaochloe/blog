"use client";
import { useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

// Props passed to PostLists
export type Post = {
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
type Tag = "general" | "school" | "project" | "reflection";

const defaultSelectedTags: Record<Tag, boolean> = {
  general: true,
  school: true,
  project: true,
  reflection: true,
};

const tagTextColor: Record<Tag, string> = {
  general: "text-amber-800",
  school: "text-sky-800",
  project: "text-rose-800",
  reflection: "text-emerald-800",
};

const tagBGColor: Record<Tag, string> = {
  general: "bg-amber-100",
  school: "bg-sky-100",
  project: "bg-rose-100",
  reflection: "bg-emerald-100",
};

const dotColor: Record<Tag, string> = {
  general: "bg-amber-300",
  school: "bg-sky-300",
  project: "bg-rose-300",
  reflection: "bg-emerald-300",
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
      <div className="pt-2 pb-4">
        {Object.keys(selectedTags).map((tag: Tag) => (
          <button
            key={tag}
            className={`${
              selectedTags[tag]
                ? `${tagTextColor[tag]} ${tagBGColor[tag]}`
                : "bg-gray-300 text-gray-600"
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
            const isreflectionA = a.data.tags.every(
              (tag: string) => tag === "reflection",
            );
            const isreflectionB = b.data.tags.every(
              (tag: string) => tag === "reflection",
            );

            // reflection posts go to the end
            if (isreflectionA !== isreflectionB) {
              return isreflectionA ? 1 : -1;
            }

            // Otherwise, sort alphabetically by title
            return a.data.title.localeCompare(b.data.title);
          })
          .map((post) => (
            <div
              key={post.slug}
              className="grid grid-cols-[25px_1fr] py-2 gap-x-3"
            >
              <div className="flex space-x-1 items-center justify-end">
                {post.data.tags.map((tag) => (
                  <div
                    key={`${post.slug}-${tag}`}
                    className={`rounded-sm size-2 ${dotColor[tag]}`}
                  />
                ))}
              </div>
              <h2>
                <Link
                  href={post.data.isExternalLink ? post.slug : `/${post.slug}`}
                  className="text-neutral-900 tracking-tight inline-flex hover:underline space-x-1"
                >
                  <div>{post.data.title}</div>{" "}
                  {post.data.isExternalLink && (
                    <ExternalLink className="size-3 text-neutral-500" />
                  )}
                </Link>
              </h2>
              <div></div>
              <p className="text-neutral-600 text-sm my-1">
                {post.data.summary}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
