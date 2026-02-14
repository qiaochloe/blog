import Link from "next/link";
import MarkdownIt from "markdown-it";
import { getPosts } from "app/posts";
import { formatDate } from "app/utils";

export default function Page() {
  // For titles
  const md = new MarkdownIt();
  const now = new Date();
  type Post = ReturnType<typeof getPosts>[number];
  const recentDate = (post: Post) =>
    post.data.updatedAt ?? post.data.publishedAt;
  const all = getPosts()
    .map((post) => ({ ...post, recentDate: recentDate(post) }))
    .filter(
      (post): post is Post & { recentDate: Date } =>
        post.recentDate != null &&
        now.getTime() - post.recentDate.getTime() < 29 * 24 * 60 * 60 * 1000,
    )
    .sort((a, b) => b.recentDate.getTime() - a.recentDate.getTime());

  const posts = all.filter((post) => !post.data.tags?.includes("notes"));
  const notes = all.filter((post) => post.data.tags?.includes("notes"));

  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Hi.</h1>
      <p className="mb-4">
        I'm Chloe Qiao. I am an undergraduate student at Brown University
        studying computer science. I am broadly interested in building systems.
      </p>

      <p className="mb-8">
        Outside of work, I like{" "}
        <Link
          href="/fiction"
          className="underline transition-all decoration-neutral-400 underline-offset-2 decoration-[0.1em]"
        >
          reading
        </Link>
        ,{" "}
        <Link
          href="/writings"
          className="underline transition-all decoration-neutral-400 underline-offset-2 decoration-[0.1em]"
        >
          writing
        </Link>
        ,{" "}
        <Link
          href="/climbing"
          className="underline transition-all decoration-neutral-400 underline-offset-2 decoration-[0.1em]"
        >
          climbing
        </Link>
        , and{" "}
        <Link
          href="/cooking"
          className="underline transition-all decoration-neutral-400 underline-offset-2 decoration-[0.1em]"
        >
          cooking
        </Link>
        . For what I'm up to these days, take a look at my{" "}
        <Link
          href="/now"
          className="underline transition-all decoration-neutral-400 underline-offset-2 decoration-[0.1em]"
        >
          now
        </Link>{" "}
        page.
      </p>
      {posts.length > 0 && (
        <h1 className="mb-2 text-xl font-semibold tracking-tight">Thoughts</h1>
      )}
      {posts.map((post) => (
        <div key={post.slug} className="w-full pb-1">
          <div className="flex justify-between">
            <Link href={`/${post.slug}`}>
              <h2 className="text-neutral-900 tracking-tight hover:underline">
                {post.data.title ?? post.slug}
              </h2>
            </Link>
            <p className="text-neutral-600 tracking-tight text-sm">
              {formatDate(post.recentDate)}
            </p>
          </div>
        </div>
      ))}
      {notes.length > 0 && (
        <h1 className="my-8 mb-4 text-xl font-semibold tracking-tight">
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
                    __html: md.renderInline(post.data.title ?? post.slug),
                  }}
                />
              </h2>
            </Link>
            <p className="text-neutral-600 tracking-tight text-sm">
              {formatDate(post.recentDate)}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
