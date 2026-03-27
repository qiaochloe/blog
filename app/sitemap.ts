import { getPosts } from "app/posts";
import type { MetadataRoute } from "next";

export const baseUrl = "https://qiaochloe.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const blogs = getPosts().map((post) => ({
    url: `${baseUrl}/${post.slug}`,
    lastModified: post.data.updatedAt ?? post.data.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const routes = ["", "/writings", "/projects"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  return [...routes, ...blogs];
}
