"use client";
import { useState, useMemo } from "react";
import { formatDate } from "app/utils";
import Link from "next/link";
import MarkdownIt from "markdown-it";
import { ExternalLink, Calendar, ArrowDownAZ } from "lucide-react";

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
type Tag = "hobby" | "advice" | "reflection" | "notes";
const defaultTags = ["hobby", "advice", "reflection", "notes"];

const tagTextColor: Record<Tag, string> = {
  hobby: "text-amber-800",
  advice: "text-sky-800",
  reflection: "text-emerald-800",
  notes: "text-violet-800",
};

const tagBGColor: Record<Tag, string> = {
  hobby: "bg-amber-100",
  advice: "bg-sky-100",
  reflection: "bg-emerald-100",
  notes: "bg-violet-100",
};

const tagDotColor: Record<Tag, string> = {
  hobby: "bg-amber-300",
  advice: "bg-sky-300",
  reflection: "bg-emerald-300",
  notes: "bg-violet-300",
};

export function PostsList({ allPosts }: PostsListProps) {
  // SORT
  const [sort, setSort] = useState<string>("chrono");

  const toggleSort = () => {
    const sortOrder = ["chrono", "alpha"];
    const index = sortOrder.indexOf(sort);
    const nextIndex = (index + 1) % sortOrder.length;
    const newSort = sortOrder[nextIndex];
    setSort(newSort);
  };

  // TAGS
  const tagMap = Object.fromEntries(
    defaultTags.map((tag) => [tag, true]),
  ) as Record<Tag, boolean>;
  const [selectedTags, setSelectedTags] =
    useState<Record<Tag, boolean>>(tagMap);

  const toggleTag = (tag: Tag) => {
    const updated = {
      ...selectedTags,
      [tag]: !selectedTags[tag],
    };
    setSelectedTags(updated);
  };

  // Filtered and sorted posts
  const currPosts = useMemo(() => {
    const alphaSort = (a: Post, b: Post) => {
      const aNormalized = (a.data.title ?? "").replace(/^[_*~`]+/, "").trim();
      const bNormalized = (b.data.title ?? "").replace(/^[_*~`]+/, "").trim();
      return aNormalized.localeCompare(bNormalized);
    };
    const chronoSort = (a: Post, b: Post) => {
      const aDate = a.data.updatedAt ?? a.data.publishedAt;
      const bDate = b.data.updatedAt ?? b.data.publishedAt;
      return (bDate?.getTime() ?? 0) - (aDate?.getTime() ?? 0);
    };

    return allPosts
      .filter((post) => {
        return post.data.tags?.some((tag: Tag) => selectedTags[tag]) ?? false;
      })
      .sort(sort === "alpha" ? alphaSort : chronoSort);
  }, [sort, selectedTags]);

  // For titles
  const md = new MarkdownIt();

  return (
    <div className="w-full">
      <div className="flex justify-between pt-2 pb-4 align-bottom gap-x-2">
        <div className="flex flex-wrap">
          {Object.keys(selectedTags).map((tag: Tag) => (
            <button
              key={tag}
              className={`${
                selectedTags[tag]
                  ? `${tagTextColor[tag]} ${tagBGColor[tag]}`
                  : "bg-gray-300 text-gray-600"
              } text-sm font-medium m-1 first:ml-0 px-2.5 py-0.5 rounded-full cursor-pointer`}
              onClick={() => toggleTag(tag)}
            >
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </button>
          ))}
        </div>
        <div
          className="size-6 px-1 py-1 m-1 bg-orange-200 rounded-lg text-orange-700 flex items-center justify-center cursor-pointer transition"
          onClick={toggleSort}
        >
          {sort === "alpha" ? (
            <ArrowDownAZ className="size-4" />
          ) : (
            <Calendar className="size-4" />
          )}
        </div>
      </div>

      <div>
        {currPosts.map((post) => (
          <div
            key={post.slug}
            className="grid grid-cols-[25px_1fr] sm:grid-cols-[25px_1fr_4em] py-2 gap-x-3"
          >
            <div className="flex space-x-1 items-center justify-end">
              {post.data.tags.map((tag: Tag) => (
                <div
                  key={`${post.slug}-${tag}`}
                  className={`rounded-sm size-2 ${tagDotColor[tag]}`}
                />
              ))}
            </div>
            <h2>
              <Link
                href={post.data.isExternalLink ? post.slug : `/${post.slug}`}
                className="text-neutral-900 tracking-tight inline-flex hover:underline space-x-1"
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: md.renderInline(post.data.title ?? post.slug),
                  }}
                />{" "}
                {post.data.isExternalLink && (
                  <ExternalLink className="size-3 text-neutral-500" />
                )}
              </Link>
            </h2>
            <p className="text-neutral-600 tracking-tight text-sm hidden sm:block">
              {formatDate(post.data.updatedAt ?? post.data.publishedAt)}
            </p>
            <div></div>
            <p className="text-neutral-600 text-sm my-1">
              {post.data.summary ?? ""}
            </p>
            <div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
