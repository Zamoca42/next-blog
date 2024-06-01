import { Tree, TreeViewElement } from "@/component/tree-view-api";
import { TreeItem } from "@/component/tree-item";
import { usePathname } from "next/navigation";

type TOCProps = {
  toc: TreeViewElement[];
};

export const TOC = ({ toc }: TOCProps) => {
  const pathname = usePathname().split("/").slice(1);
  return (
    <Tree
      className="w-full max-h-screen bg-background"
      indicator={true}
      initialExpendedItems={pathname}
    >
      {toc.map((element) => (
        <TreeItem key={element.id} elements={[element]} />
      ))}
    </Tree>
  );
};
