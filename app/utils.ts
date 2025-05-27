import fs from "fs";
import path from "path";
import matter from "gray-matter";

type Frontmatter = {
  title: string;
  summary: string;
  publishedAt: Date;
  updatedAt?: Date;
  tags: string[];
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

    return {
      data: {
        ...frontmatter,
        publishedAt: new Date(frontmatter.publishedAt),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
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

export function formatDate(date: string | Date, includeRelative = false) {
  // Coerce string to Date
  if (typeof date === "string") {
    if (!date.includes("T")) {
      date = `${date}T00:00:00`;
    }
    date = new Date(date);
  }

  const targetDate = date;
  const currentDate = new Date();
  const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
  const monthsAgo = currentDate.getMonth() - targetDate.getMonth();
  const daysAgo = currentDate.getDate() - targetDate.getDate();

  let formattedDate = "";

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`;
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`;
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`;
  } else {
    formattedDate = "Today";
  }

  let fullDate = targetDate.toLocaleString("en-us", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (!includeRelative) {
    return fullDate;
  }

  return `${fullDate} (${formattedDate})`;
}
