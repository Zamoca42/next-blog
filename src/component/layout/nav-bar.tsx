"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { PostLink, ExternalLinkWithMode } from "@/component/layout/nav-link";
import { useSideBar } from "@/component/sidebar-provider";
import { blogConfig } from "@/blog.config";
import { usePathname } from "next/navigation";

export const NavBar = () => {
  const { isOpen, setIsOpen, isLinkOpen, setIsLinkOpen } = useSideBar();
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      const mdMediaQuery = window.matchMedia("(max-width: 768px)");
      const lgMediaQuery = window.matchMedia("(max-width: 1024px)");

      if (mdMediaQuery.matches && (isOpen || isLinkOpen)) {
        document.body.style.overflow = "hidden";
      } else if (lgMediaQuery.matches && !isOpen && !isLinkOpen) {
        document.body.style.overflow = "auto";
      } else {
        document.body.style.overflow = "auto";
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, isLinkOpen]);

  const toggleMenu = () => {
    setIsLinkOpen(!isLinkOpen);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full backdrop-blur flex-none transition-colors duration-500 shadow-sm">
        <div className="max-w-8xl mx-auto p-4 lg:px-8">
          <div className="relative flex items-center">
            <div className="md:hidden mr-auto">
              <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={pathname === "/"}
              >
                <svg
                  className="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
            <div className="items-center">
              <Link
                href="/"
                className="text-xl font-semibold flex flex-row items-center space-x-4 ml-3"
              >
                <Image
                  src="/favicon/favicon-32x32.png"
                  width={32}
                  height={32}
                  alt="logo"
                  priority
                />
                <span className="hidden md:flex">
                  {blogConfig.name ?? "Blog"}
                </span>
              </Link>
            </div>
            <div className="hidden md:flex ml-auto">
              <PostLink
                matchedPathClass="active-link"
                notMatchedPathClass="nav-underline"
              />
            </div>
            <div className="hidden md:flex ml-auto">
              <ExternalLinkWithMode />
            </div>
            <div className="md:hidden ml-auto">
              <button onClick={toggleMenu} disabled={isOpen}>
                <svg
                  className="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      {!isOpen && (
        <aside
          className={`fixed md:hidden top-16 min-h-screen w-full bg-background transition-opacity duration-200 ease-in-out z-10 ${
            isLinkOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex flex-col justify-center items-center space-y-4 p-4 m-10">
            <PostLink toggleMenu={toggleMenu} divider />
            <ExternalLinkWithMode />
          </div>
        </aside>
      )}
    </>
  );
};
