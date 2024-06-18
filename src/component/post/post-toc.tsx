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
    const article = document.querySelector("article");
    if (!article) return;

    const elements = article.querySelectorAll("h1, h2");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            setActiveToc((prevActiveToc) => {
              if (prevActiveToc !== `#${id}`) {
                return `#${id}`;
              }
              return prevActiveToc;
            });
          }
        });
      },
      {
        rootMargin: "0% 0% -20% 0%",
        threshold: 1,
      }
    );

    elements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  if (toc.length === 0) {
    return null;
  }

  return (
    <ul className="border-s pl-1 ml-2 space-y-2 xl:pl-4 text-muted-foreground text-pretty">
      {toc.map((item) => (
        <li
          key={item.href}
          style={{ marginLeft: `${(item.depth - 1) * 8}px` }}
          className="text-sm text-pretty xl:list-disc relative"
        >
          <Link
            href={item.href}
            className={`hover:text-primary-foreground ${
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
