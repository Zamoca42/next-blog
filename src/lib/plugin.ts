import gfm from "remark-gfm";
import remarkDirective from "remark-directive";
import customRehypePrism from "@/lib/rehype-prism";
import remarkToc from "remark-flexible-toc";
import remarkCodeTitles from "remark-flexible-code-titles";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkStringify from "remark-stringify";
import { PluggableList } from "unified";
import remarkUnwrapImages from "remark-unwrap-images";
import emoji from "remark-emoji";

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

export { remarkPlugins, rehypePlugins };
