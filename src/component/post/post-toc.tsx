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

    const elements = article.querySelectorAll("h2");

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
        rootMargin: "-20% 0% -20% 0%",
        threshold: 0.3
      }
    );

    elements.forEach((element) => {
      observer.observe(element);
    });
  }, []);

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    const targetElement = document.querySelector(href);
    if (targetElement) {
      const offset =
        targetElement.getBoundingClientRect().top +
        window.scrollY -
        window.innerHeight / 1.5;
      window.scrollTo({ top: offset, behavior: "smooth" });
    }
  };

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
            onClick={(e) => handleLinkClick(e, item.href)}
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
