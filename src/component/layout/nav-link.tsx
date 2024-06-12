"use client";

import { blogConfig } from "@/blog.config";
import { usePathname, useRouter } from "next/navigation";
import { getAllPosts } from "@/app/api/action";
import clsx from "clsx";
import { Fragment } from "react";
import { ModeToggle } from "@/component/ui/mode-toggle";
import { Button } from "@/component/ui/button";

type Props = {
  toggleMenu?: () => void;
  divider?: boolean;
  matchedPathClass?: string;
  notMatchedPathClass?: string;
};

export const PostLink = ({
  toggleMenu,
  divider = false,
  matchedPathClass = "text-primary-foreground font-semibold",
  notMatchedPathClass = "",
}: Props) => {
  const pathname = usePathname();
  const router = useRouter();
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

    if (toggleMenu) {
      toggleMenu();
    }
  };

  return (
    <nav className="space-x-2 space-y-2">
      <button
        className={clsx(
          pathname === "/" ? matchedPathClass : notMatchedPathClass,
          divider ? "hover:text-primary-foreground" : "",
          "ml-2"
        )}
        onClick={() => handleRouter("/")}
      >
        Home
      </button>
      {navLink.map((folder) => (
        <Fragment key={folder.path}>
          {divider && <hr className="border-gray-200 min-w-72" />}
          <button
            className={clsx(
              pathname.startsWith(`/post/${folder.path}`)
                ? matchedPathClass
                : notMatchedPathClass,
              divider ? "hover:text-primary-foreground" : ""
            )}
            onClick={() => handlePostRouter(folder.path)}
          >
            {folder.name}
          </button>
        </Fragment>
      ))}
    </nav>
  );
};

export const ExternalLinkWithMode = () => {
  const router = useRouter();
  const { blog } = blogConfig;
  const githubLink = blog.author.url;
  const linkedinLink = blog.media?.linkedin;

  return (
    <nav className="flex items-center">
      {githubLink && (
        <Button
          variant="link"
          size="sm"
          onClick={() => window.open(githubLink, "_blank")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-github"
          >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
        </Button>
      )}
      {linkedinLink && (
        <Button
          variant="link"
          size="sm"
          onClick={() => window.open(linkedinLink, "_blank")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-linkedin"
          >
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect width="4" height="12" x="2" y="9" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </Button>
      )}
      <ModeToggle />
    </nav>
  );
};
