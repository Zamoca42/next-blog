"use client";

import { useSideBar } from "@/component/provider";
import { Tree, TreeViewElement } from "@/component/layout/tree-view-api";
import { TreeItem } from "@/component/layout/tree-item";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const SideBar = () => {
  const { folders, path, isOpen, setIsOpen } = useSideBar();
  const [elements, setElements] = useState<TreeViewElement[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const fetchFolders = () => {
      const pathFolders = folders.filter((folder) => folder.path === path);
      setElements(pathFolders);
    };

    fetchFolders();
  }, [path, pathname]);

  return (
    <div className="h-full z-0">
      <div
        className={`fixed w-72 md:w-72 transition-transform duration-300 shadow-sm lg:shadow-none ease-in-out transform
          lg:block z-20 inset-0 top-16 left-[max(0px,calc(50%-45rem))] right-auto pb-10 pl-4 pr-2 overflow-y-auto
          ${
            isOpen
              ? "translate-x-0"
              : `-translate-x-72 md:-translate-x-72 lg:translate-x-0`
          }`}
      >
        <div className={`max-w-full`}>
          <Tree
            className="w-full max-h-screen bg-background"
            indicator={true}
            initialExpendedItems={pathname.split("/").slice(1)}
          >
            {elements.map((element) => (
              <TreeItem key={element.id} elements={[element]} />
            ))}
          </Tree>
        </div>
      </div>
      <button
        className={`fixed w-8 min-h-screen z-0 hover:bg-accent/55 hover:text-accent-foreground transition-transform duration-300 
          ease-in-out transform hidden md:block lg:hidden ${
            isOpen ? `translate-x-72` : "translate-x-0"
          }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-600 text-lg ">{isOpen ? "<" : ">"}</span>
      </button>
    </div>
  );
};
