import Link from "next/link";
import Image from "next/image";
import MarkdownIt from "markdown-it";
import { getPosts } from "app/posts";
import { formatDate } from "app/utils";

type Project = {
  title: string;
  description: React.ReactNode;
  report?: string;
  repo?: string;
  slides?: string;
  link?: string;
  tags?: string[];
}

type Tag = "Typescript" | "Rust" | "C++" | "Bash";

const tagColor: Record<Tag, string> = {
  "Typescript": "bg-blue-100 text-blue-800",
  "Rust": "bg-orange-100 text-orange-800",
  "C++": "bg-amber-100 text-amber-800",
  "Bash": "bg-neutral-100 text-neutral-800",
};

const projects: Project[] = [
  {
    title: "bph-site",
    description: <>
      Most puzzlehunts rely on gph-site, a Django-based framework. However, its use of Django Channels (WebSockets) can open excessive database connections, overloading the server. This is a major cause of site crashes and forces puzzlehunts to overprovision resources. bph-site is an open-source framework that decouples the WebSocket server from the application to address this issue. It has been used by 6+ puzzlehunts, serving over 7,000 participants. Among them are <a className="hover:underline text-blue-500 hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em]" href="https://www.brownpuzzlehunt.com">Brown Puzzlehunt</a>, <a className="hover:underline text-blue-500 hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em]" href="htts://puzzlethon.brownpuzzleclub.com">Puzzlethon</a>, <a className="hover:underline text-blue-500 hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em]" href="https://penchantpuzzlehunt.com">Penchant Hunt</a>, and <a className="hover:underline text-blue-500 hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em]" href="https://www.mitmysteryhatch.com">MIT Mystery Hatch</a>.</>,
    repo: "https://github.com/brown-puzzle-hq/bph-site",
    slides: "/projects/bph-site-slides.pdf",
    tags: ["Typescript"]
  },
  {
    title: "Rust MIR-Level Integer Range Analysis",
    description: "Range analysis is used to prove properties about the range of values that a program can take on. These ranges enable optimizations such as dead-code and redundant-code elimination. We extended the Rust compiler with path-sensitive, intraprocedural analysis and a patcher module that computes these ranges and performs optimizations based on them.",
    repo: "https://github.com/qiaochloe/rust-range-analysis",
    report: "/projects/rust-mir-level-range-analysis.pdf",
    tags: ["Rust"]
  },
  {
    title: "Troubridge",
    description: "Access frequency is an important factor in memory allocation. For example, hot objects can be colocated to improve TLB locality, while cold objects can be moved to slower but cheaper far memory. We extended TCMalloc with Troubridge, a system that uses an object’s call site to estimate its access frequency prior to allocation.",
    report: "/projects/troubridge.pdf",
    repo: "https://github.com/qiaochloe/troubridge",
    slides: "/projects/troubridge-slides.pdf",
    tags: ["C++"]
  },
  {
    title: "Common Course Containers",
    description: "Courses often require students to run course-specific containers, which incurs significant storage overhead and introduces technical limitations when running multiple containers. We argue that multiple course environments can instead be run within a single shared container while preserving isolation.",
    repo: "https://github.com/BrownCS/common-course-containers",
    link: "https://cs.brown.edu/about/system/course-tech/common-course-containers/",
    slides: "/projects/ccc-slides.pdf",
    tags: ["Bash"]
  },
];

export default function Page() {
  // For titles
  const md = new MarkdownIt();
  const now = new Date();
  type Post = ReturnType<typeof getPosts>[number];
  const recentDate = (post: Post) =>
    post.data.updatedAt ?? post.data.publishedAt;
  const posts = getPosts()
    .map((post) => ({ ...post, recentDate: recentDate(post) }))
    .filter(
      (post): post is Post & { recentDate: Date } =>
        post.recentDate != null &&
        now.getTime() - post.recentDate.getTime() < 29 * 24 * 60 * 60 * 1000,
    )
    .sort((a, b) => b.recentDate.getTime() - a.recentDate.getTime());

  return (
    <section className="px-2">
      <div className="mb-4 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <Image
          src="/about/zyqiao.jpg"
          alt="Chloe Qiao"
          width={256}
          height={256}
          className="rounded-full w-48 h-48 sm:w-32 sm:h-32 object-cover shrink-0"
          priority
        />
        <div className="flex flex-col gap-y-4">
          <h1 className="text-2xl font-semibold tracking-tight text-center sm:text-left">Chloe Qiao</h1>
          <p>
            I am a student at Brown University studying computer science. I am particularly interested in networks, operating systems, compilers, and solvers.
          </p>
            </div>
            </div>

            <div className="flex flex-col gap-y-4 mb-8">
        <p>
          In the Brown CS department, I have worked as a <Link href="https://cs.brown.edu/people/staff/spoc/" className="hover:underline text-blue-500 hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em]">systems programmer</Link>, a <Link href="https://cs.brown.edu/degrees/undergrad/jobs/consult/" className="hover:underline text-blue-500 hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em]">lab consultant</Link>, and a teaching assistant for <Link href="https://browncs1715.github.io/" className="hover:underline text-blue-500 hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em]">Formal Proof and Verification</Link> (TA Fall 2024, HTA Fall 2025), <Link href="https://csci0300.github.io/" className="hover:underline text-blue-500 hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em]">Computer Systems</Link> (TA Spring 2025), <Link href="https://cs.brown.edu/courses/csci1515/" className="hover:underline text-blue-500 hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em]">Applied Cryptography</Link> (HTA Spring 2026), and Operating Systems (HTA Fall 2026). I have also been the president of <Link href="https://browncsdug.com/" className="hover:underline text-blue-500 hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em]">Brown CS DUG</Link>. Outside of the CS department, I help run the tech for <Link href="https://brownpuzzlehunt.com/" className="hover:underline text-blue-500 hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em]">Brown Puzzlehunt</Link>.
        </p>
        <p>
          In my free time, I like to <Link href="/fiction" className="transition-all hover:underline hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em] text-blue-500"> read fiction</Link>, <Link href="/writings" className="transition-all hover:underline hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em] text-blue-500">write about work</Link>, and <Link href="/climbing" className="transition-all hover:underline hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em] text-blue-500">go climbing</Link>.
        </p>
        <p>
          Brown students might find some of my <Link href="/courses" className="transition-all hover:underline hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em] text-blue-500">courses reviews</Link> useful.
        </p>
        </div>

      <h2 className="mb-4 text-xl font-semibold tracking-tight text-center">Projects</h2>
      {projects.map((project) => {
        const slug = project.title.toLowerCase().replace(/\s+/g, "-");
        return (
          <div key={project.title} id={slug} className="w-full mb-6 group">
            <div className="flex items-baseline justify-between gap-x-2">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h2 className="relative text-neutral-900 tracking-tight pb-1">
                  <a href={`#${slug}`} className="anchor absolute -ml-[1em] pr-[0.5em] invisible group-hover:visible no-underline text-neutral-300 after:content-['#']" />
                  {project.title}
                </h2>
                {project.report && (
                  <Link href={project.report} className="text-blue-500 text-sm hover:underline hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em]">[Report]</Link>
                )}
                {project.link && (
                  <Link href={project.link} className="text-blue-500 text-sm hover:underline hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em]">[Link]</Link>
                )}
                {project.slides && (
                  <Link href={project.slides} className="text-blue-500 text-sm hover:underline hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em]">[Slides]</Link>
                )}
                {project.repo && (
                  <Link href={project.repo} className="text-blue-500 text-sm hover:underline hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em]">[GitHub]</Link>
                )}
              </div>
              <div className="flex gap-x-2 shrink-0">
                {project.tags?.map((tag) => (
                  <span key={tag} className={`text-sm px-1.5 py-0.25 rounded-full ${tagColor[tag as Tag]}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-neutral-600 text-sm text-justify">
              {project.description}
            </p>
          </div>
        );
      })}

      {posts.length > 0 && (
        <h1 className="my-8 mb-2 text-xl font-semibold tracking-tight text-center"> Updates</h1>
      )}
      {posts.map((post) => (
        <div key={post.slug} className="w-full pb-1">
          <div className="flex justify-between">
            <Link href={`/${post.slug}`}>
              <h2 className="text-neutral-900 tracking-tight hover:underline">
                {post.data.title ?? post.slug}
              </h2>
            </Link>
            <p className="text-neutral-600 tracking-tight text-sm">
              {formatDate(post.recentDate)}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
