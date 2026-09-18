import { getPosts } from "app/posts";
import { NextRequest } from "next/server";

const SNIPPET_RADIUS = 60;
const MAX_SNIPPETS_PER_POST = 3;

const FIELD_BOOST = {
  title: 10,
  summary: 3,
  content: 1,
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 0);
}

function stripMarkdownForSearch(text: string): string {
  return text
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*?|__?|~~|``?/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();
}

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

type Snippet = {
  text: string;
  highlightStart: number;
  highlightEnd: number;
};

function countOccurrences(text: string, term: string): number {
  let count = 0;
  let idx = 0;
  while ((idx = text.indexOf(term, idx)) !== -1) {
    count++;
    idx += term.length;
  }
  return count;
}

function buildSnippetFromField(field: string, query: string): Snippet | null {
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

function extractSnippet(
  plain: string,
  matchIndex: number,
  matchLen: number,
): Snippet {
  const start = Math.max(0, matchIndex - SNIPPET_RADIUS);
  const end = Math.min(plain.length, matchIndex + matchLen + SNIPPET_RADIUS);
  let text = plain.slice(start, end);
  const leadingEllipsis = start > 0;
  const trailingEllipsis = end < plain.length;
  if (leadingEllipsis) text = "…" + text;
  if (trailingEllipsis) text = text + "…";

  const highlightStart = matchIndex - start + (leadingEllipsis ? 1 : 0);
  const highlightEnd = highlightStart + matchLen;
  return { text, highlightStart, highlightEnd };
}

function snippetsOverlap(a: Snippet, b: Snippet): boolean {
  return (
    Math.abs(a.highlightStart - b.highlightStart) < SNIPPET_RADIUS ||
    Math.abs(a.highlightEnd - b.highlightEnd) < SNIPPET_RADIUS
  );
}

function findContentSnippets(
  content: string,
  queryTerms: string[],
  maxSnippets: number,
): Snippet[] {
  const snippets: Snippet[] = [];
  if (queryTerms.length === 0 || maxSnippets <= 0) return snippets;

  const plain = stripMarkdownForPreview(content);
  const plainLower = plain.toLowerCase();

  // Prefer the exact phrase first.
  const phrase = queryTerms.join(" ");
  const phraseIndex = plainLower.indexOf(phrase);
  if (phraseIndex !== -1) {
    snippets.push(extractSnippet(plain, phraseIndex, phrase.length));
  }

  // Then individual terms, longest first as a simple rarity proxy.
  const sortedTerms = [...queryTerms].sort((a, b) => b.length - a.length);
  for (const term of sortedTerms) {
    if (snippets.length >= maxSnippets) break;
    let fromIndex = 0;
    while (snippets.length < maxSnippets) {
      const idx = plainLower.indexOf(term, fromIndex);
      if (idx === -1) break;
      const candidate = extractSnippet(plain, idx, term.length);
      const isDuplicate = snippets.some((s) => snippetsOverlap(s, candidate));
      if (!isDuplicate) {
        snippets.push(candidate);
      }
      fromIndex = idx + 1;
    }
  }

  return snippets;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return Response.json({ results: [] });
  }

  const queryTerms = tokenize(q);
  if (queryTerms.length === 0) {
    return Response.json({ results: [] });
  }

  const posts = getPosts();
  const qLower = q.toLowerCase();

  const scoredResults: {
    slug: string;
    title: string;
    summary?: string;
    snippets: Snippet[];
    score: number;
  }[] = [];

  for (const post of posts) {
    const title = post.data.title ?? post.slug;
    const summary = (post.data.summary ?? "").trim();
    const contentPlain = stripMarkdownForSearch(post.content);

    const titleLower = title.toLowerCase();
    const summaryLower = summary.toLowerCase();
    const contentLower = contentPlain.toLowerCase();

    const allTermsMatch = queryTerms.every(
      (term) =>
        titleLower.includes(term) ||
        summaryLower.includes(term) ||
        contentLower.includes(term),
    );
    if (!allTermsMatch) continue;

    let score = 0;
    for (const term of queryTerms) {
      score += countOccurrences(titleLower, term) * FIELD_BOOST.title;
      score += countOccurrences(summaryLower, term) * FIELD_BOOST.summary;
      score += countOccurrences(contentLower, term) * FIELD_BOOST.content;
    }

    // Add bonus for exact full-query matches, with title weighted highest
    if (titleLower.includes(qLower)) score += FIELD_BOOST.title * 2;
    if (summaryLower.includes(qLower)) score += FIELD_BOOST.summary;
    if (contentLower.includes(qLower)) score += FIELD_BOOST.content;

    const snippets: Snippet[] = [];

    const titleSnippet = buildSnippetFromField(title, q);
    if (titleSnippet) snippets.push(titleSnippet);

    if (snippets.length < MAX_SNIPPETS_PER_POST) {
      const summarySnippet = buildSnippetFromField(summary, q);
      if (summarySnippet) snippets.push(summarySnippet);
    }

    if (snippets.length < MAX_SNIPPETS_PER_POST) {
      const contentSnippets = findContentSnippets(
        post.content,
        queryTerms,
        MAX_SNIPPETS_PER_POST - snippets.length,
      );
      snippets.push(...contentSnippets);
    }

    scoredResults.push({
      slug: post.slug,
      title: stripMarkdownForPreview(title),
      summary: summary ? stripMarkdownForPreview(summary) : undefined,
      snippets,
      score,
    });
  }

  scoredResults.sort((a, b) => b.score - a.score);

  return Response.json({
    results: scoredResults.map(({ score, ...rest }) => rest),
  });
}
