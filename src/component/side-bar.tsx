"use client";

import { useSideBar } from "@/component/provider";
import Link from "next/link";

export const SideBar = () => {
  const { postList, isOpen, setIsOpen } = useSideBar();
  const sideBarWidth = "72";

  return (
    postList && (
      <div className="h-full z-0">
        <div
          className={`fixed w-72 bg-white transition-transform duration-300 shadow-sm lg:shadow-none ease-in-out transform
          lg:block z-20 inset-0 top-16 left-[max(0px,calc(50%-45rem))] right-auto pb-10 pl-8 pr-6 overflow-y-auto
          ${
            isOpen ? "translate-x-0" : `-translate-x-72 lg:translate-x-0`
          }`}
        >
          <div className={`p-4 max-w-72`}>
            {postList.map((post, index) => (
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
          className={`fixed w-8 min-h-screen btn z-0 transition-transform duration-300 ease-in-out transform hidden md:block lg:hidden ${
            isOpen ? `translate-x-72` : "translate-x-0"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-gray-600 text-lg">{isOpen ? "<" : ">"}</span>
        </button>
      </div>
    )
  );
};
