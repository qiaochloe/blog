import React from "react";
import Link from "next/link";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import remarkComment from "remark-comment";
import "highlight.js/styles/github.css";

import "katex/dist/katex.min.css";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ModalImage } from "./ModalImage";
import Fiction from "./Fiction";
import Textbooks from "./Textbooks";
import {
  PuzzlethonHinting,
  PuzzlethonMap,
  PuzzlethonCarberry,
} from "./Puzzlethon";

function Table({ data }) {
  let headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ));
  let rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ));

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function CustomLink(props) {
  let href = props.href;
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    );
  }
  if (href.startsWith("#")) return <a {...props} />;
  return <a target="_blank" rel="noopener noreferrer" {...props} />;
}

function slugify(str: React.ReactNode): string {
  if (str == null) return "";
  const s =
    typeof str === "string"
      ? str
      : Array.isArray(str)
        ? str.map(slugify).join("-")
        : typeof str === "object" &&
            "props" in str &&
            str.props?.children != null
          ? slugify((str as React.ReactElement).props.children)
          : String(str);
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

function createHeading(level) {
  const Heading = ({ children }: { children?: React.ReactNode }) => {
    const slug = slugify(children ?? "") || "section";
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement("a", {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: "anchor",
        }),
      ],
      children,
    );
  };

  Heading.displayName = `Heading${level}`;

  return Heading;
}

let components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: ModalImage,
  img: ModalImage,
  a: CustomLink,
  Table,
  Fiction,
  Textbooks,
  // Puzzlethon
  PuzzlethonHinting,
  PuzzlethonMap,
  PuzzlethonCarberry,
  Manga,
};

export function CustomMDX(props) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
      options={{
        mdxOptions: {
          rehypePlugins: [
            rehypeKatex,
            [rehypeHighlight, { ignoreMissing: true }],
          ],
          remarkPlugins: [remarkMath, remarkComment],
        },
      }}
    />
  );
}
