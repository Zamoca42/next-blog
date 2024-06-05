"use client";

import {
  File,
  Folder,
  TreeViewElement,
} from "@/component/layout/tree-view-api";
import Link from "next/link";

type TreeItemProps = {
  elements: TreeViewElement[];
};

export const TreeItem = ({ elements }: TreeItemProps) => {
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
              />
            </Folder>
          ) : (
            <File
              key={element.id}
              value={element.path}
              isSelectable={element.isSelectable}
              className={`px-1`}
              fileIcon=""
            >
              <Link
                href={`/post/${element.path}`}
                className={`px-2 text-sm text-left py-1 text-pretty `}
              >
                {element.name ?? element.path}
              </Link>
            </File>
          )}
        </li>
      ))}
    </ul>
  );
};