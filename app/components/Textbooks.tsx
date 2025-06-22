"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const tags = [
  "Computer science",
  "Mathematics",
  "Health",
  "Theory",
  "Practical",
] as const;
type Tag = (typeof tags)[number];

const tagCategories = ["subject", "practicality"] as const;
type TagCategory = (typeof tagCategories)[number];
const categoryToTags: Record<TagCategory, Tag[]> = {
  subject: ["Computer science", "Mathematics", "Health"],
  practicality: ["Practical", "Theory"],
};
const tagStyles: Record<Tag, string> = {
  "Computer science": "bg-blue-100 text-blue-800",
  Mathematics: "bg-blue-100 text-blue-800",
  Health: "bg-blue-100 text-blue-800",
  Theory: "bg-blue-100 text-blue-800",
  Practical: "bg-blue-100 text-blue-800",
};

type Book = {
  title: string;
  author?: string;
  href: string;
  img: string;
  tags: Tag[];
  comments?: string;
};

const textbooks: Book[] = [
  {
    title: "Learn Rust in a Month of Lunches",
    author: "Dave Macleod",
    href: "https://www.manning.com/books/learn-rust-in-a-month-of-lunches",
    img: "learn-rust-in-a-month-of-lunches.jpeg",
    tags: ["Computer science", "Practical"],
    comments:
      "Background: I've failed to learn Rust from the Book many times. The biggest problem was that I didn't have a computer systems background yet, and I didn't know how memory allocation and alignment worked yet. I also think my experiences with functional programming languages and C made me better appreciate the design choices Rust makes.\nThis book is the first book I've actually stuck with since taking a systems course. Everything in this book is also immediately practical. In addition to common language features, the book gives you a tour of Rust tooling and the most popular crates as well. This book was sufficient for writing a complex, multithreaded program.\n I was reading this over the summer, so I appreciate that every chapter is lightweight. You can definitely read a chapter every day in the beginning (maybe a chapter every three days later on).\n",
  },
  {
    title: "Outlive: The Scieince & Art of Longetivity",
    author: "Peter Attia",
    href: "https://peterattiamd.com/outlive/",
    img: "outlive.jpeg",
    tags: ["Health", "Practical"],
    comments:
      "Currently reading. Live notes here: https://qiaochloe.com/outlive.",
  },
  {
    title: "Concrete Mathematics",
    author: "Ronald L. Graham, Donald E. Knuth, Oren Patashnik",
    href: "https://www-cs-faculty.stanford.edu/~knuth/gkp.html",
    img: "concrete-mathematics.jpeg",
    tags: ["Computer science", "Theory", "Mathematics"],
    comments:
      'Not an "abstract mathematics" book, but one that covers practical, CONtinuous and disCRETE topics. "The material [...] may seem at first to be a disparate bag of tricks, but practice makes it into a disciplined set of tools. Topics include: recurrent problems, sums, integer functions, number theory, binomial coefficients, special numbers, generating functions, discrete probability, and asymptopics.\nAesthetic review: it is beautifully typeset with AMS Euler math formulas and Tufte-style sidenotes.',
  },
  {
    title: "Algorithms",
    author: "Jeff Erickson",
    tags: ["Computer science", "Theory"],
    href: "https://jeffe.cs.illinois.edu/teaching/algorithms",
    img: "algorithms-erickson.jpeg",
    comments:
      "A lucid introduction to algorithms. It feels like an experienced professor guiding you through the subject. Topics include: recursion, backtracking, dynamic programming, greedy algorithms, graph algorithms, minimum spanning trees, shortest paths, maximum flows & minimum cuts, and NP-hardness.\nAesthetic review: the diagrams are clear and there is minimal but clean use of color. The footnotes are humorous.",
  },
  {
    title: "Algorithm Design Manual",
    href: "http://www.algorist.com/",
    img: "algorithm-design-manual.jpeg",
    tags: ["Computer science", "Theory"],
    comments: "A practical guide to algorithm design.",
  },
  {
    title: "Crafting Interpreters",
    author: "Bob Nystrom",
    href: "https://craftinginterpreters.com",
    img: "crafting-interpreters.jpeg",
    tags: ["Computer science", "Practical"],
    comments:
      "A practical introduction to creating interpreters and compilers in Java and C. I only wish that it had used pattern-matching and not the visitor design pattern, but this is a language issue.\nAesthetic review: has beautifully hand-drawn diagrams, useful sidenotes, and a fantastic color palette. Clearly made with love.",
  },
  {
    title: "Operating Systems: Three Easy Pieces",
    href: "http://pages.cs.wisc.edu/~remzi/OSTEP",
    img: "ostep.jpeg",
    tags: ["Computer science", "Theory"],
    comments:
      "An amazing book about operating systems. Extremely digestable with short chapters (51 over the course of 700 pages). Would help to have some background in computer systems and C programming.\nAesthetic review: nicely typeset. There is a set of student-teacher dialogues between major concepts and an annotated reference page after every chapter.",
  },
];

export default function Textbooks() {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  function toggleTag(tag: Tag) {
    if (selectedTags.includes(tag)) {
      setSelectedTags(() => selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  }

  return (
    <div>
      <p>The tag system below takes the intersection, not the union.</p>
      <div className="pb-4">
        <div className="flex pb-2 space-x-1"></div>
        {Object.entries(categoryToTags).map(([category, tags]) => {
          return (
            <div className="flex flex-wrap gap-1 py-1" key={category}>
              {tags.map((tag) => (
                <button
                  key={`${tag}-main`}
                  className={`text-xs rounded-full px-1.5 py-0.5 ${selectedTags.includes(tag) ? tagStyles[tag] : "bg-gray-100"}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          );
        })}
      </div>
      <div>
        {textbooks
          .sort((a, b) => {
            return a.title.localeCompare(b.title);
          })
          .filter((item) =>
            selectedTags.every((tag) => item.tags.includes(tag)),
          )
          .map((item, i) => (
            <div
              className="flex flex-col sm:flex-row space-x-0 sm:space-x-4 items-start"
              key={i}
            >
              {/* Image */}
              <div className="flex-shrink-0 py-4">
                <Image
                  src={`/textbooks/${item.img}`}
                  alt={item.title}
                  width={100}
                  height={100}
                  style={{ height: "auto", width: 125 }}
                  className="rounded-md"
                />
              </div>

              {/* Content */}
              <div className="flex-1 py-2 min-w-0">
                {" "}
                <div key={item.title} className="flex justify-between py-1">
                  <Link href={item.href} className="font-medium underline">
                    {item.title}
                  </Link>
                  {/* <div className="text-gray-600 text-sm text-right whitespace-nowrap"> */}
                  {/*   {formatDate(item.finishedDate)} */}
                  {/* </div> */}
                </div>
                {/* Tag section */}
                <div className="flex flex-wrap gap-1 py-1">
                  {item.tags
                    .sort((a, b) => {
                      for (const category of tagCategories) {
                        const indexA = categoryToTags[category].indexOf(a);
                        const indexB = categoryToTags[category].indexOf(b);
                        if (indexA === -1 && indexB === -1) continue;
                        if (indexA === -1 || indexB === -1)
                          return indexB - indexA;
                        return indexA - indexB;
                      }
                      return -1;
                    })
                    .map((tag) => (
                      <button
                        key={`${item.title}-${tag}`}
                        className={`text-xs rounded-full px-2 py-0.5 whitespace-nowrap ${
                          selectedTags.includes(tag)
                            ? tagStyles[tag]
                            : "bg-gray-100"
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                </div>
                {/* Comments */}
                {item.comments && (
                  <div>
                    {item.comments?.split("\n").map((line, i) =>
                      line.trim() ? (
                        <p key={i} className="text-gray-600 text-sm mb-0.5">
                          {line}
                        </p>
                      ) : null,
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
