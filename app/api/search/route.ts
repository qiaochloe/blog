import { getPosts } from "app/posts";
import { NextRequest } from "next/server";

const SNIPPET_RADIUS = 50;
const MAX_SNIPPETS_PER_POST = 3;

function stripMarkdownForSearch(text: string): string {
  return text
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*?|__?|~~|``?/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();
}

/** Strip markdown for display in snippet previews (plain text only). */
function stripMarkdownForPreview(text: string): string {
  return text
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\s*>\s*/gm, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findSnippets(
  content: string,
  query: string,
  maxSnippets: number
): { text: string; highlightStart: number; highlightEnd: number }[] {
  const snippets: { text: string; highlightStart: number; highlightEnd: number }[] = [];
  const normalized = content.toLowerCase();
  const q = query.toLowerCase().trim();
  if (q.length === 0) return snippets;

  let fromIndex = 0;
  while (snippets.length < maxSnippets) {
    const matchIndex = normalized.indexOf(q, fromIndex);
    if (matchIndex === -1) break;

    const snippetStart = Math.max(0, matchIndex - SNIPPET_RADIUS);
    const snippetEnd = Math.min(
      content.length,
      matchIndex + q.length + SNIPPET_RADIUS
    );
    let rawText = content.slice(snippetStart, snippetEnd);
    if (snippetStart > 0) rawText = "…" + rawText;
    if (snippetEnd < content.length) rawText = rawText + "…";

    const text = stripMarkdownForPreview(rawText);
    const matchInStripped = text.toLowerCase().indexOf(q);
    if (matchInStripped === -1) {
      fromIndex = matchIndex + 1;
      continue;
    }
    const highlightStart = matchInStripped;
    const highlightEnd = highlightStart + q.length;

    snippets.push({ text, highlightStart, highlightEnd });
    fromIndex = matchIndex + 1;
  }
  return snippets;
}

function buildSnippetFromTitleOrSummary(
  field: string,
  query: string
): { text: string; highlightStart: number; highlightEnd: number } | null {
  const plain = stripMarkdownForPreview(field);
  const q = query.toLowerCase().trim();
  const matchIndex = plain.toLowerCase().indexOf(q);
  if (matchIndex === -1) return null;
  return {
    text: plain,
    highlightStart: matchIndex,
    highlightEnd: matchIndex + q.length,
  };
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return Response.json({ results: [] });
  }

  const posts = getPosts();
  const results: {
    slug: string;
    title: string;
    summary?: string;
    snippets: { text: string; highlightStart: number; highlightEnd: number }[];
  }[] = [];

  const qLower = q.toLowerCase();

  for (const post of posts) {
    const title = post.data.title ?? post.slug;
    const summary = (post.data.summary ?? "").trim();
    const contentPlain = stripMarkdownForSearch(post.content);
    const titleMatch = title.toLowerCase().includes(qLower);
    const summaryMatch = summary.toLowerCase().includes(qLower);
    const contentMatch = contentPlain.toLowerCase().includes(qLower);

    if (!titleMatch && !summaryMatch && !contentMatch) continue;

    const snippets: { text: string; highlightStart: number; highlightEnd: number }[] = [];

    if (titleMatch) {
      const t = buildSnippetFromTitleOrSummary(title, q);
      if (t) snippets.push(t);
    }
    if (summaryMatch && snippets.length < MAX_SNIPPETS_PER_POST) {
      const s = buildSnippetFromTitleOrSummary(summary, q);
      if (s) snippets.push(s);
    }
    const contentSnippets = findSnippets(
      post.content,
      q,
      MAX_SNIPPETS_PER_POST - snippets.length
    );
    for (const snip of contentSnippets) {
      if (snippets.length >= MAX_SNIPPETS_PER_POST) break;
      snippets.push(snip);
    }

    results.push({
      slug: post.slug,
      title: stripMarkdownForPreview(title),
      summary: summary ? stripMarkdownForPreview(summary) : undefined,
      snippets,
    });
  }

  return Response.json({ results });
}
