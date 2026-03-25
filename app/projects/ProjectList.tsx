import { Project, Tag, tagColor } from "./data"
import Link from "next/link";

export default function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div className="content w-full">
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
                <div className="flex gap-x-1">
                  {project.report && (
                    <Link href={project.report} className="text-sm">[Report]</Link>
                  )}
                  {project.link && (
                    <Link href={project.link} className="text-sm">[Link]</Link>
                  )}
                  {project.slides && (
                    <Link href={project.slides} className="text-sm">[Slides]</Link>
                  )}
                  {project.repo && (
                    <Link href={project.repo} className="text-sm">[GitHub]</Link>
                  )}
              </div>
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
    </div>
  )
}

