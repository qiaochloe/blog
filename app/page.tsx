import Link from "next/link";
import MarkdownIt from "markdown-it";
import { getPosts } from "app/posts";
import { formatDate } from "app/utils";

const projects: {
  title: string;
  description: React.ReactNode;
  report?: string;
  repo?: string;
  slides?: string;
  link?: string;
}[] = [
    {
      title: "bph-site",
      description: <>
        Most puzzlehunts rely on gph-site, a Django-based framework. However, its use of Django Channels (WebSockets) can open excessive database connections, overloading the server. This is a major cause of site crashes and forces puzzlehunts to overprovision resources.bph-site is an open-source framework that decouples the WebSocket server from the application to address this issue. It has been used by 6+ puzzlehunts, serving over 7,000 participants. This includes <a className="hover:underline text-blue-500 hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em]" href="https://www.brownpuzzlehunt.com">Brown Puzzlehunt</a>, <a className="hover:underline text-blue-500 hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em]" href="htts://puzzlethon.brownpuzzleclub.com">Puzzlethon</a>, <a className="hover:underline text-blue-500 hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em]" href="https://penchantpuzzlehunt.com">Penchant Hunt</a>, and <a className="hover:underline text-blue-500 hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em]" href="https://www.mitmysteryhatch.com">MIT Mystery Hatch</a>.</>,
      repo: "https://github.com/brown-puzzle-hq/bph-site",
      slides: "/projects/bph-site-slides.pdf",
    },
    {
      title: "Rust MIR-Level Integer Range Analysis",
      description: "Range analysis is used to prove properties about the range of values that a program can take on. These ranges enable optimizations such as dead-code and redundant-code elimination. We extended the Rust compiler with path-sensitive, intraprocedural analysis and a patcher module that computes these ranges and performs optimizations based on them.",
      repo: "https://github.com/qiaochloe/rust-range-analysis",
      report: "/projects/range-analysis.pdf",
    },
    {
      title: "Troubridge",
      description: "Access frequency is an important factor in memory allocation. For example, hot objects can be colocated to improve TLB locality, while cold objects can be moved to slower but cheaper far memory. We extended TCMalloc with Troubridge, a system that uses an object’s call site to estimate its access frequency prior to allocation.",
      report: "/projects/troubridge.pdf",
      repo: "https://github.com/qiaochloe/troubridge",
      slides: "/projects/troubridge-slides.pdf",
    },
    {
      title: "Common Course Containers",
      description: "Courses often require students to run course-specific containers, which incurs significant storage overhead and introduces technical limitations when running multiple containers. We argue that multiple course environments can instead be run within a single shared container while preserving isolation.",
      repo: "https://github.com/BrownCS/common-course-containers",
      link: "https://cs.brown.edu/about/system/course-tech/common-course-containers/",
      slides: "/projects/ccc-slides.pdf",
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
    <section className="pl-4">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight text-center">Chloe Qiao</h1>
      <p className="mb-4">
        I am an undergraduate student at Brown University studying computer
        science. I am particularly interested in systems.
      </p>
      <p className="mb-8">
        In my free time, I like to{" "}
        <Link
          href="/fiction"
          className="transition-all hover:underline hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em] text-blue-500"
        >
          read fiction
        </Link>
        ,{" "}
        <Link
          href="/writings"
          className="transition-all hover:underline hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em] text-blue-500"
        >
          write about work
        </Link>
        , and {" "}
        <Link
          href="/climbing"
          className="transition-all hover:underline hover:text-blue-800 decoration-blue-400 underline-offset-2 decoration-[0.1em] text-blue-500"
        >
          go bouldering
        </Link>
        .
      </p>

      <h2 className="mb-4 text-xl font-semibold tracking-tight text-center">Projects</h2>
      {projects.map((project) => {
        const slug = project.title.toLowerCase().replace(/\s+/g, "-");
        return (
          <div key={project.title} id={slug} className="w-full mb-6 group">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <h2 className="relative text-neutral-900 tracking-tight pb-1">
                <a href={`#${slug}`} className="anchor absolute -ml-[1em] pr-[0.5em] invisible group-hover:visible no-underline text-neutral-300 after:content-['#']" />
                {project.title}
              </h2>
              <div className="flex flex-wrap items-baseline gap-x-1">
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
            </div>
            <p className="text-neutral-600 text-sm">
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
