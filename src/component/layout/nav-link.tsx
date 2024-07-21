"use client";

import { blogConfig } from "@/blog.config";
import { ModeToggle } from "@/component/ui/mode-toggle";
import { Button } from "@/component/ui/button";
import clsx from "clsx";
import { Fragment } from "react";
import { useRouter } from "next/navigation";
import { POST_HSITORY_NAME } from "@/lib/constant";

type Props = {
  divider?: boolean;
  matchedPathStyle?: string;
  notMatchedPathStyle?: string;
  pathname: string;
  toggleMenu: () => void;
};

type PostHistory = {
  [key: string]: {
    createdAt: string;
    updatedAt: string;
  };
};

export const PostLink = ({
  divider = false,
  matchedPathStyle = "text-primary-foreground font-semibold",
  notMatchedPathStyle = "",
  pathname,
  toggleMenu,
}: Props) => {
  const { navLink } = blogConfig;
  const router = useRouter();

  const getLatestPost = async (path: string) => {
    try {
      const response = await fetch(`/${POST_HSITORY_NAME}`);
      const data: PostHistory = await response.json();

      const matchingPostSlugs = Object.keys(data).filter((key) =>
        key.startsWith(path)
      );
      if (matchingPostSlugs.length > 0) {
        const latestPostSlug = matchingPostSlugs.reduce((a, b) =>
          new Date(data[a].createdAt) > new Date(data[b].createdAt) ? a : b
        );
        return latestPostSlug;
      }
      return null;
    } catch (error) {
      console.error("Error fetching post history:", error);
      return null;
    }
  };

  const handleClick = async (path: string) => {
    const latestPostSlug = await getLatestPost(path);
    if (latestPostSlug) {
      router.push(`/post/${latestPostSlug}`);
    } else {
      router.push(`/post/${path}`);
    }
    toggleMenu();
  };

  const renderHomeButton = () => (
    <Button
      variant="nav"
      size="link"
      aria-label="nav-button"
      className={clsx(
        pathname === "/" ? matchedPathStyle : notMatchedPathStyle,
        divider ? "hover:text-primary-foreground" : "",
        "ml-2 md:ml-0"
      )}
      onClick={() => {
        router.push("/");
        toggleMenu();
      }}
    >
      Home
    </Button>
  );

  return (
    <nav className="space-x-2 space-y-1">
      {renderHomeButton()}
      {navLink.map((folder) => {
        return (
          <Fragment key={folder.path}>
            {divider && <hr className="border-border min-w-72 py-1" />}
            <Button
              variant="nav"
              size="link"
              aria-label="nav-button"
              className={clsx(
                pathname.startsWith(`/post/${folder.path}`)
                  ? matchedPathStyle
                  : notMatchedPathStyle,
                divider ? "hover:text-primary-foreground" : ""
              )}
              onClick={() => handleClick(folder.path)}
            >
              {folder.name}
            </Button>
          </Fragment>
        );
      })}
    </nav>
  );
};

export const ExternalLinkWithMode = () => {
  const { blog } = blogConfig;
  const githubLink = blog.author.url;
  const linkedinLink = blog.media?.linkedin;

  return (
    <nav className="flex items-center">
      {githubLink && (
        <Button
          variant="link"
          size="icon"
          aria-label="github"
          onClick={() => window.open(githubLink)}
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
          size="icon"
          aria-label="linkedin"
          onClick={() => window.open(linkedinLink)}
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
