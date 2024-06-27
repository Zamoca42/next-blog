"use client";

import { useSideBar } from "@/component/context/sidebar-provider";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export const MobileLinkBar = ({ children }: Props) => {
  const { isOpen, isLinkOpen } = useSideBar();
  return (
    !isOpen && (
      <aside
        className={`fixed md:hidden top-12 min-h-screen w-full bg-background transition-opacity duration-200 ease-in-out z-10 ${
          isLinkOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col justify-center items-center space-y-4 p-4 m-10">
          {children}
        </div>
      </aside>
    )
  );
};
