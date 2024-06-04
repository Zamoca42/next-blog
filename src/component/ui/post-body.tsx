"use client";

import "@/style/markdown-body.css";
import "@/style/prism.css";
import Markdown from "react-markdown";
import gfm from "remark-gfm";
import remarkDirective from "remark-directive";
import customRehypePrism from "@/lib/rehype-prism";
import remarkToc from "remark-flexible-toc";
import remarkCodeTitles from "remark-flexible-code-titles";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkStringify from "remark-stringify";
import { PluggableList } from "unified";
import CodeTitle from "@/component/md/code-title";
import CodeBlock from "../md/code-block";

type Props = {
  content: string;
};

export function PostBody({ content }: Props) {
  const remarkPlugins: PluggableList = [
    gfm,
    remarkDirective,
    [
      remarkCodeTitles,
      {
        title: false,
        containerProperties: (language: string, title: string) => ({
          ["data-language"]: language,
          title,
        }),
      },
    ],
    remarkToc,
    remarkParse,
    remarkRehype,
    remarkStringify,
  ];
  const rehypePlugins: PluggableList = [
    [
      customRehypePrism,
      {
        showLineNumbers: true,
        ignoreMissing: true,
        defaultLanguage: "txt",
      },
    ],
  ];
  return (
    <div className="markdown-body">
      <Markdown
        className="markdown-body"
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={{
          pre: (props) => <CodeBlock {...props} />,
          div: (props) => <CodeTitle {...props} />,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
