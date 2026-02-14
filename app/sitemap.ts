import { getPosts } from "app/posts";
export const baseUrl = "https://qiaochloe.com";

export default async function sitemap() {
  let blogs = getPosts().map((post) => ({
    url: `${baseUrl}/${post.slug}`,
    lastModified: post.data.updatedAt ?? post.data.publishedAt,
  }));

  let routes = [""].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...blogs];
}
