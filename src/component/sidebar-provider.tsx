"use client";

import { ContentFolder } from "@/interface/folder";
import { getAllTreeNode } from "@/app/api/action";
import { createContext, useContext, useEffect, useState } from "react";


interface SideBarContextProps {
  path: string;
  isOpen: boolean;
  isLinkOpen: boolean;
  folders: ContentFolder[];
  setIsOpen: (isOpen: boolean) => void;
  setIsLinkOpen: (isLinkOpen: boolean) => void;
  setPath: (path: string) => void;
}

const SideBarContext = createContext<SideBarContextProps>({
  path: "",
  isOpen: true,
  folders: [],
  isLinkOpen: false,
  setIsOpen: () => {},
  setIsLinkOpen: () => {},
  setPath: () => {},
});

export const SideBarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [path, setPath] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [folders, setFolders] = useState<ContentFolder[]>([]);

  useEffect(() => {
    const fetchFolders = async () => {
      const data = await getAllTreeNode();
      setFolders(data);
    };

    fetchFolders();
  }, []);

  return (
    <SideBarContext.Provider
      value={{
        path,
        isOpen,
        isLinkOpen,
        setIsOpen,
        setIsLinkOpen,
        setPath,
        folders,
      }}
    >
      {children}
    </SideBarContext.Provider>
  );
};

export const useSideBar = () => useContext(SideBarContext);
