import Link from "next/link";
import { getPosts, formatDate } from "./utils";
import MarkdownIt from "markdown-it";

export default function Page() {
  // For titles
  const md = new MarkdownIt();
  const now = new Date();
  const all = getPosts()
    .map((post) => ({
      ...post,
      recentDate: post.data.updatedAt
        ? post.data.updatedAt
        : post.data.publishedAt,
    }))
    .filter(
      (post) =>
        now.getTime() - post.recentDate.getTime() < 29 * 24 * 60 * 60 * 1000,
    )
    .sort((a, b) => {
      return b.recentDate.getTime() - a.recentDate.getTime();
    });

  const posts = all.filter((post) => !post.data.tags?.includes("notes"));

  const notes = all.filter((post) => post.data.tags?.includes("notes"));

  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">Hi.</h1>
      <p className="mb-8">
        My name is Chloe Qiao. I can be reached at qiaochloe [at] gmail [dot]
        com.
      </p>
      {posts.length > 0 && (
        <h1 className="mb-2 text-xl font-semibold tracking-tighter">
          Thoughts
        </h1>
      )}
      {posts.map((post) => (
        <div key={post.slug} className="w-full pb-1">
          <div className="flex justify-between">
            <Link href={`/${post.slug}`}>
              <h2 className="text-neutral-900 tracking-tight hover:underline">
                {post.data.title}
              </h2>
            </Link>
            <p className="text-neutral-600 tracking-tight text-sm">
              {formatDate(String(post.recentDate))}
            </p>
          </div>
        </div>
      ))}
      {notes.length > 0 && (
        <h1 className="my-8 mb-4 text-xl font-semibold tracking-tighter">
          Notes
        </h1>
      )}
      {notes.map((post) => (
        <div key={post.slug} className="w-full pb-1">
          <div className="flex justify-between">
            <Link href={`/${post.slug}`}>
              <h2 className="text-neutral-900 tracking-tight hover:underline">
                <div
                  dangerouslySetInnerHTML={{
                    __html: md.renderInline(post.data.title),
                  }}
                />
              </h2>
            </Link>
            <p className="text-neutral-600 tracking-tight text-sm">
              {formatDate(String(post.recentDate))}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
