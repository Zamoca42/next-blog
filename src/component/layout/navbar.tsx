"use client";

import Link from "next/link";
import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import { ExternalLinkWithMode } from "@/component/layout/nav-link";
import { useSideBar } from "@/component/context/sidebar-provider";
import { blogConfig } from "@/blog.config";
import { usePathname } from "next/navigation";
import { AlignLeft, AlignRight, X } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/component/ui/button";
import { DocSearch } from "@docsearch/react";
import { ALGOLIA_INDEX_NAME } from "@/lib/constant";
import "@docsearch/css";

type Props = {
  children: ReactNode;
};

export const NavBar = ({ children }: Props) => {
  const { isOpen, setIsOpen, isLinkOpen, setIsLinkOpen } = useSideBar();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (pathname === "/") {
      setIsOpen(false);
    }
  }, [pathname, setIsOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY <= 50) {
        setIsVisible(true);
      }
    };

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      window.addEventListener("scroll", handleScroll);
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (isMobile) {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [lastScrollY]);

  useEffect(() => {
    const handleResize = () => {
      const mdMediaQuery = window.matchMedia("(max-width: 768px)");
      const lgMediaQuery = window.matchMedia("(max-width: 1024px)");

      if (mdMediaQuery.matches && (isOpen || isLinkOpen)) {
        document.body.style.overflow = "hidden";
      } else if (lgMediaQuery.matches && !isOpen && !isLinkOpen) {
        document.body.style.overflow = "auto";
      } else {
        document.body.style.overflow = "auto";
      }

      if (!mdMediaQuery.matches) {
        setIsVisible(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, isLinkOpen]);

  const toggleMenu = () => {
    setIsLinkOpen(!isLinkOpen);
  };

  return (
    <nav
      className={clsx(
        "fixed top-0 z-50 w-full backdrop-blur bg-background/80 flex-none transition-all duration-300 shadow-sm",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="max-w-8xl mx-auto py-2 px-4 lg:px-8">
        <div className="relative flex items-center">
          <div className="md:hidden flex-1">
            {pathname !== "/" && (
              <Button
                variant="link"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="flex-1"
              >
                <X
                  className={clsx(
                    "transition-all duration-300",
                    isOpen ? "scale-100 rotate-0" : "scale-0 rotate-180"
                  )}
                />
                <AlignLeft
                  className={clsx(
                    "absolute transition-all duration-300 disabled:opacity-50",
                    isOpen ? "scale-0 -rotate-180" : "scale-100 rotate-0"
                  )}
                />
              </Button>
            )}
          </div>
          <div className="flex-1 ml-[52px] md:ml-0">
            <Link
              href="/"
              className="text-xl font-semibold flex items-center md:space-x-4"
            >
              <Image
                src="/favicon/favicon-32x32.png"
                width={32}
                height={32}
                alt="logo"
                priority
              />
              <span className="hidden md:flex">
                {blogConfig.name ?? "Blog"}
              </span>
            </Link>
          </div>
          <div className="hidden md:flex flex-1">{children}</div>
          <div className="flex items-center">
            <div className="hidden md:flex">
              <ExternalLinkWithMode />
            </div>
            <div className="docsearch-wrapper">
              <DocSearch
                appId={process.env.NEXT_PUBLIC_DOCSEARCH_APP_ID!}
                apiKey={process.env.NEXT_PUBLIC_DOCSEARCH_API_KEY!}
                indexName={ALGOLIA_INDEX_NAME}
              />
            </div>
          </div>
          <div className="md:hidden flex items-center flex-0">
            <Button
              variant="link"
              size="icon"
              onClick={toggleMenu}
              disabled={isOpen}
              className="relative"
            >
              <X
                className={clsx(
                  "absolute transition-all duration-300",
                  isLinkOpen ? "scale-100 rotate-0" : "scale-0 -rotate-180"
                )}
              />
              <AlignRight
                className={clsx(
                  "absolute transition-all duration-300",
                  isLinkOpen ? "scale-0 rotate-180" : "scale-100 rotate-0"
                )}
              />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
