export type Project = {
  title: string;
  description: React.ReactNode;
  report?: string;
  repo?: string;
  slides?: string;
  link?: string;
  tags?: string[];
};

export type Tag = "TypeScript" | "Rust" | "C++" | "Bash";

export const tagColor: Record<Tag, string> = {
  TypeScript: "bg-blue-100 text-blue-800",
  Rust: "bg-orange-100 text-orange-800",
  "C++": "bg-amber-100 text-amber-800",
  Bash: "bg-neutral-100 text-neutral-800",
};

export const projects: Project[] = [
  {
    title: "bph-site",
    description: (
      <>
        Most puzzlehunts rely on gph-site, a Django-based framework. However,
        its use of Django Channels (WebSockets) can open excessive database
        connections, overloading the server. This is a major cause of site
        crashes and forces puzzlehunts to overprovision resources. We realized
        that we can fix this issue by decoupling the Websocket server from the
        main application. bph-site is the result of that. It has been used by 6+
        puzzlehunts, serving over 7,000 participants. Among them are{" "}
        <a href="https://www.brownpuzzlehunt.com">Brown Puzzlehunt</a>,{" "}
        <a href="https://puzzlethon.brownpuzzleclub.com">Puzzlethon</a>,{" "}
        <a href="https://penchantpuzzlehunt.com">Penchant Hunt</a>, and{" "}
        <a href="https://www.mitmysteryhatch.com">MIT Mystery Hatch</a>.
      </>
    ),
    repo: "https://github.com/brown-puzzle-hq/bph-site",
    slides: "/projects/bph-site-slides.pdf",
    tags: ["TypeScript"],
  },
  {
    title: "Rust MIR-Level Integer Range Analysis",
    description:
      "Range analysis is used to prove properties about the range of values that a program can take on. These ranges enable optimizations such as dead-code and redundant-code elimination. We extended the Rust compiler with path-sensitive, intraprocedural analysis and a patcher module that computes these ranges and performs optimizations based on them.",
    repo: "https://github.com/qiaochloe/rust-range-analysis",
    report: "/projects/rust-mir-level-range-analysis.pdf",
    tags: ["Rust"],
  },
  {
    title: "Troubridge",
    description:
      "Access frequency is an important factor in memory allocation. For example, hot objects can be colocated to improve TLB locality, while cold objects can be moved to slower but cheaper far memory. We extended TCMalloc with Troubridge, a system that uses an object’s call site to estimate its access frequency prior to allocation.",
    report: "/projects/troubridge.pdf",
    repo: "https://github.com/qiaochloe/troubridge",
    slides: "/projects/troubridge-slides.pdf",
    tags: ["C++"],
  },
  {
    title: "Common Course Containers",
    description:
      "Courses often require students to run course-specific containers, which incurs significant storage overhead and introduces technical limitations when running multiple containers. We argue that multiple course environments can instead be run within a single shared container while preserving isolation.",
    repo: "https://github.com/BrownCS/common-course-containers",
    link: "https://cs.brown.edu/about/system/course-tech/common-course-containers/",
    slides: "/projects/ccc-slides.pdf",
    tags: ["Bash"],
  },
  {
    title: "MIT Mystery Heist",
    description: <>
      I worked on the layout of the puzzle lists and added interactive story elements that appear throughout the heist.
    </>,
    link: "http://mitmysteryhatch.com",
    tags: ["TypeScript"]
  },
  {
    title: "Puzzlethon 2025",
    description: <>
      I worked on Connections-inspired interactive puzzle called <a href="http://localhost:3000/puzzle/the-moo-york-times">Moo York Times</a>.
    </>,
    repo: "https://github.com/brown-puzzle-hq/2025-puzzlethon-site",
    link: "https://2025.puzzlethon.brownpuzzleclub.com",
    tags: ["TypeScript"]
  },
  {
    title: "Brown Puzzlehunt 2025",
    description: <>
      I built a <a href="https://2025.brownpuzzlehunt.com/puzzle">massive interactive map</a> and implemented the interactive puzzles <a href="https://2025.brownpuzzlehunt.com/puzzle/two-guards-two-doors">Two Guards, Two Doors</a>; <a href="https://2025.brownpuzzlehunt.com/puzzle/two-guards-river">Two Guards, Two Doors, a Boat, a River, and a Cabbage</a>; and <a href="https://2025.brownpuzzlehunt.com/puzzle/one-guard-screen">One Guard, Two Doors, and a Screen</a>.
    </>,
    repo: "https://github.com/brown-puzzle-hq/2025-bph-site",
    link: "https://2025.brownpuzzlehunt.com/",
    report: "https://2025.brownpuzzlehunt.com/wrapup#section-13",
    tags: ["TypeScript"],
  },
  {
    title: "Puzzlethon 2024",
    description: <>
      I built a <a href="https://2024.puzzlethon.brownpuzzleclub.com/map">Fog of War map</a> and a jigzaw canvas for <a href="https://2024.puzzlethon.brownpuzzleclub.com/puzzle/carberry">Josiah Carberry, Ph.D.</a> and <a href="https://2024.puzzlethon.brownpuzzleclub.com/puzzle/carberry-2">Josiah Carberry, Ph.D., Ph.D.</a>
    </>,
    link: "https://2024.puzzlethon.brownpuzzleclub.com",
    repo: "https://github.com/brown-puzzle-hq/2024-puzzlethon-site",
    report: "/puzzlethon-2024",
    tags: ["TypeScript"]
  },
  {
    title: "SAT Solver",
    description: 
      "I built a SAT solver which parses the DIMACS CNF format and solves it using the DPLL algorithm with two-watched literals.",
    report: "/projects/sat-solver.pdf",
    tags: ["Rust"],
  },
  {
  title: "TCP/IP Stack", 
  description: 
    <>
      We implemented the IP, UDP, and TCP protocols, along with RIP split horizon and poison reverse. Our design primarily used transmitters and receivers to handle packets internally.
    </>,
    tags: ["Rust"],
  }
];
