"use client";

import "@/style/prism.css";
import Markdown from "react-markdown";
import CodeTitle from "@/component/md/code-title";
import CodeBlock from "@/component/md/code-block";
import ImageInPost from "@/component/md/image-in-post";
//markdown-plugin
import gfm from "remark-gfm";
import remarkDirective from "remark-directive";
import customRehypePrism from "@/lib/rehype-prism";
import remarkCodeTitles from "remark-flexible-code-titles";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import rehypeSlug from "rehype-slug";
import { PluggableList } from "unified";
import remarkUnwrapImages from "remark-unwrap-images";
import emoji from "remark-emoji";

type Props = {
  content: string;
};

export function PostBody({ content }: Props) {
  const remarkPlugins: PluggableList = [
    gfm,
    emoji,
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
    remarkDirective,
    remarkUnwrapImages,
    remarkParse,
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
    rehypeSlug,
  ];

  return (
    <div className="mb-12">
      <Markdown
        skipHtml
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        className="prose max-w-3xl"
        components={{
          pre: (props) => <CodeBlock {...props} />,
          div: (props) => <CodeTitle {...props} />,
          img: (props) => <ImageInPost {...props} />,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
