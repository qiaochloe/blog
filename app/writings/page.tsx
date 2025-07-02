import { getPosts } from "app/posts";
import { Post, PostsList } from "app/writings/PostsList";

export const metadata = {
  title: "Writings",
  description: "Writings from Chloe Qiao.",
};

const externalLinks: Post[] = [
  {
    data: {
      title: "2025 Brown Puzzle Hunt",
      summary: "Tech wrapup of 2025 BPH",
      publishedAt: new Date("2025-04-30"),
      tags: ["school", "project"],
      isExternalLink: true,
    },
    slug: "https://2025.brownpuzzlehunt.com/wrapup",
    content: "",
  },
];

export default function Page() {
  const allPosts = [...getPosts(), ...externalLinks];

  return (
    <section>
      <h1 className="font-semibold text-2xl mb-4 tracking-tighter">Writings</h1>
      <PostsList allPosts={allPosts} />
    </section>
  );
}
