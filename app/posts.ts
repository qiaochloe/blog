import fs from "fs";
import path from "path";
import matter from "gray-matter";

type Frontmatter = {
  title?: string;
  summary?: string;
  publishedAt?: Date;
  updatedAt?: Date;
  tags?: string[];
};

type Post = {
  data: Frontmatter;
  slug: string;
  content: string;
};

function getMDXData(dir: string): Post[] {
  const fileNames = fs
    .readdirSync(dir)
    .filter(
      (file) => path.extname(file) === ".mdx" || path.extname(file) === ".md",
    );

  const fileData = fileNames.map((fileName) => {
    const filePath = path.join(dir, fileName);
    const { data, content } = matter(fs.readFileSync(filePath, "utf-8"));
    const frontmatter = data as Frontmatter;
    const slug = path.basename(fileName, path.extname(fileName));

    const rawPublished = frontmatter.publishedAt;
    const publishedAt =
      rawPublished != null && String(rawPublished).trim() !== ""
        ? rawPublished instanceof Date
          ? rawPublished
          : new Date(rawPublished as string | number)
        : undefined;
    const updatedAt = data.updatedAt ? new Date(data.updatedAt) : undefined;
    const validPublished =
      publishedAt != null && Number.isFinite(publishedAt.getTime())
        ? publishedAt
        : undefined;
    const validUpdated =
      updatedAt != null && Number.isFinite(updatedAt.getTime())
        ? updatedAt
        : undefined;
    return {
      data: {
        ...frontmatter,
        publishedAt: validPublished,
        updatedAt: validUpdated,
      },
      slug,
      content,
    };
  });

  return fileData;
}

export function getPosts(): Post[] {
  return getMDXData(path.join(process.cwd(), "app", "markdown"));
}
