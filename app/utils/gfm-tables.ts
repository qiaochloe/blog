/**
 * Preprocess GFM (GitHub Flavored Markdown) table syntax into HTML tables
 * so they render without remark-gfm (which causes getData errors with next-mdx-remote RSC).
 *
 * Converts:
 *   | A | B |
 *   | --- | --- |
 *   | 1 | 2 |
 * Into: <table>...</table>
 */

/** Parse a table row; supports optional leading/trailing pipes (GFM allows both | A | B | and A | B). Only strip the single empty from leading/trailing pipe, not in-table empty cells. */
function parseTableRow(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed.includes("|")) return [];
  const cells = trimmed.split("|").map((c) => c.trim());
  if (cells.length > 0 && cells[0] === "" && trimmed.startsWith("|")) cells.shift();
  if (cells.length > 0 && cells[cells.length - 1] === "" && trimmed.endsWith("|"))
    cells.pop();
  return cells;
}

function isSeparatorRow(cells: string[]): boolean {
  return cells.every((cell) => /^\s*:?-+:?\s*$/.test(cell));
}

function getAlignment(cell: string): string {
  const left = cell.startsWith(":");
  const right = cell.endsWith(":");
  if (left && right) return "center";
  if (right) return "right";
  return "left";
}

export function preprocessGfmTables(content: string): string {
  const lines = content.split("\n");
  let inCodeBlock = false;
  let codeFence: string | null = null;
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Track code blocks so we don't convert tables inside them
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

    // Look for table start: line that contains | and parses to at least 2 cells
    const firstRow = parseTableRow(line);
    if (firstRow.length < 2 || firstRow.every((c) => c === "")) {
      result.push(line);
      i++;
      continue;
    }

    // Need at least a separator and one body row
    if (i + 1 >= lines.length) {
      result.push(line);
      i++;
      continue;
    }

    const secondRow = parseTableRow(lines[i + 1]);
    if (secondRow.length !== firstRow.length || !isSeparatorRow(secondRow)) {
      result.push(line);
      i++;
      continue;
    }

    // Collect header + separator + body rows
    const alignments = secondRow.map(getAlignment);
    const tableLines: string[] = [line, lines[i + 1]];
    let j = i + 2;
    while (j < lines.length) {
      const row = parseTableRow(lines[j]);
      if (row.length === firstRow.length && lines[j].includes("|")) {
        tableLines.push(lines[j]);
        j++;
      } else {
        break;
      }
    }

    // Build HTML table (output as JSX so MDX parses it; cell content left as-is for markdown)
    const headers = firstRow;
    const bodyRows = tableLines.slice(2).map((l) => parseTableRow(l));
    const alignClass: Record<string, string> = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    };
    let html =
      '\n<table className="w-full border-collapse border border-neutral-300 my-4">\n<thead>\n<tr>\n';
    headers.forEach((h, idx) => {
      const a = alignClass[alignments[idx]] ?? "text-left";
      html += `  <th className="border border-neutral-300 px-3 py-2 ${a}">${escapeCell(h)}</th>\n`;
    });
    html += "</tr>\n</thead>\n<tbody>\n";
    bodyRows.forEach((row) => {
      html += "<tr>\n";
      row.forEach((cell, idx) => {
        const a = alignClass[alignments[idx]] ?? "text-left";
        html += `  <td className="border border-neutral-300 px-3 py-2 ${a}">${escapeCell(cell)}</td>\n`;
      });
      html += "</tr>\n";
    });
    html += "</tbody>\n</table>\n";

    result.push(html);
    i = j;
  }

  return result.join("\n");
}

const BR_PLACEHOLDER = "\u0000BR\u0000";

/** Escape only characters that could break out of the tag; allow <br/> for line breaks */
function escapeCell(text: string): string {
  const withPlaceholder = text.replace(/<br\s*\/?>/gi, BR_PLACEHOLDER);
  const escaped = withPlaceholder
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.split(BR_PLACEHOLDER).join("<br />");
}
