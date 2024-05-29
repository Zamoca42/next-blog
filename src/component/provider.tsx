"use client";

import { Post } from "@/interface/post";
import { createContext, useContext, useState } from "react";

interface SideBarContextProps {
  postList: Post[];
  isOpen: boolean;
  isLinkOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setIsLinkOpen: (isLinkOpen: boolean) => void;
  setPostList: (folders: Post[]) => void;
}

const SideBarContext = createContext<SideBarContextProps>({
  postList: [],
  isOpen: true,
  isLinkOpen: false,
  setIsOpen: () => {},
  setIsLinkOpen: () => {},
  setPostList: () => {},
});

export const SideBarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [postList, setPostList] = useState<Post[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);

  return (
    <SideBarContext.Provider
      value={{
        postList,
        isOpen,
        isLinkOpen,
        setIsOpen,
        setIsLinkOpen,
        setPostList,
      }}
    >
      {children}
    </SideBarContext.Provider>
  );
};

export const useSideBar = () => useContext(SideBarContext);
