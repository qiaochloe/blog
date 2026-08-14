import { getPosts } from "app/posts";
import { Post, PostsList } from "app/writings/PostsList";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Writings",
  description: "Writings from Chloe Qiao.",
};

const externalLinks: Post[] = [
  {
    data: {
      title: "2025 Brown Puzzle Hunt wrapup",
      summary: "Tech wrapup of 2025 BPH",
      publishedAt: new Date("2025-04-30"),
      tags: ["hobby"],
      isExternalLink: true,
    },
    slug: "https://2025.brownpuzzlehunt.com/wrapup",
    content: "",
  },
];

export default function Page() {
  const allPosts = [...getPosts(), ...externalLinks];

  return (
    <section className="px-2">
      <h1 className="font-semibold text-2xl mb-4 tracking-tight">Writings</h1>
      <Suspense>
        <PostsList allPosts={allPosts} />
      </Suspense>
    </section>
  );
}
