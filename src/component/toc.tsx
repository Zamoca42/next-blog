import {
  Tree,
  TreeViewElement,
  CollapseButton,
} from "@/component/tree-view-api";
import { TreeItem } from "@/component/tree-item";

type TOCProps = {
  toc: TreeViewElement[];
};

export const TOC = ({ toc }: TOCProps) => {
  return (
    <Tree className="w-full max-h-screen bg-background" indicator={true}>
      {toc.map((element, _) => (
        <TreeItem key={element.id} elements={[element]} />
      ))}
      <CollapseButton elements={toc} expandAll={true} />
    </Tree>
  );
};
