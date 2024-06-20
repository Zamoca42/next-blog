"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export default function Giscus() {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  // https://github.com/giscus/giscus/tree/main/styles/themes
  const theme =
    resolvedTheme === "dark" ? "dark_high_contrast" : "light_high_contrast";

  useEffect(() => {
    if (!ref.current || ref.current.hasChildNodes()) return;

    const scriptElem = document.createElement("script");
    scriptElem.src = "https://giscus.app/client.js";
    scriptElem.async = true;
    scriptElem.crossOrigin = "anonymous";

    scriptElem.setAttribute("data-repo", "zamoca42/next-blog");
    scriptElem.setAttribute("data-repo-id", "R_kgDOMA2ZsA");
    scriptElem.setAttribute("data-category", "Comments");
    scriptElem.setAttribute("data-category-id", "DIC_kwDOMA2ZsM4CgN7x");
    scriptElem.setAttribute("data-mapping", "title");
    scriptElem.setAttribute("data-strict", "0");
    scriptElem.setAttribute("data-reactions-enabled", "1");
    scriptElem.setAttribute("data-emit-metadata", "1");
    scriptElem.setAttribute("data-input-position", "top");
    scriptElem.setAttribute("data-theme", theme);
    scriptElem.setAttribute("data-lang", "ko");

    ref.current.appendChild(scriptElem);
  }, [theme]);

  // https://github.com/giscus/giscus/blob/main/ADVANCED-USAGE.md#isetconfigmessage
  useEffect(() => {
    const iframe = document.querySelector<HTMLIFrameElement>(
      "iframe.giscus-frame"
    );
    iframe?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme } } },
      "https://giscus.app"
    );
  }, [theme]);

  return <section className="max-w-3xl px-1 py-4" ref={ref} />;
}
