"use client";

import { createContext, useContext, useState } from "react";

interface SideBarContextProps {
  isOpen: boolean;
  isLinkOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setIsLinkOpen: (isLinkOpen: boolean) => void;
}

const SideBarContext = createContext<SideBarContextProps>({
  isOpen: true,
  isLinkOpen: false,
  setIsOpen: () => {},
  setIsLinkOpen: () => {},
});

export const SideBarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);

  return (
    <SideBarContext.Provider
      value={{
        isOpen,
        isLinkOpen,
        setIsOpen,
        setIsLinkOpen,
      }}
    >
      {children}
    </SideBarContext.Provider>
  );
};

export const useSideBar = () => useContext(SideBarContext);
