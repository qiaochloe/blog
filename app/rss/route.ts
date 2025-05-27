import { baseUrl } from "app/sitemap";
import { getPosts } from "app/utils";

export async function GET() {
  let allWritings = getPosts();

  const itemsXml = allWritings
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())
    .map(
      (post) =>
        `<item>
          <title>${post.data.title}</title>
          <link>${baseUrl}/${post.slug}</link>
          <description>${post.data.summary}</description>
          <pubDate>${post.data.publishedAt.toUTCString()}</pubDate>
        </item>`,
    )
    .join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
        <title>Chloe Qiao</title>
        <link>${baseUrl}</link>
        <description>I write about computers sometimes.</description>
        ${itemsXml}
    </channel>
  </rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}
