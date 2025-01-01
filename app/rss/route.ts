import { baseUrl } from "app/sitemap";
import { getPosts } from "app/utils";

export async function GET() {
  let allWritings = getPosts();

  const itemsXml = allWritings
    .sort((a, b) => {
      if (new Date(a.data.publishedAt) > new Date(b.data.publishedAt)) {
        return -1;
      }
      return 1;
    })
    .map(
      (post) =>
        `<item>
          <title>${post.data.title}</title>
          <link>${baseUrl}/${post.slug}</link>
          <description>${post.data.summary || ""}</description>
          <pubDate>${new Date(post.data.publishedAt).toUTCString()}</pubDate>
        </item>`,
    )
    .join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
        <title>My Portfolio</title>
        <link>${baseUrl}</link>
        <description>This is my portfolio RSS feed</description>
        ${itemsXml}
    </channel>
  </rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}
