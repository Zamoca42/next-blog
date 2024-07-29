---
title: "블로그에 검색 적용하기 - Docsearch"
tag:
  - Aloglia
  - Next.js
  - TypeScript
star: true
---

블로그에 검색 기능이 없어서 한글 형태소 지원, 적은 비용, 쉬운 유지보수를 고려한 라이브러리 사용을 고민하다 Typesense와 Aloglia를 알게 되었다.

Algolia는 Vuepress나 공식문서 페이지에서 자주 볼 수 있었는데,
한글 형태소 검색이 지원되고 프리티어로 한달에 요청횟수 10k, 지원 문서 수 100만개까지 적용되어서 사용해봤다.

이번 포스트에서는 Next.js에서 문서 검색을 설정한 과정에서 겪은 일들을 정리하려고한다.

<!-- end -->

## 0. Docsearch는 무엇인가?

![Docsearch 문서 검색 모달창](https://github.com/Zamoca42/next-blog/assets/96982072/39afface-d1b2-4dc2-8f5f-beb0c72079e9)

Algolia의 DocSearch는 웹사이트의 문서 검색 기능을 손쉽게 구현할 수 있는 오픈소스 프로젝트다.  
크롤링 설정을 통해 웹사이트 콘텐츠를 정기적으로 인덱싱하고, Algolia의 검색 엔진을 활용하여 빠른 검색 결과를 제공한다.

## 1. 가입하기

우선 Algolia에 가입 전 Docsearch의 Join the Program을 통해 적용할 URL을 입력하면 계정 생성과 초기 인덱스 설정을 도와준다.

![양식을 작성하면 계정 생성을 도와준다.](https://github.com/Zamoca42/next-blog/assets/96982072/6e4f349a-03d6-403a-96b0-6c467c979398)

양식을 작성하고 보내면 작성한 메일로 가입링크가 도착하고 링크를 통해 가입해서 대시보드에 들어가게 되면 인덱스 설정이 되어있다.

![몇 시간 후 도착한 가입 승인 메일](https://github.com/Zamoca42/next-blog/assets/96982072/a838a7ef-6dd9-4a03-82d1-0a5722b8b1e7)

![계정을 생성한 후 처음 접속하면 이미 인덱스가 만들어져 있다.](https://github.com/Zamoca42/next-blog/assets/96982072/ba2d082f-028b-4dee-ab3d-2e4d28945b27)

## 2. 설치하기

> 공식 문서 - https://docsearch.algolia.com/docs/DocSearch-v3

```bash:설치
npm install @docsearch/react@3
```

```tsx:navbar.tsx
"use client";

import { DocSearch } from "@docsearch/react";
import "@docsearch/css";

type Props = {
  children: ReactNode;
};

export const NavBar = ({ children }: Props) => {
  //...

  return (
    <nav>
      {/* 나머지 생략 */}
      <DocSearch
        appId="YOUR_APP_ID"
        indexName="YOUR_INDEX_NAME"
        apiKey="YOUR_SEARCH_API_KEY"
      />
    </nav>
  );
};
```

공식문서를 보고 navbar에 Docsearch 컴포넌트를 설정해주면 다음은 크롤링 설정이 필요하다.

## 3. Docsearch 인덱싱 설정하기

> 크롤러 설정 페이지 - https://crawler.algolia.com/  
> <br />
> 크롤러 설정 문서 - https://www.algolia.com/doc/tools/crawler/getting-started/overview/

Docsearch의 크롤러는 Cheerio 기반으로 배포된 페이지 전체를 크롤링한 뒤 페이지 정보를 가져와 인덱싱하게 된다.
초기에 설정된 크롤러 설정으로 크롤링 하면 온전한 인덱싱이 이루어지지 않는다.

![크롤러 설정 페이지](https://github.com/Zamoca42/next-blog/assets/96982072/ccff3907-0726-48ca-9301-349da3ecae09)

![포스트의 제목에 메타데이터의 제목이 포함되어 있었다.](https://github.com/Zamoca42/next-blog/assets/96982072/8b578ac7-5435-4877-87b1-3281d30df39f)

![인덱스 페이지를 확인해보면 제목만 설정되었다.](https://github.com/Zamoca42/next-blog/assets/96982072/c13ea438-4b61-40aa-b1d6-e70a387769f1)

### 문제 상황

```javascript:crawler.algolia.com-editor
new Crawler({
  //...
  actions: [
    {
      indexName: "zamoca",
      pathsToMatch: ["https://zamoca.space/**"],
      recordExtractor: ({ helpers }) => {
        const record = helpers.docsearch({
          recordProps: {
            lvl1: ["article h1", "head > title"],
            content: [
              "article p, article li",
              "main p, main li",
              "p, li",
              "article div div",
              "article div .prose p",
            ],
            lvl0: {
              selectors: "",
              defaultValue: "Documentation",
            },
            lvl2: ["article div div h2", "main h2", "h2"],
            lvl3: ["article div div h3", "main h3", "h3"],
            lvl4: ["article div div h4", "main h4", "h4"],
            lvl5: ["article div div h5", "main h5", "h5"],
            lvl6: ["article div div h6", "main h6", "h6"],
          },
          aggregateContent: true,
          recordVersion: "v3",
        });

        return record;
      },
    },
  ],
});
```

크롤러 설정을 보면 html 태그를 찾아서 인덱싱에 추가하고 있다.
하지만 테스트 도구로 페이지를 요청하게 되면 크롤링에 필요한 html 태그는 보이지 않는다.

![html태그 대신 `self.__next_f.push()`가 포함된다.](https://github.com/Zamoca42/next-blog/assets/96982072/36a3c4d7-f12e-4210-861d-aaeb8d5a710b)

`self.__next_f.push()`는 RSC(React Server Component)가 JSON 형태로 클라이언트에 전달하기 전인 초기 데이터다.

즉, 서버컴포넌트의 비중이 높을 수록 이 script 태그에 포함된 데이터는 늘어나고 크롤러에는 사용하기가 어려워진다.

> 관련 링크 - https://github.com/vercel/next.js/discussions/42170#discussioncomment-8880248

여기서 서버컴포넌트의 Payload(JSON 데이터) 크롤러로 파싱하는 것보다는 빌드 시에 직접 인덱싱 데이터를 넣는 스크립트를 작성하는게 더 쉬울거같다고 판단했다.

### 스크립트 작성

크롤링에 사용한 API Key들은 초기 가입할 때 제공되지만, 권한 설정이 불가능해 객체를 직접 추가하거나 수정하는게 불가능하다.

![초기 가입한 API Key와 권한 설정에서 차이가 있다.](https://github.com/Zamoca42/next-blog/assets/96982072/9c1e085a-bf95-4ecf-a6ea-ff0fddcf4d5e)

그래서 새로 API Key를 만들어서 인덱싱 데이터를 추가할 생각으로 크롤러에 사용된 인덱스의 설정들을 내보냈다.

![JSON 파일로 설정을 내보내고 가져올 수 있다.](https://github.com/Zamoca42/next-blog/assets/96982072/791b907d-d371-46cf-b983-b60e65017ff2)

새로 만든 API Key에 내보내기했던 인덱스의 설정을 넣어주고, 스크립트를 작성했다.

```bash
npm install algoliasearch
```

```javascript:script/algolia-index.js {28-40}
// @ts-check

//...

/**
 * @typedef {Object} PostSearchIndex
 * @property {string} objectID
 * @property {string} url
 * @property {{lvl0: string, lvl1: string, lvl2: string, lvl3: string[]}} hierarchy
 * @property {string} type
 * @property {string | null} content
 * @property {string[]} tags
 */

/**
 * @param {string} filePath
 * @param {number} index
 * @returns {Promise<PostSearchIndex>}
 */
const createPostRecord = async (filePath, index) => {
  const slug = getSlugFromFilePath(filePath);
  const fileContents = await fs.readFile(filePath, "utf8");
  const { data, excerpt } = matter(fileContents, {
    excerpt: true,
    excerpt_separator: "<!-- end -->",
  });

  return {
    objectID: `${index}-https://zamoca.space/post${slug}`,
    url: `https://zamoca.space/post${slug}`,
    hierarchy: {
      lvl0: "Documentation",
      lvl1: data.title,
      lvl2: data.description || null,
      lvl3: data.tag || []
    },
    type: 'lvl1',
    content: excerpt || null,
    tags: data.tag
  };
};

//...

export const updateAlgoliaIndex = async () => {
  try {
    const posts = await getAllPosts();
    const index = client.initIndex(ALGOLIA_INDEX_NAME);
    await index.replaceAllObjects(posts);
    console.log(
      `Algolia index updated successfully`
    );
  } catch (error) {
    console.error("Error updating Algolia index:");
    console.error(JSON.stringify(error, null, 2));
  }
```

타이틀, 설명, 태그, 내용 등이 검색에 포함될 수 있게 설정했다.

```javascript:next.config.js {18-20}
// @ts-check
import { PHASE_PRODUCTION_BUILD } from "next/constants.js";
import { updateAlgoliaIndex } from "./src/script/algolia-index.js";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

/**
 * @typedef {import('next').NextConfig} NextConfig
 */
/**
 * @param {string} phase
 * @returns {Promise<NextConfig>}
 */
export default async (phase) => {
  if (phase === PHASE_PRODUCTION_BUILD && process.env.VERCEL_ENV === "production") {
    await updateAlgoliaIndex();
  }

  /** @type {NextConfig} */
  const nextConfig = {
    //...
  };

  return withBundleAnalyzer(nextConfig);
};
```

Vercel에 배포될 때 인덱스를 업데이트하도록 설정했다.

![인덱스 페이지에 Attributes들이 들어간 것을 확인](https://github.com/Zamoca42/next-blog/assets/96982072/d8702f87-a5c1-4a4b-a920-3f62d547d596)

![검색 결과에 제목과 내용이 포함된다.](https://github.com/Zamoca42/next-blog/assets/96982072/8179246a-9a4f-41df-9264-16cd6afdd26a)

## 번외

DocSearch 컴포넌트 스타일은 Docsearch의 css 변수를 tailwind의 css 설정에서 오버라이드 해 현재 블로그 테마에 맞춰 변경했다.

```css:global.css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 124 38.7% 78.2%;
    --primary-foreground: 126 37.2% 69.4%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 215.4 16.3% 46.9%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 210 0% 50%;

    --accent: 210 40% 95%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;

    --radius: 0.5rem;

    /* DocSearch 변수 오버라이드 */
    --docsearch-primary-color: hsl(var(--primary-foreground));
    --docsearch-text-color: hsl(var(--foreground));
    --docsearch-spacing: 12px;
    --docsearch-icon-stroke-width: 1.4;
    --docsearch-highlight-color: hsl(var(--primary-foreground));
    --docsearch-muted-color: hsl(var(--muted-foreground));
    --docsearch-container-background: hsl(var(--background) / 80%);
    --docsearch-logo-color: hsl(var(--primary-foreground));
    --docsearch-modal-width: 560px;
    --docsearch-modal-height: 600px;
    --docsearch-modal-background: hsl(var(--background));
    --docsearch-modal-shadow: 0 3px 8px 0 hsl(var(--foreground) / 30%);
    --docsearch-searchbox-height: 56px;
    --docsearch-searchbox-background: hsl(var(--muted));
    --docsearch-searchbox-focus-background: hsl(var(--accent));
    --docsearch-searchbox-shadow: inset 0 0 0 2px hsl(var(--primary-foreground));
    --docsearch-hit-height: 56px;
    --docsearch-hit-color: hsl(var(--foreground));
    --docsearch-hit-active-color: hsl(var(--background));
    --docsearch-hit-background: hsl(var(--background));
    --docsearch-hit-shadow: 0 1px 3px 0 hsl(var(--muted) / 50%);
    --docsearch-key-gradient: linear-gradient(-225deg, hsl(var(--muted)), hsl(var(--background)));
    --docsearch-key-shadow: inset 0 -2px 0 0 hsl(var(--muted)), inset 0 0 1px 1px hsl(var(--background)), 0 1px 2px 1px hsl(var(--foreground) / 10%);
    --docsearch-footer-height: 44px;
    --docsearch-footer-background: hsl(var(--background));
    --docsearch-footer-shadow: 0 -1px 0 0 hsl(var(--border)), 0 -3px 6px 0 hsl(var(--muted) / 20%);
  }
}
```
