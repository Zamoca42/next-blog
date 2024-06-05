import { unified } from "unified";
import remarkToc, { TocItem } from "remark-flexible-toc";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";

export async function generateToc(markdown: string) {
  const toc: TocItem[] = [];

  const processor = unified()
    .use(remarkToc, {
      tocRef: toc,
    })
    .use(remarkParse)
    .use(remarkStringify);

  await processor.process(markdown);

  return toc;
}
