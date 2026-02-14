import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomMDX } from "app/components/mdx";
import { getPosts } from "app/posts";
import { formatDate } from "app/utils";
import { preprocessGfmTables } from "app/utils/gfm-tables";
import { baseUrl } from "app/sitemap";
import MarkdownIt from "markdown-it";

// This page is just for generating the markdown files in the `app/markdown` directory.

export async function generateStaticParams() {
  let posts = getPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPosts().find((post) => post.slug === slug);
  if (!post) return {};

  const title = post.data.title ?? post.slug ?? "Untitled";
  const description = post.data.summary ?? "";
  const publishedAt = post.data.publishedAt;
  const ogImage = `${baseUrl}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      ...(publishedAt && { publishedTime: publishedAt.toISOString() }),
      url: `${baseUrl}/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function Page({ params }) {
  const md = new MarkdownIt();

  const { slug } = await params;
  let post = getPosts().find((post) => post.slug === slug);

  if (!post) {
    notFound();
  }

  const title = post.data.title ?? post.slug ?? "Untitled";

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blogposting",
            headline: title,
            ...(post.data.publishedAt && {
              datePublished: post.data.publishedAt.toISOString(),
            }),
            ...(post.data.updatedAt && {
              dateModified: post.data.updatedAt.toISOString(),
            }),
            description: post.data.summary ?? "",
            image: `/og?title=${encodeURIComponent(title)}`,
            url: `${baseUrl}/${post.slug}`,
            author: {
              "@type": "Person",
              name: "Chloe Qiao",
            },
          }),
        }}
      />
      {!post.data.tags?.includes("notes") ? (
        <div>
          <h1 className="title font-semibold text-2xl tracking-tighter">
            <div
              dangerouslySetInnerHTML={{
                __html: md.renderInline(title),
              }}
            />
          </h1>
          <div className="justify-between items-center mt-2 mb-8 text-sm text-neutral-600">
            {post.data.publishedAt && (
              <p className="">{formatDate(post.data.publishedAt)}</p>
            )}
            {post.data.updatedAt && (
              <p>Updated {formatDate(post.data.updatedAt)}</p>
            )}
          </div>
          <article className="prose">
            <CustomMDX source={preprocessGfmTables(post.content)} />
          </article>
        </div>
      ) : (
        <div className="prose-notes">
          <h1 className="title font-semibold text-2xl tracking-tighter">
            <div
              dangerouslySetInnerHTML={{
                __html: md.renderInline(title),
              }}
            />
          </h1>
          <article>
            <CustomMDX source={preprocessGfmTables(post.content)} />
          </article>
        </div>
      )}
    </section>
  );
}
