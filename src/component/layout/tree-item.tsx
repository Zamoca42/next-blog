"use client";

import { File, Folder, TreeViewElement } from "@/component/ui/tree-view-api";
import Link from "next/link";
import { useSideBar } from "@/component/context/sidebar-provider";
import { TocItem } from "remark-flexible-toc";
import { PostToc } from "../post/post-toc";

type TreeItemProps = {
  elements: TreeViewElement[];
  toc: TocItem[];
  slug: string;
};

export const TreeItem = ({ elements, toc, slug }: TreeItemProps) => {
  const { isOpen, setIsOpen } = useSideBar();
  return (
    <ul className="space-y-1">
      {elements.map((element) => {
        const isSlug = slug === element.path;
        return (
          <li key={element.id} className="space-y-2">
            {element.children && element.children?.length > 0 ? (
              <Folder
                element={element.name}
                value={element.path}
                isSelectable={element.isSelectable}
                className="px-px pr-1"
              >
                <TreeItem
                  key={element.id}
                  aria-label={`folder ${element.name}`}
                  elements={element.children}
                  toc={toc}
                  slug={slug}
                />
              </Folder>
            ) : (
              <>
                <File
                  key={element.id}
                  value={element.path}
                  isSelectable={element.isSelectable}
                  className={`px-1 w-full ${
                    isSlug
                      ? "bg-primary/15 text-primary-foreground font-semibold"
                      : "hover:bg-muted"
                  }`}
                  fileIcon=""
                >
                  <Link
                    href={`/post/${element.path}`}
                    className={`px-2 text-sm text-left py-1 text-pretty w-full`}
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    {element.name ?? element.path}
                  </Link>
                </File>
                {isSlug && toc && toc.length > 0 && (
                  <div className="ml-2 block xl:hidden">
                    <PostToc toc={toc} />
                  </div>
                )}
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
};
