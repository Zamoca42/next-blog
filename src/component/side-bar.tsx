"use client";

import { useSideBar } from "@/component/provider";
import { TreeViewElement } from "@/component/tree-view-api";
import { TOC } from "@/component/toc";

export const SideBar = () => {
  const { postList, isOpen, setIsOpen } = useSideBar();

  const elements: TreeViewElement[] = [
    {
      id: "1",
      name: "components",
      children: [
        {
          id: "2",
          name: "extension",
          children: [
            {
              id: "3",
              name: "tree-view.tsx",
            },
            {
              id: "4",
              name: "tree-view-api.tsx",
            },
          ],
        },
        {
          id: "5",
          name: "dashboard-tree.tsx",
        },
      ],
    },
    {
      id: "6",
      name: "pages",
      children: [
        {
          id: "7",
          name: "page.tsx",
        },
        {
          id: "8",
          name: "page-guide.tsx",
        },
      ],
    },
    {
      id: "18",
      name: "env.ts",
    },
  ];

  return (
    postList && (
      <div className="h-full z-0">
        <div
          className={`fixed w-64 md:w-72 bg-white transition-transform duration-300 shadow-sm lg:shadow-none ease-in-out transform
          lg:block z-20 inset-0 top-16 left-[max(0px,calc(50%-45rem))] right-auto pb-10 pl-8 pr-6 overflow-y-auto
          ${isOpen ? "translate-x-0" : `-translate-x-64 md:-translate-x-72 lg:translate-x-0`}`}
        >
          <div className={`py-4 max-w-[14.5rem]`}>
            <TOC toc={elements} />
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
