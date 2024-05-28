"use client";

import { Folder } from "@/interface/folder";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  folders: Folder[];
  toggleMenu: () => void;
}

export const NavLink = ({ folders, toggleMenu }: Props) => {
  const pathname = usePathname();
  return (
    <div className="flex flex-col justify-center items-center space-y-4 p-4 m-10">
      <Link
        href="/"
        className={`${pathname === "/" ? "text-grass" : ""}`}
        onClick={toggleMenu}
      >
        Home
      </Link>
      {folders.map((folder) => (
        <>
          <hr className="border-gray-200 min-w-72" />
          <Link
            href={`/post/${folder.posts[0].slug}`}
            key={folder.path}
            className={`${
              pathname.startsWith(`/post/${folder.path}`) ? "text-grass" : ""
            }`}
            onClick={toggleMenu}
          >
            {folder.name}
          </Link>
        </>
      ))}
    </div>
  );
};
