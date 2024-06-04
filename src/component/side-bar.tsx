"use client";

import { useSideBar } from "@/component/provider";
import { TOC } from "@/component/toc";
import { ContentFolder } from "@/interface/folder";
import { gql } from "graphql-request";
import { useEffect, useRef, useState } from "react";
import { TreeViewElement } from "./tree-view-api";
import { graphQlClient, parseQuery } from "@/lib/graphql-request";

export const SideBar = () => {
  const { path, isOpen, setIsOpen } = useSideBar();
  const [elements, setElements] = useState<TreeViewElement[]>([]);
  const prevPathRef = useRef("");

  useEffect(() => {
    if (prevPathRef.current !== path) {
      const fetchFolders = async () => {
        const query = parseQuery<{
          folders: ContentFolder[];
        }>(gql`
          fragment TreeNode on Folder {
            id
            name
            path
          }

          query {
            folders(path: "${path}") {
              ...TreeNode
              children {
                ...TreeNode
                children {
                  ...TreeNode
                  children {
                    ...TreeNode
                  }
                }
              }
            }
          }
        `);
        const res = await graphQlClient.request({
          document: query,
        });

        setElements(res.folders);
      };

      fetchFolders();
      prevPathRef.current = path;
    }
  }, [path]);

  return (
    <div className="h-full z-0">
      <div
        className={`fixed w-72 md:w-80 bg-white transition-transform duration-300 shadow-sm lg:shadow-none ease-in-out transform
          lg:block z-20 inset-0 top-16 left-[max(0px,calc(50%-45rem))] right-auto pb-10 pl-4 pr-2 overflow-y-auto
          ${
            isOpen
              ? "translate-x-0"
              : `-translate-x-80 md:-translate-x-80 lg:translate-x-0`
          }`}
      >
        <div className={`max-w-full`}>
          <TOC toc={elements} />
        </div>
      </div>
      <button
        className={`fixed w-8 min-h-screen z-0 hover:bg-accent hover:text-accent-foreground transition-transform duration-300 
          ease-in-out transform hidden md:block lg:hidden ${
            isOpen ? `translate-x-80` : "translate-x-0"
          }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-600 text-lg ">{isOpen ? "<" : ">"}</span>
      </button>
    </div>
  );
};
