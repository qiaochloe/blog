"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = {
  "/": {
    name: "Home",
  },
  "/writings": {
    name: "Writings",
  },
  "/about": {
    name: "About",
  },
  "/now": {
    name: "Now",
  },
  "/rss": {
    name: "RSS",
  },
};

export function Navbar() {
  const pathname = usePathname();

  return (
    <aside className="-ml-[8px] mb-8 tracking-tight">
      <div className="lg:sticky lg:top-20">
        <nav
          className="flex flex-row items-start relative px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative"
          id="nav"
        >
          <div className="flex flex-row space-x-0 pr-10">
            {Object.entries(navItems).map(([path, { name }]) => {
              return (
                <Link
                  key={path}
                  href={path}
                  className={`flex align-middle relative py-1 px-2 transition-colors ${
                    path === pathname
                      ? "text-orange-500"
                      : "hover:text-orange-500 text-neutral-700"
                  }`}
                >
                  {name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}
