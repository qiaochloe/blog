import { notFound } from "next/navigation";
import { CustomMDX } from "app/components/mdx";
import { formatDate, getPosts } from "app/utils";
import { baseUrl } from "app/sitemap";

// This page is just for generating the markdown files in the `app/markdown` directory.

export async function generateStaticParams() {
  let posts = getPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export function generateMetadata({ params }) {
  let post = getPosts().find((post) => post.slug === params.slug);
  if (!post) {
    return {};
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.data;
  let ogImage = image
    ? image
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
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

export default function Page({ params }) {
  let post = getPosts().find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blogposting",
            headline: post.data.title,
            datePublished: post.data.publishedAt,
            dateModified: post.data.publishedAt,
            description: post.data.summary,
            image: post.data.image
              ? `${baseUrl}${post.data.image}`
              : `/og?title=${encodeURIComponent(post.data.title)}`,
            url: `${baseUrl}/${post.slug}`,
            author: {
              "@type": "Person",
              name: "Chloe Qiao",
            },
          }),
        }}
      />
      <h1 className="title font-semibold text-2xl tracking-tighter">
        {post.data.title}
      </h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {formatDate(post.data.publishedAt)}
        </p>
      </div>
      <article className="prose">
        <CustomMDX source={post.content} />
      </article>
    </section>
  );
}
