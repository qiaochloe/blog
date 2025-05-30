import Link from "next/link";
import { getPosts, formatDate } from "./utils";

export default function Page() {
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
        post.recentDate.getMonth() === now.getMonth() &&
        post.recentDate.getUTCFullYear() === now.getUTCFullYear(),
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
        <>
          <h1 className="mb-2 text-xl font-semibold tracking-tighter">
            Thoughts
          </h1>
        </>
      )}
      {posts.map((post) => (
        <Link key={post.slug} href={`/${post.slug}`}>
          <div className="w-full py-2">
            <div className="flex justify-between ">
              <h2 className="text-neutral-900 tracking-tight">
                {post.data.title}
              </h2>
              <p className="text-neutral-600 tracking-tight text-sm">
                {formatDate(String(post.recentDate))}
              </p>
            </div>
            <p className="text-neutral-600 italic">{post.data.summary}</p>
          </div>
        </Link>
      ))}

      {notes.length > 0 && (
        <h1 className="mt-4 mb-2 text-xl font-semibold tracking-tighter">
          Notes
        </h1>
      )}
      {notes.map((post) => (
        <Link key={post.slug} href={`/${post.slug}`}>
          <div className="w-full py-2">
            <div className="flex justify-between ">
              <h2 className="text-neutral-900 tracking-tight">
                {post.data.title}
              </h2>
              <p className="text-neutral-600 tracking-tight text-sm">
                {formatDate(String(post.recentDate))}
              </p>
            </div>
            <p className="text-neutral-600 italic">{post.data.summary}</p>
          </div>
        </Link>
      ))}
    </section>
  );
}
