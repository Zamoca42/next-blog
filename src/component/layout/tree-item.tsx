"use client";

import { File, Folder, TreeViewElement } from "@/component/ui/tree-view-api";
import Link from "next/link";
import { useSideBar } from "@/component/context/sidebar-provider";
import { TocItem } from "remark-flexible-toc";
import { PostToc } from "../post/post-toc";
import { usePathname } from "next/navigation";

type TreeItemProps = {
  elements: TreeViewElement[];
  toc: TocItem[];
};

export const TreeItem = ({ elements, toc }: TreeItemProps) => {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useSideBar();
  return (
    <ul className="space-y-1">
      {elements.map((element) => (
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
              />
            </Folder>
          ) : (
            <>
              <File
                key={element.id}
                value={element.path}
                isSelectable={element.isSelectable}
                className={`px-1 w-full`}
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
              {pathname === `/post${element.path}` && toc && toc.length > 0 && (
                <div className="ml-2 block xl:hidden">
                  <PostToc toc={toc} />
                </div>
              )}
            </>
          )}
        </li>
      ))}
    </ul>
  );
};
