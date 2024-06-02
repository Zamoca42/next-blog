"use client";

import { createContext, useContext, useState } from "react";

interface SideBarContextProps {
  path: string;
  isOpen: boolean;
  isLinkOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setIsLinkOpen: (isLinkOpen: boolean) => void;
  setPath: (path: string) => void;
}

const SideBarContext = createContext<SideBarContextProps>({
  path: "",
  isOpen: true,
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

  return (
    <SideBarContext.Provider
      value={{
        path,
        isOpen,
        isLinkOpen,
        setIsOpen,
        setIsLinkOpen,
        setPath,
      }}
    >
      {children}
    </SideBarContext.Provider>
  );
};

export const useSideBar = () => useContext(SideBarContext);
