import { projects } from "./data";
import ProjectList from "./ProjectList";

export default function Page() {
  return (
    <section className="px-2">
      <h1 className="font-semibold text-2xl mb-4 tracking-tighter">Projects</h1>
      <ProjectList projects={projects} />
    </section>
  );
}
