"use client";

import Link from "next/link";
import MarkdownIt from "markdown-it";
import { ModalImage } from "./ModalImage";
import { ReactNode, useState } from "react";
import { formatDate } from "app/utils";

const tags = [
  "Computer science",
  "Mathematics",
  "Lifestyle",
  "Theory",
  "Practical",
] as const;
type Tag = (typeof tags)[number];

const tagCategories = ["subject", "practicality"] as const;
type TagCategory = (typeof tagCategories)[number];
const categoryToTags: Record<TagCategory, Tag[]> = {
  subject: ["Computer science", "Mathematics", "Lifestyle"],
  practicality: ["Practical", "Theory"],
};
const tagStyles: Record<Tag, string> = {
  "Computer science": "bg-maximum-blue-100 text-maximum-blue-800",
  Mathematics: "bg-slate-blue-100 text-slate-blue-800",
  Lifestyle: "bg-tuscan-sun-100 text-tuscan-sun-800",
  Theory: "bg-sea-green-100 text-sea-green-800",
  Practical: "bg-sap-green-100 text-sap-green-800",
};

const finishedDates = ["Long ago"] as const;

type FinishedDate = (typeof finishedDates)[number] | null;

type Book = {
  title: string;
  author?: string;
  finishedDate: FinishedDate | Date | null;
  href: string;
  img: string;
  tags: Tag[];
  comments?: string | ReactNode;
};

const nonfiction: Book[] = [
  {
    title: "Learn Rust in a Month of Lunches",
    author: "Dave Macleod",
    href: "https://www.manning.com/books/learn-rust-in-a-month-of-lunches",
    img: "learn-rust-in-a-month-of-lunches.jpeg",
    tags: ["Computer science", "Practical"],
    finishedDate: new Date("2024-09-23"),
    comments: (
      <>
        <p>
          Background: I've failed to learn Rust from the{" "}
          <a href="https://rust-book.cs.brown.edu/">Book</a> many times before
          college. The main problem was that I didn't have the computer systems
          background to understand Rust's design choices at that time. To put it
          bluntly, you need to know how memory allocation works.
        </p>
        <p>
          This book is a very gentle introduction to Rust. I was reading this
          over the summer, so I appreciate that every chapter is lightweight.
          You can definitely read a chapter every day in the beginning (maybe a
          chapter every three days later on).
        </p>
        <p>
          Further, everything in this book is immediately practical. In addition
          to common language features, the book gives you a tour of Rust tooling
          and the most popular crates as well. I felt ready to write a{" "}
          <Link href="/projects#tcp/ip-stack">
            complex, multithreaded program
          </Link>{" "}
          after reading it.
        </p>
      </>
    ),
  },
  {
    title: "Outlive: The Scieince & Art of Longetivity",
    author: "Peter Attia",
    href: "https://peterattiamd.com/outlive/",
    img: "outlive.jpeg",
    tags: ["Lifestyle", "Practical"],
    finishedDate: new Date("2025-07-25"),
    comments: (
      <>
        <p>
          Notes: <Link href="/outlive">/outlive</Link>
        </p>
        <p>
          I heard a few people raving about <i>Outlive</i> online before I
          finally picked it up. It lived up to expectations--I've since
          completely changed my attitude toward exercise and health, and have
          started lifting weights and running in Zone 2. Strongly recommend as a
          practical introduction to health and wellbeing.
        </p>
      </>
    ),
  },
  {
    title: "Algorithms",
    author: "Jeff Erickson",
    tags: ["Computer science", "Theory"],
    href: "https://jeffe.cs.illinois.edu/teaching/algorithms",
    img: "algorithms-erickson.jpeg",
    finishedDate: new Date("2023-07-21"),
    comments: (
      <>
        <p>
          A lucid and sometimes funny introduction to algorithms. Topics
          include: recursion, backtracking, dynamic programming, greedy
          algorithms, graph algorithms, minimum spanning trees, shortest paths,
          maximum flows & minimum cuts, and NP-hardness.
        </p>
        <p>
          Aesthetic review: the diagrams are clear and there is clean use of
          color. The footnotes are hilarious.
        </p>
      </>
    ),
  },
  {
    title: "Crafting Interpreters",
    author: "Bob Nystrom",
    href: "https://craftinginterpreters.com",
    img: "crafting-interpreters.jpeg",
    tags: ["Computer science", "Practical"],
    finishedDate: "Long ago",
    comments: (
      <>
        <p>
          A practical introduction to creating interpreters and compilers in
          Java and C. I only wish that it had used pattern-matching and not the
          visitor design pattern, but this is a language issue.
        </p>
        <p>
          Aesthetic review: beautifully hand-drawn diagrams, useful sidenotes,
          and a fantastic color palette. Clearly made with love.
        </p>
      </>
    ),
  },
  {
    title: "Operating Systems: Three Easy Pieces",
    href: "http://pages.cs.wisc.edu/~remzi/OSTEP",
    img: "ostep.jpeg",
    tags: ["Computer science", "Theory"],
    finishedDate: null,
    comments: (
      <>
        <p>
          An amazing book about operating systems. In particularly, it's great
          at explaining the background and design tradeoffs in virtual memory
          and filesystems. It is also extremely digestable with short chapters
          (51 over the course of 700 pages). Would help to have some background
          in computer systems and C programming.
        </p>
        <p>
          Aesthetic review: nicely typeset and funny in an off-beat way. I think
          that the crux questions are pedagogically very effective.
        </p>
      </>
    ),
  },
  {
    title: "Salt, Fat, Acid, Heat",
    href: "https://www.saltfatacidheat.com/",
    img: "sfah.jpeg",
    tags: ["Lifestyle", "Practical"],
    finishedDate: null,
    comments: (
      <>
        <p>
          Notes: <Link href="/salt-fat-acid-heat)">/salt-fat-acid-heat</Link>
        </p>
        <p>
          A lot of books about cooking are overly practical: just lists upon
          lists of recipes and ingredients, interspaced between page-size
          spreads of delicious food. This makes it difficult to develop a mental
          framwork for cooking. What is the purpose of vinegar and baking soda?
          Why do you add oil to salads and cakes?
        </p>
        <p>
          This books explains these critical components systematically. It's
          helped me a lot with identifying what makes food taste good. (I also
          immediately notice when something is undersalted.) Highly recommend.
        </p>
      </>
    ),
  },
  {
    title: "9 Out of 10 Climbers Make the Same Mistakes",
    href: "https://www.goodreads.com/book/show/7489836-9-out-of-10-climbers-make-the-same-mistakes",
    img: "nine-out-of-ten-climbers.jpg",
    tags: ["Lifestyle", "Practical"],
    finishedDate: new Date("2025-12-14"),
    comments:
      "This book is as good as everyone says it is. You can read it over and over again and still learn something new. Although it covers all aspects of climbing, I think its strongest point is its focus on the psyche (rather than strength or technique).",
  },
  {
    title: "The Good Life",
    href: "https://the-good-life-book.com/",
    img: "the-good-life.jpg",
    tags: ["Lifestyle", "Theory"],
    finishedDate: new Date("2023-07-11"),
    comments:
      "One of the seminal books on happiness, based on one of the world's longest scientific studies of happiness. The main idea is very simple: relationships are important, and you need to apply curiousity and attention to nurture them.",
  },
  {
    title: "Beastmaking",
    href: "https://www.goodreads.com/book/show/58936071-beastmaking",
    img: "beastmaking.jpg",
    tags: ["Lifestyle", "Practical"],
    finishedDate: new Date("2026-03-05"),
    comments:
      '*Beastmaking* introduces "a fingers-first approach to becoming a better climber." I found the discussion about active grip very useful; I never really thought about how I open-handed all holds before. Now I pay better attention to what my fingers are doing.',
  },
  {
    title: "Designing Data-Intensive Applications",
    href: "https://www.goodreads.com/book/show/23463279-designing-data-intensive-applications",
    img: "ddia.jpg",
    tags: ["Computer science", "Theory"],
    finishedDate: new Date("2025-12-22"),
    comments: (
      <>
        <p>
          Notes: <Link href="/ddia">/ddia</Link>
        </p>
        <p>
          DDIA is <i>the</i> most recommended computer science book out there.
          I'm guessing that it's most helpful for entry-level developers who are
          just getting into building complex systems. I found that as a computer
          science <i>student,</i> the ideas were abstract and hard to
          appreciate. It was only when I started working on{" "}
          <Link href="/projects#bph-site">bph-site</Link> that things started to
          click for me.
        </p>
      </>
    ),
  },
  {
    title: "System Design Interview",
    href: "https://www.goodreads.com/book/show/54109255-system-design-interview-an-insider-s-guide",
    img: "system-design-interview.jpg",
    tags: ["Computer science", "Theory"],
    finishedDate: new Date("2025-12-18"),
    comments: (
      <>
        <p>
          Notes:{" "}
          <Link href="/system-design-interview">/system-design-interview</Link>
        </p>
        <p>
          Most system design books are fairly abstract. Replication,
          partitioning, consensus—you've heard it over and over again. This book
          actually gets into the weeds of designing something like a
          rate-limiter or url shortener. I recommend it even if you're not
          preparing for a systems design interview.
        </p>
      </>
    ),
  },
];

export default function Nonfiction() {
  // Tag filter system
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  function toggleTag(tag: Tag) {
    if (selectedTags.includes(tag)) {
      setSelectedTags(() => selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  }

  const md = new MarkdownIt();

  return (
    <div>
      <p>
        These are some of my favorite pieces of nonfiction. They are somewhat
        biased toward computer science and sports science.
      </p>
      <p>
        Check out my <Link href="/nonfiction">fiction shelf</Link> for my other
        recommendations.
      </p>
      <div className="pb-4">
        <div className="flex pb-2 space-x-1"></div>
        {Object.entries(categoryToTags).map(([category, tags]) => {
          return (
            <div className="flex flex-wrap gap-1 py-1" key={category}>
              {tags.map((tag) => (
                <button
                  key={`${tag}-main`}
                  className={`text-xs rounded-full px-1.5 py-0.5 ${selectedTags.includes(tag) ? tagStyles[tag] : "bg-neutral-100"}`}
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
        {nonfiction
          .sort((a, b) => {
            // If there are both dates, sort by date
            if (
              a.finishedDate instanceof Date &&
              b.finishedDate instanceof Date
            ) {
              return -a.finishedDate.getTime() + b.finishedDate.getTime();
            }

            // Strings should be sorted according to finishedDates array
            // Dates should be second-to last
            // Null values should be last
            const dateNumberA = a.finishedDate
              ? a.finishedDate instanceof Date
                ? finishedDates.length
                : finishedDates.indexOf(a.finishedDate)
              : finishedDates.length + 1;

            const dateNumberB = b.finishedDate
              ? b.finishedDate instanceof Date
                ? finishedDates.length
                : finishedDates.indexOf(b.finishedDate)
              : finishedDates.length + 1;

            // Sort by date first, and then alphabetically by title
            if (dateNumberA != dateNumberB) {
              return -dateNumberA + dateNumberB;
            }
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
                <ModalImage
                  src={`/nonfiction/${item.img}`}
                  alt={item.title}
                  width={100}
                  height={100}
                  style={{ height: "auto", width: 125 }}
                  className="rounded-md"
                />
              </div>

              {/* Content */}
              <div className="flex-1 py-2 min-w-0">
                {/* Title and date */}
                <div
                  key={item.title}
                  className="flex justify-between py-1 gap-x-2 items-end"
                >
                  <Link
                    href={item.href}
                    className="font-medium"
                    style={{ color: "black", textDecorationColor: "black" }}
                  >
                    {item.title}
                  </Link>
                  <div className="text-neutral-600 text-sm text-right whitespace-nowrap">
                    {formatDate(item.finishedDate)}
                  </div>
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
                            : "bg-neutral-100"
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                </div>
                {/* Comments */}
                {item.comments &&
                  (typeof item.comments === "string" ? (
                    <div
                      key={i}
                      className="text-neutral-600 text-sm mb-0.5"
                      dangerouslySetInnerHTML={{
                        __html: md.render(item.comments),
                      }}
                    />
                  ) : (
                    <div key={i} className="text-neutral-600 text-sm mb-0.5">
                      {item.comments}
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
