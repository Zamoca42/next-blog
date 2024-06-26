"use client";

import Giscus from "@giscus/react";
import { useTheme } from "next-themes";

export default function GiscusWithTheme() {
  const { resolvedTheme } = useTheme();
  const theme =
    resolvedTheme === "dark" ? "dark_high_contrast" : "light_high_contrast";

  return (
    <div className="max-w-3xl px-2 py-4">
      <Giscus
        id="comments"
        repo="zamoca42/next-blog"
        repoId="R_kgDOMA2ZsA"
        category="Comments"
        categoryId="DIC_kwDOMA2ZsM4CgN7x"
        mapping="title"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme}
        lang="ko"
        loading="lazy"
      />
    </div>
  );
}
