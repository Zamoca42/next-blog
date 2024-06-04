"use client";

import "@/style/markdown-body.css";
import "@/style/prism.css";
import Markdown from "react-markdown";
import CodeTitle from "@/component/md/code-title";
import CodeBlock from "../md/code-block";
import React from "react";
import ImageInPost from "../md/image-in-post";
import { rehypePlugins, remarkPlugins } from "@/lib/plugin";

type Props = {
  content: string;
};

export function PostBody({ content }: Props) {
  return (
    <div className="markdown-body">
      <Markdown
        className="markdown-body"
        unwrapDisallowed
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={{
          // p: (props) => <>{props.children}</>,
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
