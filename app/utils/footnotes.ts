/**
 * Preprocess Pandoc-style footnotes so they render without remark-gfm.
 *
 * Converts:
 *   ... in the US.[^1]
 *   [^1]: salsdkfjalsdk
 *
 * Into: superscript links + a footnotes section at the end.
 */

import MarkdownIt from "markdown-it";

const FOOTNOTE_REF = /\[\^([^\]]+)\]/g;
const FOOTNOTE_DEF = /^\[\^([^\]]+)\]:\s*/;

/** Collect ref order: first occurrence of each [^id] in document order gives numbering (1, 2, 3...). */
function collectRefOrder(content: string): string[] {
  const order: string[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;
  const re = new RegExp(FOOTNOTE_REF.source, "g");
  while ((match = re.exec(content)) !== null) {
    const id = match[1];
    if (!seen.has(id)) {
      seen.add(id);
      order.push(id);
    }
  }
  return order;
}

/** Extract footnote definitions and remove them from content. Returns { contentWithoutDefs, definitions }. */
function extractDefinitions(
  content: string,
): { content: string; definitions: Map<string, string> } {
  const lines = content.split("\n");
  const definitions = new Map<string, string>();
  let inCodeBlock = false;
  let codeFence: string | null = null;
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    const fenceMatch = line.match(/^(`{3,}|~{3,})(\S*)/);
    if (fenceMatch) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeFence = fenceMatch[1];
        result.push(line);
        i++;
        continue;
      } else if (line.startsWith(codeFence!)) {
        inCodeBlock = false;
        codeFence = null;
        result.push(line);
        i++;
        continue;
      }
    }
    if (inCodeBlock) {
      result.push(line);
      i++;
      continue;
    }

    const defMatch = line.match(FOOTNOTE_DEF);
    if (defMatch) {
      const id = defMatch[1];
      let body = line.slice(defMatch[0].length);
      i++;
      while (i < lines.length) {
        const next = lines[i];
        if (next.startsWith("    ") || next.startsWith("\t")) {
          body += "\n" + next;
          i++;
        } else if (next.trim() === "" && i + 1 < lines.length && (lines[i + 1].startsWith("    ") || lines[i + 1].startsWith("\t"))) {
          body += "\n" + next;
          i++;
        } else {
          break;
        }
      }
      definitions.set(id, body.trim());
      continue;
    }

    result.push(line);
    i++;
  }

  return { content: result.join("\n"), definitions };
}

/** Replace [^id] with superscript link; refOrder gives id -> display number. */
function replaceRefs(
  content: string,
  refOrder: string[],
): string {
  const idToNum = new Map<string, number>();
  refOrder.forEach((id, idx) => idToNum.set(id, idx + 1));

  return content.replace(FOOTNOTE_REF, (_, id) => {
    const num = idToNum.get(id);
    if (num == null) return `[^${id}]`;
    return `<sup className="footnote-ref"><a href="#fn-${num}" id="ref-${num}">${num}</a></sup>`;
  });
}

export function preprocessFootnotes(content: string): string {
  const refOrder = collectRefOrder(content);
  if (refOrder.length === 0) return content;

  const { content: contentWithoutDefs, definitions } = extractDefinitions(content);
  let out = replaceRefs(contentWithoutDefs, refOrder);

  const md = new MarkdownIt();
  const cornerDownLeftSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 4v7a4 4 0 0 1-4 4H4"/><path d="m9 10-5 5 5 5"/></svg>';
  const footnoteItems = refOrder.map((id, idx) => {
    const num = idx + 1;
    const body = definitions.get(id) ?? "(missing definition)";
    const html = md.render(body).replace(/\n/g, " ");
    return `<li id="fn-${num}" className="footnote-item"><div className="flex flex-wrap items-baseline">${html}<a href="#ref-${num}" className="footnote-back shrink-0" aria-label="Back to reference">${cornerDownLeftSvg}</a></div></li>`;
  });

  if (footnoteItems.length > 0) {
    out += '\n\n<ol className="footnotes list-decimal pl-6 my-4">\n' + footnoteItems.join("\n") + "\n</ol>\n";
  }

  return out;
}
