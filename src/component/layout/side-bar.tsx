"use client";

import { useSideBar } from "@/component/context/sidebar-provider";
import { Tree } from "@/component/ui/tree-view-api";
import { TreeItem } from "@/component/layout/tree-item";
import { usePathname } from "next/navigation";
import { TocItem } from "remark-flexible-toc";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useBlogContent } from "@/component/context/swr-provider";
import { sortFoldersAndFiles } from "@/lib/util";

type Props = {
  toc: TocItem[];
};

export const SideBar = ({ toc }: Props) => {
  const { isOpen, setIsOpen } = useSideBar();
  const { folders, isLoading, isError } = useBlogContent();
  const pathname = usePathname();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Fetch Error!</div>;

  const sortedFolders = folders?.map((folder) => ({
    ...folder,
    children: folder.children ? sortFoldersAndFiles(folder.children) : [],
  }));

  return (
    <aside className="h-full z-0">
      <div
        className={`fixed bg-background w-72 md:w-72 transition-transform duration-300 shadow-sm lg:shadow-none ease-in-out transform
          lg:block z-20 inset-0 top-16 left-[max(0px,calc(50%-45rem))] right-auto pb-10 pl-4 pr-2 overflow-y-auto
          ${
            isOpen
              ? "translate-x-0"
              : `-translate-x-72 md:-translate-x-72 lg:translate-x-0`
          }`}
      >
        <div className={`max-w-full`}>
          <Tree
            className="w-full max-h-screen bg-background text-muted-foreground"
            indicator={true}
            initialExpendedItems={pathname.split("/").slice(1)}
          >
            {sortedFolders
              ?.filter((folder) => folder.path === pathname.split("/")[2])
              .map((element) => (
                <TreeItem key={element.id} elements={[element]} toc={toc} />
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
        {isOpen ? <ChevronLeft /> : <ChevronRight />}
      </button>
    </aside>
  );
};
