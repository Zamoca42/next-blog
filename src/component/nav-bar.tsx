"use client";

import { Folder } from "@/interface/folder";
import { fetchGraphQL } from "@/app/api/action";
import { gql } from "graphql-request";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NavContainer } from "@/component/nav-container";
import { usePathname } from "next/navigation";

export const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const fetchFolders = async () => {
      const res = await fetchGraphQL<{ folders: Folder[] }>(gql`
        query {
          folders {
            name
            path
            posts {
              slug
              title
            }
          }
        }
      `);
      setFolders(res.folders);
    };
    fetchFolders();
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    document.body.style.overflow = !isOpen ? "hidden" : "auto";
  };

  return (
    <>
      <nav className="flex items-center justify-between px-4 h-16 shadow-sm relative z-10">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-semibold">
            Zamoca Space
          </Link>
        </div>
        <div className="hidden md:flex gap-4 *:h-full">
          <Link
            href="/"
            className={`${
              pathname === "/" ? "active-link" : "nav-underline"
            }`}
          >
            Home
          </Link>
          {folders.map((folder) => (
            <Link
              href={`/post/${folder.posts[0].slug}`}
              key={folder.path}
              className={`${
                pathname.startsWith(`/post/${folder.path}`) ? "active-link" : "nav-underline"
              }`}
            >
              {folder.name}
            </Link>
          ))}
        </div>
        <div className="md:hidden">
          <button onClick={toggleMenu}>
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
      </nav>
      <div
        className={`absolute md:hidden top-16 h-full w-full bg-white transition-opacity duration-300 ease-in-out z-0 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <NavContainer folders={folders} toggleMenu={toggleMenu} />
      </div>
    </>
  );
};
