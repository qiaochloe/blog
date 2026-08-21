import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomMDX } from "app/components/mdx";
import { TableOfContents } from "app/components/TableOfContents";
import { TocPortal } from "app/components/TocPortal";
import { getPosts } from "app/posts";
import { formatDate } from "app/utils";
import { preprocessGfmTables } from "app/utils/gfm-tables";
import { preprocessFootnotes } from "app/utils/footnotes";
import { extractHeadings } from "app/utils/headings";
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

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const md = new MarkdownIt();

  const { slug } = await params;
  let post = getPosts().find((post) => post.slug === slug);

  if (!post) {
    notFound();
  }

  const title = post.data.title ?? post.slug ?? "Untitled";
  const headings = extractHeadings(post.content);
  const showToc = headings.length >= 1;
  const processedContent = preprocessFootnotes(preprocessGfmTables(post.content));
  const isNotes = post.data.tags?.includes("notes");

  const headerContent = (
    <>
      <h1 className="title font-semibold text-2xl tracking-tight">
        <div
          dangerouslySetInnerHTML={{
            __html: md.renderInline(title),
          }}
        />
      </h1>
      {!isNotes && (
        <div className="mt-2 mb-8 text-sm text-neutral-600">
          {post.data.publishedAt && (
            <p>Published {formatDate(post.data.publishedAt)}</p>
          )}
          {post.data.updatedAt && (
            <p>Updated {formatDate(post.data.updatedAt)}</p>
          )}
        </div>
      )}
    </>
  );

  const bodyContent = (
    <article className={isNotes ? undefined : "prose"}>
      <CustomMDX source={processedContent} />
    </article>
  );

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
      {showToc && <TocPortal headings={headings} />}
      <div className="min-w-0 max-w-xl overflow-x-hidden px-2">
        <div className={isNotes ? "prose-notes" : undefined}>{headerContent}</div>
        {showToc && <TableOfContents headings={headings} variant="mobile" />}
        <div className={isNotes ? "prose-notes" : undefined}>{bodyContent}</div>
      </div>
    </section>
  );
}
