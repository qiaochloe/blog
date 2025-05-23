"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { formatDate } from "./utils";

const tags = [
  "Novel",
  "Webnovel",
  "Webcomic",

  "Chinese",
  "Japanese",
  "English",
  "French",
  "Korean",

  "BL",
  "GL",
  "BG",

  "Wuxia",
  "Xianxia",
  "Imperial China",
  "Western Royalty",
  "Modern",
  "Interstellar",
  "ABO",
  "Role Reversal",
  "Infinite Flow",
  "Transmigration",
] as const;
type Tag = (typeof tags)[number];

const tagCategories = [
  "medium",
  "originalLanguage",
  "relationship",
  "setting",
  "other",
] as const;
type TagCategory = (typeof tagCategories)[number];

const categoryToTags: Record<TagCategory, Tag[]> = {
  medium: ["Webnovel", "Webcomic", "Novel"],
  originalLanguage: ["Chinese", "Japanese", "Korean", "English", "French"],
  relationship: ["BL", "GL", "BG"],
  setting: [
    "Wuxia",
    "Xianxia",
    "Imperial China",
    "Modern",
    "Interstellar",
    "Western Royalty",
  ],
  other: ["ABO", "Infinite Flow", "Transmigration"],
};

const tagStyles: Record<Tag, string> = {
  Webnovel: "bg-gray-300 text-gray-900",
  Novel: "bg-gray-300 text-gray-900",
  Webcomic: "bg-gray-300 text-gray-900",

  Chinese: "bg-yellow-100 text-yellow-900",
  Japanese: "bg-yellow-100 text-yellow-900",
  English: "bg-yellow-100 text-yellow-900",
  French: "bg-yellow-100 text-yellow-900",
  Korean: "bg-yellow-100 text-yellow-900",

  BL: "bg-red-100 text-red-900",
  GL: "bg-red-100 text-red-900",
  BG: "bg-red-100 text-red-900",

  Wuxia: "bg-sky-100 text-sky-900",
  Xianxia: "bg-sky-100 text-sky-900",
  "Imperial China": "bg-sky-100 text-sky-900",
  "Western Royalty": "bg-sky-100 text-sky-900",
  Modern: "bg-sky-100 text-sky-900",
  Interstellar: "bg-sky-100 text-sky-900",
  ABO: "bg-pink-100 text-pink-900",
  "Infinite Flow": "bg-green-100 text-green-900",
  Transmigration: "bg-orange-100 text-orange-900",
  "Role Reversal": "bg-orange-100 text-orange-900",
};

const finishedDates = [
  "Very very long ago",
  "Very long ago",
  "Long ago",
  "Fall 2023",
  "Summer 2024",
  "Fall 2024",
] as const;

type FinishedDate = (typeof finishedDates)[number] | null;

type Media = {
  title: string;
  author?: string;
  finishedDate: FinishedDate | Date | null;
  href: string;
  img: string;
  tags: Tag[];
  comments?: string;
};

const media: Media[] = [
  {
    title: "After I Turned From O to A I Became the National Male God",
    author: "一人路过",
    finishedDate: "Fall 2024",
    href: "https://www.novelupdates.com/series/after-i-turned-from-o-to-a-i-became-the-national-male-god/",
    img: "aitfotaibtnmg.jpeg",
    tags: ["Webnovel", "Chinese", "BL", "Interstellar", "ABO", "Role Reversal"],
    comments:
      "The MC gong is very good. He's gentle, considerate, and attracts a lot of people to his side but always puts the ML first. He handles most problems very reasonably, but he can be unexpectedly willful about what he wants (like eventually openly being in a relationship with the ML!). \nThe ML shou is where this novel really shines for me. He's very unruly and fierce (really like a delinquent) when we first meet him, but he is a little bit shy when it comes to his relationship with the MC. He is a very fleshed-out characters, with his own cast of friends, values, good traits and bad traits. I love that the author doesn't shy away from giving him insecurities, jealousies, and fears, but the MC always reaffirms that he loves him regardless of his \"advantages and disadvantages.\" Even though it is implied that the ML is the shou, I would say that it's more about their circumstances pheromone incompatibility & the ML never acts like an O torward the MC. \nI actually think that the writing, plot, and characterization is not very polished, but this is why the characters could continue to surprise me. The MC can be at times gentle or willful, and the ML can be at times grumpy or flustered or jealous.",
  },
  {
    title: "Global Examination",
    finishedDate: "Fall 2024",
    href: "https://www.novelupdates.com/series/global-examination/",
    img: "ge.jpeg",
    tags: ["Webnovel", "Chinese", "Webcomic", "BL", "Infinite Flow"],
    comments:
      'This is another novel in the 无限流 ("infinity flow") genre. I started with the manhua and liked it so much that I finished the webnovel.\n From the onset, the MC is quiet, reticent, and a little bit cold. The ML is flamboyant, the type that pushes the boundaries of the system rules. They work together extremely well, but it\'s a bit difficult for me to characterize the relationship between the MC and ML. Their relationship is full of subtle moments, most likely because the setting forced them to be clandestine. Their dynamic is "silent, implicit understanding." The backstory and the plot is excellent. It\'s hard for me to describe more without spoilers, but I really loved this.',
  },
  {
    title: "Gold Class Fighter",
    finishedDate: "Fall 2024",
    href: "https://www.novelupdates.com/series/gold-class-fighter/",
    img: "gcf.jpeg",
    tags: ["Webnovel", "Chinese", "BL", "Wuxia", "Modern"],
    comments:
      "A real modern wuxia novel, set in 90s China. Think gangs and Jianghu honor. The MC and the ML both have their good points. They feel... like people who really could have existed during this time.",
  },
  {
    title: "Kaleidoscope of Death",
    finishedDate: "Long ago",
    href: "https://www.novelupdates.com/series/kaleidoscope-of-death/",
    img: "kod.jpeg",
    tags: ["Webnovel", "Chinese", "BL", "Infinite Flow"],
    comments:
      'This is the first novel that I read in the 无限流 ("infinity flow") genre. Very scary, but every arc delivered, except perhaps the last one. The ML is consistently one of the highlights of this novel. He\'s just hilarious, the kind that has a great comeback every time but feels very reassuring and capable. Especially loved the first arc where he crossdressed as a 大美女.',
  },
  {
    title: "Liu Yao: The Revitalization of Fuyao Sect",
    finishedDate: "Long ago",
    href: "https://www.novelupdates.com/series/liu-yao-the-revitalization-of-fuyao-sect/",
    img: "lytrofs.jpeg",
    tags: ["Webnovel", "Chinese", "BL", "Xianxia"],
    comments:
      "I think the reviews might dissect the themes of this novel much better than I can, so I will just focus on the main relationship here. The MC is silent, resilient, and the type to push himself to his limits. I read this novel for the MC; he's simply that inspiring. \nThe ML is pure peacock material but takes on more and more responsibilities after the time-skip. I like him quite a lot too. In another setting, with another MC, I would probably find him too possessive, but our MC is simply too top-notch and keeps him in line. \nReview: It's a very good novel, and was my most favorite for a long time. The writing is one of the most mature of the listings here.",
  },
  {
    title: "No One Can Refuse Doggie A",
    finishedDate: "Fall 2024",
    href: "https://www.novelupdates.com/series/no-one-can-refuse-doggie-a/",
    img: "nocrda.jpeg",
    tags: ["Webnovel", "Chinese", "BL", "ABO", "Modern"],
    comments:
      "The MC is just so pitiful in the beginning of the novel. Every time I think the author is finished with setting up the tragic backstory, more things just kept happening... No complaints about the ML either. He is a little unruly and unreasonable and very fierce.",
  },
  {
    title: "Something's Not Right",
    finishedDate: "Fall 2024",
    href: "https://www.novelupdates.com/series/somethings-not-right/",
    img: "snr.jpeg",
    tags: ["Webnovel", "Chinese", "BL", "Imperial China", "Transmigration"],
    comments: "The idea is very similar to Concubine Walkthrough.",
  },
  {
    title: "The Demon Lord Only Wants to Follow the Script",
    finishedDate: "Fall 2024",
    href: "https://www.novelupdates.com/series/the-demon-lord-only-wants-to-follow-the-script/",
    img: "tdlowtfts.jpeg",
    tags: ["Webnovel", "Chinese", "BL", "Xianxia", "Transmigration"],
    comments:
      "Where do I start with this one. The first half of the novel was quite good, where the MC was completing his tasks, was quite good. The second half was just... frustrating. A lot of the character settings were broken, the MC was no longer decisive, and the plot just wasn't going anywhere. But it's on this list because the beginning was really fantastic.",
  },
  {
    title: "The Professional Three Views Rectifier",
    finishedDate: "Fall 2024",
    href: "https://www.novelupdates.com/series/the-professional-three-views-rectifier-book-transmigration/",
    img: "tptvr.jpeg",
    tags: ["Webnovel", "Chinese", "BL", "Modern", "Transmigration"],
    comments:
      "Fairly unique transmigration plot. The MC continually transmigrates into the ML's world in order to rectify his three views. Of course, the MC is not exactly a saint either. It's a story that is well-executed.",
  },
  {
    title: "This Alpha Is Determined Despite Physical Disability",
    finishedDate: "Fall 2024",
    href: "https://www.novelupdates.com/series/this-alpha-is-determined-despite-physical-disability-interstellar/",
    img: "taiddpd.jpeg",
    tags: [
      "Webnovel",
      "Chinese",
      "BL",
      "Interstellar",
      "ABO",
      "Transmigration",
    ],
    comments:
      "This an ABO interstellar setting. The MC has a sharp mouth, appears a bit frivolous, but is actually quite gentle and soft-hearted on the inside. The ML is every bit the kind of person that you would expect to rise to the level of major general in such a setting despite being an O. Before meeting our MC, he's restrained, disciplined, and only has mechas and fighting in his heart. They are equals in every way, helping and accommodating each other. \nThe plot, I think, is actually quite mild. One of the major themes of the novel is that... you are just one person. When you see a problem, you can only try your best to change things a little bit, and hope that with enough people pushing, something will change. The novel acknowledges how longstanding problems like omega rights, domestic abuse, journalistic privacy violations, and corruption can't just be resolved by one person. Although the translation is ongoing, the MTL is actually quite passable.",
  },
  {
    title:
      "Transmigrating Into The Heartthrob’s Cannon Fodder Childhood Friend",
    finishedDate: "Very long ago",
    href: "https://www.novelupdates.com/series/transmigrating-into-the-heartthrobs-cannon-fodder-childhood-friend/",
    img: "titcfcf.jpeg",
    tags: ["Webnovel", "Chinese", "BL", "Modern", "Transmigration"],
    comments:
      "Very standard transmigration story, but I remember really enjoying this one.",
  },
  {
    title: "The Stranger",
    finishedDate: "Fall 2023",
    href: "https://www.goodreads.com/book/show/49552.The_Stranger",
    img: "ts.jpeg",
    tags: ["Novel", "French"],
    comments:
      "French existentialist novel by Albert Camus. I also hate the heat.",
  },
  {
    title: "No Longer Human",
    finishedDate: "Fall 2023",
    href: "https://www.goodreads.com/book/show/194746.No_Longer_Human",
    img: "nlh.jpeg",
    tags: ["Novel", "Japanese"],
    comments:
      "Japanese existentialist novel by Dazai Osamu. Found it funny at the time I was reading it, might be depressing in another context.",
  },
  {
    title: "Hell's Paradise: Jigokuraku",
    finishedDate: "Long ago",
    href: "https://www.goodreads.com/series/225906-jigokuraku",
    img: "hpj.jpeg",
    tags: ["Webcomic", "Japanese"],
    comments:
      "Japanese manga series. Vivid cast of characters, gorgeous art, and some horror elements.",
  },
  {
    title: "The Name of the Wind",
    finishedDate: "Summer 2024",
    href: "https://www.goodreads.com/book/show/186074.The_Name_of_the_Wind",
    img: "tnotw.jpeg",
    tags: ["Novel", "English"],
    comments:
      "American fantasy novel. Probably the best I've read so fair. Rotherfuss is a master of language, and he makes stories seem magical. Reminds me a little bit of Ken Liu's book The Grace of Kings; while Ken Liu draws upon stories from Chinese history, Rotherfuss pulls a lot from Western tradition.",
  },
  {
    finishedDate: "Summer 2024",
    title: "Knight Flight",
    href: "https://mangakakalot.com/manga/ar924746",
    img: "kf.jpeg",
    tags: ["Webcomic", "Korean", "BG", "Western Royalty", "Role Reversal"],
    comments:
      "She's a knight, he's a prince. I don't think I need to say more.",
  },
  {
    finishedDate: "Summer 2024",
    title: "The Black-Haired Princess",
    href: "https://vyvymanga.net/manga/the-black-haired-princess",
    img: "tbhp.jpeg",
    tags: ["Webcomic", "Korean", "BG", "Western Royalty"],
    comments:
      "She's a princess, he's a prince. Arranged marriages, conspiracies, and about what you'd expect.",
  },
  {
    finishedDate: "Summer 2024",
    title: "A Study in Scarlet",
    href: "https://www.goodreads.com/book/show/102868.A_Study_in_Scarlet",
    img: "asis.jpeg",
    tags: ["Novel", "English"],
    comments:
      "I probably donn't need to tell you that Sherlock Holmes is pretty good. He is different in the book that in the show; more delicate, more emotional, and more human. #TheBookIsBetter",
  },
  {
    finishedDate: new Date("2025-03-22"),
    title: "Until the Tragic Male Lead Walks Again",
    href: "https://xbato.com/title/148791-until-the-tragic-male-lead-walks-again-official",
    img: "uttmlwa.jpeg",
    tags: [
      "Webcomic",
      "Korean",
      "BG",
      "Western Royalty",
      "Role Reversal",
      "Transmigration",
    ],
    comments:
      "It's a pretty good role-reversal story. The FL is hilarious; the ML is a sweetheart. I'm satisfied with the art, humor, and the character archetypes. The ending was a bit abrupt.",
  },
  {
    finishedDate: null,
    title: "My White Moonlight Took Off His Women’s Clothes",
    href: "https://www.novelupdates.com/series/my-white-moonlight-took-off-his-womens-clothes/",
    img: "mwmtohwc.jpeg",
    tags: ["Webnovel", "Chinese", "BL", "Imperial China", "Role Reversal"],
    comments:
      "From my experience, webnovels commonly expose the most depraved love fantasies. Many authors seem to feel that love can only be expressed with possessive, controlling, and excessive behavior. It's rare that an author can create a character that is upright and moral without being a cold bore. This is one of those rare novels that succeed. The MC, a brave general, shines brightly in a world of political filth. I really admire him.\n Although the ML is desparately in love with the MC, he restrains himself from excessiveness every time. I could feel how considerate he is of the MC's feelings. He is really afraid of scaring the MC away, and that—to me—is more romantic than uncontrollable behavior.",
  },
];

export default function Media() {
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
      <p>
        This is a list of media that I've consumed and enjoyed a lot. The
        webnovels I read are all romance, so I really only review how I thought
        about the relationship. The books and manga vary a little more than
        that. At some point I was really interested in existentialism, but not
        anymore.
      </p>
      <p>The tag system below takes the intersection, not the union.</p>
      <div className="py-4">
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
        {media
          .sort((a, b) => {
            // If there are both dates, sort by date
            if (
              a.finishedDate instanceof Date &&
              b.finishedDate instanceof Date
            ) {
              return a.finishedDate.getTime() - b.finishedDate.getTime();
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
                <Image
                  src={`/media/${item.img}`}
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
                  <div className="text-gray-600 text-sm text-right whitespace-nowrap">
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
