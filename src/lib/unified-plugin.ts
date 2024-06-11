import { visit } from "unist-util-visit";
import { Plugin } from "unified";
import { Node, Parent, Literal } from "unist";
import { unified } from "unified";
import remarkToc, { TocItem } from "remark-flexible-toc";
import { refractor } from "refractor/lib/all.js";
import rehypePrismGenerator from "rehype-prism-plus/generator";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";

export const removeHeadings: Plugin = () => {
  return (tree: Node) => {
    visit(tree, "heading", (node, index, parent: Parent | null) => {
      if (parent && typeof index === "number") {
        parent.children.splice(index, 1);
      }
    });
  };
};

export const remarkStripHtmlComments: Plugin = () => {
  return (tree: Node) => {
    visit(tree, "html", (node: Literal, index, parent: Parent | null) => {
      if (
        parent &&
        typeof index === "number" &&
        (node.value as string).startsWith("<!--") &&
        (node.value as string).endsWith("-->")
      ) {
        parent.children.splice(index, 1);
      }
    });
  };
};

export const generateToc = async (markdown: string) => {
  const toc: TocItem[] = [];

  const processor = unified()
    .use(remarkToc, {
      tocRef: toc,
      maxDepth: 4,
    })
    .use(remarkParse)
    .use(remarkStringify);

  await processor.process(markdown);

  return toc;
};

// Prisma language configuration for Prism.js taken from https://github.com/prisma/docs/blob/c72eb087fcf57f3c00d153f86c549ef28b3d0f44/src/components/customMdx/prism/prism-prisma.js
const prisma = (arg: unknown) => {
  const Prism = arg as typeof refractor;
  Prism.languages.prisma = Prism.languages.extend("clike", {
    keyword: /\b(?:datasource|enum|generator|model|type)\b/,
    "type-class-name": /(\b()\s+)[\w.\\]+/,
  });

  Prism.languages.insertBefore("prisma", "function", {
    annotation: {
      pattern: /(^|[^.])@+\w+/,
      lookbehind: true,
      alias: "punctuation",
    },
  });

  Prism.languages.insertBefore("prisma", "punctuation", {
    "type-args": /\b(?:references|fields|onDelete|onUpdate):/,
  });
};
prisma.displayName = "prisma";

refractor.register(prisma);

export const customRehypePrism = rehypePrismGenerator(refractor);
