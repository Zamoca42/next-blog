"use client";

import { blogConfig } from "@/blog.config";
import { usePathname, useRouter } from "next/navigation";
import { useSideBar } from "@/component/provider";
import { fetchGraphQL } from "@/app/api/action";
import { Post } from "@/interface/post";
import { gql } from "graphql-request";
import { Fragment, useCallback } from "react";

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
  const { postLink } = blogConfig;

  const handleRouter = (path: string) => {
    router.push(path);

    if (toggleMenu) {
      toggleMenu();
    }
  };

  const handlePostRouter = useCallback(async (path: string) => {
    const response = await fetchGraphQL<{ posts: Post[] }>(gql`
    query {
      posts(prefix: "${path}") {
        title
        slug
      }
    }
  `);
    const postList = response?.posts;
    router.push(`/post/${postList[0].slug}`);

    setPath(path);

    if (toggleMenu) {
      toggleMenu();
    }
  }, [pathname]);

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
      {postLink.map((folder) => (
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
