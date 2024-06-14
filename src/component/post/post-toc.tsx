"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TocItem } from "remark-flexible-toc";

type PostTocProps = {
  toc: TocItem[];
};

export const PostToc = ({ toc }: PostTocProps) => {
  const [activeToc, setActiveToc] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector("article");
      if (!article) return;

      const elements = article.querySelectorAll("h1, h2");
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const middlePosition = scrollPosition + windowHeight / 2;

      elements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top + window.scrollY;
        const elementBottom = elementTop + element.clientHeight;
        const elementMiddle = (elementTop + elementBottom) / 2;

        if (Math.abs(elementMiddle - middlePosition) < 325) {
          const id = element.getAttribute("id");
          setActiveToc(`#${id}`);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (toc.length === 0) {
    return null;
  }

  return (
    <ul className="border-s pl-1 ml-2 space-y-2 xl:pl-4 text-muted-foreground">
      {toc.map((item) => (
        <li
          key={item.href}
          style={{ marginLeft: `${(item.depth - 1) * 8}px` }}
          className="text-sm text-pretty xl:list-disc relative"
        >
          <Link
            href={item.href}
            className={`p-1 pr-10 hover:text-primary-foreground w-full ${
              activeToc === item.href ? "text-primary-foreground" : ""
            }`}
          >
            {item.value}
          </Link>
        </li>
      ))}
    </ul>
  );
};
