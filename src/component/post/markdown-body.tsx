"use client";

import "@/style/prism.css";
import Markdown from "react-markdown";
import CodeTitle from "@/component/md/code-title";
import CodeBlock from "@/component/md/code-block";
import ImageInPost from "@/component/md/image-in-post";
import { PluggableList } from "unified";
//markdown-plugin
import gfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkCodeTitles from "remark-flexible-code-titles";
import rehypeSlug from "rehype-slug";
import remarkUnwrapImages from "remark-unwrap-images";
import emoji from "remark-emoji";
import { customRehypePrism, removeHeadings } from "@/lib/unified-plugin";

type Props = {
  content: string;
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
};

export const previewPlugins: PluggableList = [removeHeadings];

export function MarkdownBody({
  content,
  remarkPlugins = [],
  rehypePlugins = [],
}: Props) {
  return (
    <Markdown
      skipHtml
      remarkPlugins={[
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
        ...remarkPlugins,
      ]}
      rehypePlugins={[
        [
          customRehypePrism,
          {
            showLineNumbers: true,
            ignoreMissing: true,
            defaultLanguage: "txt",
          },
        ],
        rehypeSlug,
        ...rehypePlugins,
      ]}
      className="prose max-w-3xl"
      components={{
        pre: (props) => <CodeBlock {...props} />,
        div: (props) => <CodeTitle {...props} />,
        img: (props) => <ImageInPost {...props} />,
      }}
    >
      {content}
    </Markdown>
  );
}
