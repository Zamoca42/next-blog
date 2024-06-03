"use client";

// import markdownStyles from "@/component/markdown-styles.module.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import "github-markdown-css/github-markdown.css";
import { customRehypePrism } from "@/lib/rehype-prism";
// import "prism-theme-night-owl";
import "@/style/rehype-prism.css";
import "@/style/prism.css";

type Props = {
  content: string;
};

export function PostBody({ content }: Props) {
  return (
    <div className="max-w-2xl mx-auto">
      {/* <div
        className={markdownStyles["markdown"]}
        dangerouslySetInnerHTML={{ __html: content }}
      /> */}
      <ReactMarkdown
        className="markdown-body"
        // className={markdownStyles["markdown"]}
        remarkPlugins={[remarkGfm, remarkDirective]}
        rehypePlugins={[
          [
            customRehypePrism,
            {
              showLineNumbers: true,
              ignoreMissing: true,
              defaultLanguage: "txt",
            },
          ],
        ]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
