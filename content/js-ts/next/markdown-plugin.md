---
title: "마크다운 플러그인 세팅"
description: "마크다운 플러그인인 remark, rehype와 react-markdown에 대해 알아보자"
tag:
  - Next.js
  - React
  - Markdown
star: false
---

정적 블로그를 만들 때 마크다운 파일을 사용하는 경우, 단순히 `<div>` 태그와 `dangerouslySetInnerHTML` 속성으로 정적 콘텐츠를 삽입할 수 있다.

하지만 이 방법으로는 추가적인 커스터마이징이 어렵다.

이를 해결하기 위해 `next-mdx-remote`와 같은 라이브러리와 `remark` 같은 플러그인을 사용하면 HTML 코드를 원하는 대로 수정할 수 있다.

Next.js 공식 문서에서는 MDX를 이용한 정적 블로그 예시를 제공하고 있다.
하지만 이미 마크다운 형식으로 포스트를 작성해왔기 때문에 MDX로 변환할 필요성을 느끼지 못했다. `next-mdx-remote`에서 옵션으로 `.md` format을 지원하지만
설정하는 방법이 직관적이라는 생각이 들지 않아서 [react-markdown](https://github.com/remarkjs/react-markdown)
을 사용하기로 결정했다.

<!-- end -->

## 사용법

### 설치

```bash
npm install react-markdown
```

### 설정

[remark plugins](https://github.com/remarkjs/remark)과 [rehype plugins](https://github.com/rehypejs/rehype)
를 활용해서 다양한 기능을 추가할 수 있고,
components props를 이용해서 마크다운에서 파싱된 HTML 태그를 커스텀할 수 있다.
remark는 주로 마크다운을 HTML로 파싱하는 기능을 담당하고, rehype는 파싱된 HTML을 커스텀하는 기능을 담당한다.

```tsx:component/post/markdown-body.tsx
import Markdown, { Components } from "react-markdown";
import { PluggableList } from "unified";

type Props = {
  content: string;
  remarkPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
};

export function MarkdownBody({
  content,
  remarkPlugins = [],
  rehypePlugins = [],
}: Props) {
  return (
    <Markdown
      skipHtml
      remarkPlugins={[...remarkPlugins]}
      rehypePlugins={[...rehypePlugins]}
      className="prose"
    >
      {content}
    </Markdown>
  );
}
```

## 필수 플러그인

마크다운 문법을 HTML로 바꾸기 위해 사용한 필수적인 플러그인들을 정리했다.
빌드 시에만 패키지를 사용하므로 devDependencies에 패키지를 설치했다.

```bash
npm install -D remark-gfm remark-emoji remark-flexible-code-titles rehype-prism-plus
```

### gfm, emoji

remark-gfm (GitHub Flavored Markdown)은 GitHub에서 사용하는 확장된 마크다운 문법을 지원하기 떄문에 필수로 사용하고,
다음과 같은 마크다운 문법을 HTML로 변환한다.

- 테이블 작성
- 작업 목록 (체크박스)
- 취소선
- 자동 링크 변환
- 각주
- 코드 블럭

remark-emoji는 마크다운 텍스트 내의 이모지 단축코드를 실제 이모지로 변환해준다.
예를 들어, `:smile:`과 같은 코드를 😄 이모지로 바꿔주는 역할을 한다.

### prism-plus, flexible-code-titles

rehype-prism-plus는 prism 기반으로 변환된 코드블럭을 언어에 맞게 변환하는 역할을 하는데,
plus에서는 코드라인에 강조 등 다양한 기능이 있다.

또한 generator와 `refractor` 라이브러리로 커스텀 언어를 설정할 수 있다.

```typescript:unifed-plugin.ts {1-2}
import { refractor } from "refractor/lib/all.js";
import rehypePrismGenerator from "rehype-prism-plus/generator";

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
```

remark-flexible-code-titles는 코드블럭 컨테이너를 변경할 수 있다.
코드블럭에 해당하는 HTML 태그에 props를 추가해 커스텀하기 편리하다.

```tsx:markdown-body.tsx
import clsx from "clsx";
import { ClassAttributes, HTMLAttributes } from "react";
import { ExtraProps } from "react-markdown";
import remarkCodeTitles from "remark-flexible-code-titles";

export function MarkdownBody({
  content,
  remarkPlugins = [],
  rehypePlugins = [],
}: Props) {
  return (
    <Markdown
      skipHtml
      remarkPlugins={[
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
        ...rehypePlugins,
      ]}
      components={
        {
          pre: (props) => <CodeBlock {...props} />,
        } as Components
      }
    >
      {content}
    </Markdown>
  );
}

type CodeBlockProps = ClassAttributes<HTMLPreElement> &
  HTMLAttributes<HTMLPreElement> &
  ExtraProps;

const CodeBlock: React.FC<CodeBlockProps> = (props) => {
  const { node, className, children, ...rest } = props;
  const match = className?.startsWith("language-");

  return match ? (
    <pre className={clsx(className, "scrollbar-hide")} {...rest}>
      {children}
    </pre>
  ) : (
    <pre className={className} {...rest}>
      {children}
    </pre>
  );
};

```

## 권장 플러그인

필수는 아니지만 사용하기 편리했던 플러그인을 정리했다.

```bash
npm install -D remark-flexible-toc
```

### flexible-toc

remark-flexible-toc는 마크다운 문서의 목차(Table of Contents, TOC)를 파싱하는 플러그인으로  
목차에 대한 데이터를 객체로 직접 접근할 수 있어서 remark-toc보다 사용하기 편리했다.

```tsx:app/[...slug]/page.tsx {34, 45}
import remarkToc, { TocItem } from "remark-flexible-toc";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";

export const generateToc = (markdown: string) => {
  const toc: TocItem[] = [];

  const processor = unified()
    .use(remarkToc, {
      tocRef: toc,
      maxDepth: 2,
    })
    .use(remarkParse)
    .use(remarkStringify);

  processor.processSync(markdown);

  return toc;
};

export default async function PostDetail({ params }: PostSlugParams) {
  if (!params.slug || params.slug.length === 0) {
    notFound();
  }

  const postSlug = params.slug.join("/");
  const postBranch = params.slug[0];
  const post = await getPostBySlug(postSlug);

  if (!post) {
    return notFound();
  }

  const toc = generateToc(post.content);

  return (
    <>
      <div >
        <article className="my-10 px-1">
          <MarkdownBody content={post.content} />
        </article>
      </div>
      {toc.length !== 0 && (
        <aside>
          <PostToc toc={toc} />
        </aside>
      )}
    </>
  );
}
```

## 커스텀 플러그인

때로는 기존 플러그인으로 충족되지 않는 특정 요구사항이 있을 수 있다.
이런 경우 직접 커스텀 플러그인을 만들어 사용할 수 있다.  
커스텀 플러그인을 만들기 위해 필요한 패키지들을 먼저 설치해야한다.

```bash
npm install -D unist-util-visit unified unist
```

### remove-headings

removeHeadings는 블로그 홈에서 포스트의 preview를 보여줄 때 `##`과 같은 소제목들을 보이지 않게 처리하기 위해 작성했다.
커스텀 플러그인을 작성하고 remarkPlugins에 추가하면된다.

해당 예시는 문서의 구문 트리를 순회하면서 모든 `heading`에 해당하는 노드를 찾아 제거한다.

```typescript:unified-plugin.ts
import { visit } from "unist-util-visit";
import { Node, Parent } from "unist";
import { unified, Plugin } from "unified";

export const removeHeadings: Plugin = () => {
  return (tree: Node) => {
    visit(tree, "heading", (node, index, parent: Parent | null) => {
      if (parent && typeof index === "number") {
        parent.children.splice(index, 1);
      }
    });
  };
};

// post-preview.tsx
// <MarkdownBody content={excerpt} remarkPlugins={[removeHeadings]} />
```
