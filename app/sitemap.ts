import { getPosts } from "app/utils";

// TODO: Update the base URL
export const baseUrl = "localhost:3000";

export default async function sitemap() {
  let blogs = getPosts().map((post) => ({
    url: `${baseUrl}/${post.slug}`,
    lastModified: post.data.publishedAt,
  }));

  let routes = [""].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...blogs];
}
