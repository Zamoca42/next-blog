"use client";

import { Folder } from "@/interface/folder";
import { createContext, useContext, useState } from "react";

interface SideBarContextProps {
  folders: Folder[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setFolders: (folders: Folder[]) => void;
}

const SideBarContext = createContext<SideBarContextProps>({
  folders: [],
  isOpen: true,
  setIsOpen: () => {},
  setFolders: () => {},
});

export const SideBarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  return (
    <SideBarContext.Provider value={{ folders, isOpen, setIsOpen, setFolders }}>
      {children}
    </SideBarContext.Provider>
  );
};

export const useSideBar = () => useContext(SideBarContext);
