import Link from "next/link";
import { getPosts } from "app/posts";
import { formatDate } from "app/utils";
import { projects } from "./projects/data";
import ProjectList from "./projects/ProjectList";

export default function Page() {
  // For titles
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
  const selectedProjects = projects.filter((project) => ["bph-site", "Rust MIR-Level Integer Range Analysis", "Troubridge", "Common Course Containers"].includes(project.title));

  return (
    <section className="px-2">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight text-center">Chloe Qiao</h1>
      <div className="content mb-8 flex flex-col gap-y-4 text-justify">
        <p>
          Hi! I am a student at Brown University studying computer science. I am particularly interested in computer networks, operating systems, and compilers.
        </p>
        <p>
          In the Brown CS department, I have worked as a <a href="https://cs.brown.edu/people/staff/spoc/">systems programmer</a>, a <a href="https://cs.brown.edu/degrees/undergrad/jobs/consult/">lab consultant</a>, and a teaching assistant for <a href="https://browncs1715.github.io/">Formal Proof and Verification</a> (TA Fall 2024, HTA Fall 2025), <a href="https://csci0300.github.io/">Computer Systems</a> (TA Spring 2025), <a href="https://cs.brown.edu/courses/csci1515/">Applied Cryptography</a> (HTA Spring 2026), and <a href="https://csci1670.github.io/">Operating Systems</a> (HTA Fall 2026). I also run tech for <a href="https://brownpuzzlehunt.com/">Brown Puzzlehunt</a>.
        </p>
        <p>
          In my free time, I like to <Link href="/fiction">read</Link>, <Link href="/writings">write</Link>, and <Link href="/climbing">go climbing</Link>.
        </p>
        <p>
          Brown students might find some of my <Link href="/courses">courses reviews</Link> useful.
        </p>
      </div>

      <h2 className="mb-4 text-xl font-semibold tracking-tight text-center">Selected Projects</h2>
      <ProjectList projects={selectedProjects} />

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
