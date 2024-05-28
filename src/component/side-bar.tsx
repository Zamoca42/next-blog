"use client";
import { usePathname } from "next/navigation";
import { useSideBar } from "@/component/provider";
import Link from "next/link";

export const SideBar = () => {
  const pathname = usePathname();
  const { folders, isOpen, setIsOpen } = useSideBar();
  const folder = folders.find((folder) =>
    pathname.startsWith(`/post/${folder.path}`)
  );

  return (
    folder && (
      <div className="h-full z-5">
        <div
          className={`absolute top-16 h-full w-72 bg-white transition-transform duration-300 shadow-sm lg:shadow-none ease-in-out transform ${
            isOpen ? "translate-x-0" : "-translate-x-72 lg:translate-x-0"
          }`}
        >
          <div className="p-4">
            {folder.posts.map((post, index) => (
              <Link
                key={index}
                href={`/post/${post.slug}`}
                className="block mb-2"
              >
                {post.title}
              </Link>
            ))}
          </div>
        </div>
        <button
          className={`w-8 relative min-h-screen btn z-0 transition-transform duration-300 ease-in-out transform lg:hidden ${
            isOpen ? "translate-x-72" : "translate-x-0"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-gray-600 text-lg">{isOpen ? "<" : ">"}</span>
        </button>
      </div>
    )
  );
};
