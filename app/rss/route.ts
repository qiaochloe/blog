import { baseUrl } from "app/sitemap";
import { getPosts } from "app/posts";

function escapeXml(unsafe: unknown): string {
  return String(unsafe ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const allWritings = getPosts();

  const itemsXml = allWritings
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())
    .map(
      (post) => `
        <item>
          <title>${escapeXml(post.data.title)}</title>
          <link>${escapeXml(`${baseUrl}/${post.slug}`)}</link>
          <description>${escapeXml(post.data.summary ?? "")}</description>
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
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
