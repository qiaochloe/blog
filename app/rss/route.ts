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
    .filter((post) => post.data.publishedAt != null)
    .sort(
      (a, b) =>
        (b.data.publishedAt?.getTime() ?? 0) -
        (a.data.publishedAt?.getTime() ?? 0),
    )
    .map((post) => {
      const link = `${baseUrl}/${post.slug}`;
      const title = post.data.title ?? post.slug;
      const description =
        post.data.summary?.trim() || `${title} — Read the full post.`;
      return `<item>
  <title>${escapeXml(title)}</title>
  <link>${escapeXml(link)}</link>
  <description>${escapeXml(description)}</description>
  <pubDate>${post.data.publishedAt!.toUTCString()}</pubDate>
  <guid isPermaLink="true">${escapeXml(link)}</guid>
</item>`;
    })
    .join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Chloe Qiao</title>
    <link>${baseUrl}</link>
    <description>I write about computers sometimes.</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(`${baseUrl}/rss`)}" rel="self" type="application/rss+xml"/>
${itemsXml.split("\n").map((line) => "    " + line).join("\n")}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
