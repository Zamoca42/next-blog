---
title: "Next.js - SEO와 검색엔진 등록"
description: ""
tag:
  - SEO
  - Next.js
star: true
---

구글과 네이버 같은 검색엔진은 크롤링 봇이 있는데 크롤링 봇이 웹사이트와 웹페이지를 수집하고 등록시켜 검색하는 유저에게 노출한다.
SEO(Search Engine Optimization)는 검색엔진 크롤링 봇에게 내 웹페이지를 수집하기 쉽도록 개선하는 작업을 말한다.  
SEO를 직접 제공하는 블로그 서비스를 이용하는 것이 아닌 이상 자동으로 검색엔진에 등록되는일은 없으므로 SEO를 위한 작업이 필요하다.

Next.js 14버전의 App router를 기준으로 진행한 SEO 작업들을 정리하려고 한다.

<!-- end -->

## 사이트맵

사이트맵은 검색엔진에게 사이트의 구조를 알려줘서 크롤링을 효율적으로 할 수 있게 도와주는 역할이다.
사이트맵을 생성하는 방법은 정적파일로 직접 `sitemap.xml`을 생성해도 되지만,
Next.js에서는 app 폴더 아래에 `sitemap.ts`로 사이트맵 생성이 가능하다.

```ts:app/sitemap.ts
import { MetadataRoute } from "next";
import { getAllPosts } from "@/app/api/action";
import { blogConfig } from "@/blog-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const { host } = blogConfig;

  const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${host}/post/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: host,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...postUrls,
  ];
}
```

이런식으로 타입스크립트 코드로 작성이 가능하고 빌드 시 사이트맵이 생성된다.

```bash {27}
❯ npm run build

> build
> next build

  ▲ Next.js 14.2.4
  - Environments: .env

   Creating an optimized production build ...
 ✓ Compiled successfully
 ✓ Linting and checking validity of types
 ✓ Collecting page data
 ✓ Generating static pages (102/102)
 ✓ Collecting build traces
 ✓ Finalizing page optimization

Route (app)                                   Size     First Load JS
┌ ○ /                                         322 kB          428 kB
├ ○ /_not-found                               875 B            88 kB
├ ƒ /api/graphql                              0 B                0 B
├ ● /post/[...slug]                           15 kB           121 kB
├   ├ /post/js-ts/next/seo
├   ├ /post/etc/retrospect/next-blog-migrate
├   ├ /post/js-ts/next/blog-docsearch
├   └ [+92 more paths]
├ ○ /robots.txt                               0 B                0 B
└ ○ /sitemap.xml                              0 B                0 B
+ First Load JS shared by all                 87.1 kB
  ├ chunks/23-82edc845494e8f8f.js             31.5 kB
  ├ chunks/fd9d1056-82fc2a82826c61b9.js       53.7 kB
  └ other shared chunks (total)               1.93 kB


○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses getStaticProps)
ƒ  (Dynamic)  server-rendered on demand
```

배포한 url 뒤에 sitemap.xml로 요청을 보내면 사이트맵 페이지로 이동한다.

```xml:https://zamoca.space/sitemap.xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://zamoca.space</loc>
    <lastmod>2024-07-23T19:12:16.454Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1</priority>
  </url>
  <url>
    <loc>https://zamoca.space/post/etc/retrospect/next-blog-migrate</loc>
    <lastmod>2024-07-21T17:56:21+09:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://zamoca.space/post/js-ts/next/blog-docsearch</loc>
    <lastmod>2024-07-02T18:41:22+09:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
```

## robots.txt

robots.txt는 검색 엔진이 어디까지 접근 가능한지 허용여부를 설정하는 기능이다.
`robots.txt`를 직접 만들어서 배포할 수 있고 타입스크립트 파일로도 작성가능하다.

```ts:app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://zamoca.space/sitemap.xml",
  };
}
```

만약 크롤링을 원하지 않는 페이지가 있다면 disallow를 설정하면 된다.

## RSS(Really Simple Syndication)

RSS는 사이트맵과 비슷하게 xml 기반으로 웹사이트의 콘텐츠를 손쉽게 구독할 수 있게 해주는 기술이다.
사용자는 Feedly나 RSS 리더로 여러 사이트의 RSS를 통해 업데이트되는 글들을 바로 확인할 수 있다.

SEO 최적화 관점에서는 RSS를 통해 사이트의 컨텐츠가 새롭게 업데이트되는 것을 검색 엔진이 자동으로 감지할 수 있고
RSS를 통해 제공되는 내용이 많을수록 검색 엔진이 해당 사이트를 더 높은 순위로 평가할 가능성이 높아진다.

Next.js에서 직접 제공하는 기능은 없어 [feed](https://github.com/jpmonette/feed) 라이브러리를 사용했다.
타입스크립트 기반으로 구현된 라이브러리이며 RSS, Atom, JSON Feed 모두 생성할 수 있다.

```bash
npm install feed
```

```js:script/generate-rss.js
//@ts-check

import { Feed } from "feed";
import fs from "fs/promises";

import { blogConfig } from "../blog-config.js";
import { postIndexPath } from "../lib/meta-util.js";

const master = {
  name: blogConfig.author.name,
  email: blogConfig.author.email,
  link: blogConfig.host,
};

const feed = new Feed({
  title: blogConfig.name,
  description: blogConfig.description,
  id: blogConfig.host,
  link: blogConfig.host,
  language: "ko",
  image: `${blogConfig.host}/android-chrome-512x512.png`,
  favicon: `${blogConfig.host}/favicon.ico`,
  copyright: `All rights reserved since 2024, ${master.name}`,
  generator: "generate-rss",
  feedLinks: {
    json: `${blogConfig.host}/json`,
    atom: `${blogConfig.host}/atom`,
  },
  author: master,
});

export const generateRssFeed = async () => {
  const rssXmlPath = "public/rss.xml";
  const rssAtomPath = "public/rss-atom.xml";
  const feedJsonPath = "public/feed.json";

  /** @type {Record<string, import("./post-index.js").PostMetadata>} */
  const postIndex = JSON.parse(await fs.readFile(postIndexPath, "utf-8"));

  Object.entries(postIndex).forEach(([slug, post]) => {
    feed.addItem({
      title: post.title,
      id: slug,
      link: `${blogConfig.host}/${slug}`,
      description: post.description,
      content: post.excerpt,
      author: [master],
      contributor: [master],
      date: new Date(post.createdAt),
      category: post.tags.map((tag) => ({ name: tag })),
    });
  });

  await Promise.all([
    fs.writeFile(rssXmlPath, feed.rss2(), "utf-8"),
    fs.writeFile(rssAtomPath, feed.atom1(), "utf-8"),
    fs.writeFile(feedJsonPath, feed.json1(), "utf-8")
  ]);

  console.log("RSS feeds generated successfully");
}
```

빌드나 개발 환경 실행 시 파일을 생성하게 `next.config.js`에 추가했다.

```js:next.config.mjs {16}
// @ts-check
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants.js";
import { savePostMetadata } from "./src/script/post-index.js";
import { generateRssFeed } from "./src/script/generate-rss.js";

/**
 * @typedef {import('next').NextConfig} NextConfig
 */
/**
 * @param {string} phase
 * @returns {Promise<NextConfig>}
 */
export default async (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
      await savePostMetadata();
      await generateRssFeed();
  }

  /** @type {NextConfig} */
  const nextConfig = {
    // config...
  };

  return withBundleAnalyzer(nextConfig);
};
```

## 메타 태그

메타 태그는 웹페이지에 대한 정보를 제공하는 기능을 하고 있다.
그러한 정보를 메타 데이터라고 부르고 검색 엔진이나 웹 크롤러를 통해 수집되는데,
Next.js에서는 Root Layout에 head 태그에 설정하고 `generateMetadata`을 통해 정적페이지에 메타 태그를 설정할 수 있다.

앞서 설정한 RSS와 블로그 포스트에 대한 메타 태그를 설정해주어야한다.

### RSS link 태그 설정

```tsx:app/layout.tsx
import { CMS_NAME, HOME_OG_IMAGE_URL } from "@/lib/constant";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/style/globals.css";
import { blogConfig } from "@/blog-config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${blogConfig.name} | Blog with ${CMS_NAME}`,
  description: blogConfig.description,
  openGraph: {
    images: [HOME_OG_IMAGE_URL],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link
          rel="alternate"
          type="application/rss+xml"
          href="/rss.xml"
          title={`RSS Feed for ${blogConfig.name}`}
        />
        <link
          rel="alternate"
          type="application/atom+xml"
          href="/rss-atom.xml"
          title={`Atom Feed for ${blogConfig.name}`}
        />
        <link
          rel="alternate"
          type="application/json"
          href="/feed.json"
          title={`JSON Feed for ${blogConfig.name}`}
        />
      </head>
      {/* body는 생략 */}
    </html>
  );
}
```

### 블로그 포스트 메타 태그

```ts:app/post/[...slug]/page.tsx
export const generateMetadata = async ({
  params,
}: PostSlugParams): Promise<Metadata> => {
  const postSlug = params.slug?.join("/");
  const post = await getPostBySlug(postSlug);
  const { host, name: applicationName } = blogConfig;

  const title = post.title;
  const description = post.description || post.excerpt;

  return {
    metadataBase: new URL(host),
    title,
    description,
    applicationName,
    generator: "Next.js",
    openGraph: {
      title,
      description,
      url: `${host}/post/${postSlug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/favicon/android-chrome-512x512.png"],
    },
  };
};
```

## 구글 서치 콘솔 색인 생성

[구글 서치 콘솔](https://search.google.com/search-console)은 구글에서 사이트맵과 색인 생성을 관리하고 모니터링 할 수 있는 도구로
지금은 웹마스터도구라는 이름으로 변경했다.

사이트맵을 등록하고 구글 크롤링 봇이 알아서 크롤링 시작하기까지 시간이 걸린다.  
그래서 수동으로 URL 검사를 통해 하루 안에 검색 엔진에 등록 가능하다.

![1. url 검사 탭에서 url을 입력해 색인 생성 여부를 확인](https://github.com/user-attachments/assets/66e41257-11d8-4d93-a243-78ef1ac0fdbe)

![2. 실제 url 테스트로 색인이 생성 가능한지 확인](https://github.com/user-attachments/assets/fc1861a6-8235-44d2-b06e-ad7cadf00952)

![3. 색인 요청으로 크롤링 대기열에 등록](https://github.com/user-attachments/assets/1756c578-ad37-4ff7-bb41-eebf71811bee)

![하루에 요청 횟수에 제한이 있다.](https://github.com/user-attachments/assets/ef67d613-83b9-471b-aae9-28a26e9c6e38)

![색인 생성이 완료되면 구글에서 검색이 가능하다.](https://github.com/user-attachments/assets/75abc458-27ac-46a6-b13c-1d85b8e5e3b2)
