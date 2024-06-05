"use client";

import { blogConfig } from "@/blog.config";
import { usePathname, useRouter } from "next/navigation";
import { useSideBar } from "@/component/provider";
import { Fragment } from "react";
import { getAllPosts } from "@/app/api/action";

interface Props {
  toggleMenu?: () => void;
  divider?: boolean;
  matchedPathClass?: string;
  notMatchedPathClass?: string;
}

export const NavLink = ({
  toggleMenu,
  divider = false,
  matchedPathClass = "text-grass-6 font-semibold",
  notMatchedPathClass = "",
}: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const { setPath } = useSideBar();
  const { navLink } = blogConfig;

  const handleRouter = (path: string) => {
    router.push(path);

    if (toggleMenu) {
      toggleMenu();
    }
  };

  const handlePostRouter = async (path: string) => {
    const posts = await getAllPosts();
    const matchedPosts = posts.filter((post) =>
      post.slug.split("/").includes(path)
    );
    router.push(`/post/${matchedPosts[0].slug}`);

    setPath(path);

    if (toggleMenu) {
      toggleMenu();
    }
  };

  return (
    <ul className="space-x-2">
      <button
        className={`${
          pathname === "/" ? matchedPathClass : notMatchedPathClass
        }`}
        onClick={() => handleRouter("/")}
      >
        Home
      </button>
      {navLink.map((folder) => (
        <Fragment key={folder.path}>
          {divider && <hr className="border-gray-200 min-w-72" />}
          <button
            className={`${
              pathname.startsWith(`/post/${folder.path}`)
                ? matchedPathClass
                : notMatchedPathClass
            }`}
            onClick={() => handlePostRouter(folder.path)}
          >
            {folder.name}
          </button>
        </Fragment>
      ))}
    </ul>
  );
};