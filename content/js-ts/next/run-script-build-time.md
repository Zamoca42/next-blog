---
title: "Next.js - 빌드 타임에 스크립트를 실행하는 방법"
description: "What's the recommended way to run a script at build time?"
tag:
  - Next.js
  - Node
  - Script
star: true
date: "2024-06-13"
---

마크다운 컨텐츠를 활용한 블로그를 만들면서 포스트의 생성일과 수정일을 커밋 날짜를 기준으로 블로그에 보여주려고 했다.

git 명령어를 [node.js의 child_process](https://www.freecodecamp.org/korean/news/node-js-child-processes-everything-you-need-to-know-e69498fe970a/)
로 실행하면서 개발서버에서는 이상없이 돌아갔으나...

Vercel에 배포 할때는 `.git` 레포지토리가 포함되지 않기 때문에 git 명령어를 사용할 수 없다고 한다.

![vercel command failed](https://github.com/Zamoca42/blog/assets/96982072/4cdbfb40-d459-424a-966b-4794e5b13f90)

<!-- end -->

> 관련 질문: https://github.com/vercel/vercel/discussions/4101

그렇다면 빌드 시에 스크립트를 실행해서 git log 내용을 저장한채로 배포하면 되지않을까라는 생각으로
js로 스크립트를 작성했고, 시도해본 방법들을 포스트로 정리했다.

## 작성할 스크립트들

```js:포스트를_탐색 {12-15, 32-34}
/**
 * @typedef {Object} GitDates
 * @property {string | null} createdAt
 * @property {string | null} updatedAt
 */

/**
 * @param {string} filePath
 * @returns {Promise<GitDates>}
 */
async function getGitDates(filePath) {
  const createdAtCommand = `git log --diff-filter=A --follow --format=%aI --reverse -- "${filePath}"`;
  // 포스트의 최초 커밋 날짜
  const updatedAtCommand = `git log -1 --format=%aI -- "${filePath}"`;
  // 포스트의 최근 커밋 날짜

  /**
   * @param {string} command
   * @returns {Promise<string | null>}
   */
  const gitLogFileDate = async (command) => {
    const outputDate = await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout.trim());
        }
      });
    });

    if (!outputDate) { //포스트가 작성은 되어있지만 커밋기록은 없을 떄
      return null;
    }

    return formatISO(new Date(outputDate));
  };

  const [createdAt, updatedAt] = await Promise.all([
    gitLogFileDate(createdAtCommand),
    gitLogFileDate(updatedAtCommand),
  ]);

  return { createdAt, updatedAt };
}
```

```js:포스트_기록을_json으로_저장

/**
 * @typedef {Object} GitInfo
 * @property {string | null} createdAt
 * @property {string | null} updatedAt
 */
async function saveGitInfo() {
  try {
    await fs.access(gitInfoPath);
  } catch {
    console.log("Git information cannot access.");

    /** @type {Record<string, GitInfo>} */
    const gitInfo = {};
    const baseDirectory = process.cwd();

    const fileNames = await fs.readdir(postsDirectory, { recursive: true });

    for (const fileName of fileNames) {
      if (fileName.endsWith(".md")) {
        const filePath = path.join(postsDirectory, fileName);
        const {createdAt, updatedAt} = await getGitDates(filePath);

        if (createdAt === null) continue;

        const relativePath = path.relative(baseDirectory, filePath);
        gitInfo[relativePath] = { createdAt, updatedAt };
      }
    }

    fs.writeFile(gitInfoPath, JSON.stringify(gitInfo, null, 2)); //json 파일로 저장
    console.log(`Git information saved to ${GIT_HSITORY_FILE_NAME}`);
  }
}
```

## 가장 간단한 방법

> https://github.com/vercel/next.js/discussions/17479

가장 간단한 방법으로는 package.json에서 build 명령어에 `node` 명령어로 실행시키는 것이다

```diff-json:package.json {5}
{
  "private": true,
  "scripts": {
    "dev": "next",
+   "build": "node log-script.js && next build",
    "start": "next start",
  },
  //...
}
```

`vercel build`로 vercel용 빌드 명령어가 실행될 때마다 git command가 실패한다고 뜰 것이기 때문에 이 방법은 나한테는 맞지 않는 방법이다.

![로컬에서 `npm run build`시 오류가 발생했다.](https://github.com/Zamoca42/blog/assets/96982072/9c69ab89-16d8-4cef-a04d-fb6478d51803)

## next.config.js에서 조건부 실행

다른 방법으로는 next.config.js에서 함수를 불러와 조건부로 실행할 수 있다.

```js:next.config.js {16}
// @ts-check
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } = require('next/constants');
const { saveGitInfo } = require("./src/script/log-script");
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/**
 * @typedef {import('next').NextConfig} NextConfig
 */
/**
 * @param {string} phase
 * @returns {Promise<NextConfig>}
 */
module.exports = async (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    await saveGitInfo();
  }

  /** @type {NextConfig} */
  const nextConfig = {
    //...
  };

  return withBundleAnalyzer(nextConfig);
};
```

`PHASE_PRODUCTION_SERVER`와 `PHASE_DEVELOPMENT_SERVER`는 빌드타임으로 넘어가기 전과 개발 서버시작 시를 조건부로 설정할 수 있다.

```js:next/constants
export declare const PHASE_PRODUCTION_SERVER = "phase-production-server";
export declare const PHASE_DEVELOPMENT_SERVER = "phase-development-server";
```

### 결과

```bash:터미널에서_명령어를_실행
npm run dev # 개발서버 실행

> dev
> next

Git information cannot access.
Git information saved to post-history.json # 명령어가 실행되었다.

  ▲ Next.js 14.2.3
  - Local:        http://localhost:3000

 ✓ Starting...
 ✓ Ready in 1577ms

npm run build  # 빌드 실행

> build
> next build

Git information cannot access.
Git information saved to post-history.json # 명령어가 실행되었다.

  ▲ Next.js 14.2.3

   Creating an optimized production build ...

  # 나머지는 생략

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses getStaticProps)
ƒ  (Dynamic)  server-rendered on demand
```

```json:post-history.json
{
  "content/js-ts/date-fns.md": {
    "createdAt": "2024-06-01T22:52:31+09:00",
    "updatedAt": "2024-06-12T01:31:44+09:00"
  },
  "content/js-ts/next/hot-reload.md": {
    "createdAt": "2024-06-12T20:26:42+09:00",
    "updatedAt": "2024-06-14T00:33:33+09:00"
  },
  "content/js-ts/next/prisma-token-schema-error.md": {
    "createdAt": "2024-06-14T00:33:33+09:00",
    "updatedAt": "2024-06-14T00:33:33+09:00"
  },
  //...
}
```

![블로그에서도 이상없이 날짜가 출력된다.](https://github.com/Zamoca42/blog/assets/96982072/3c91e0f1-490a-4063-9cd3-9d13ffeafffa)

## 아쉬운점

한가지 아쉬운점은 Next.js의 config파일이 typescript형식은 지원하지 않기 때문에 ts 확장자의 파일은 import 할 수 없다.
아쉬운대로 //@ts-check를 사용하고 나머지 스크립트들도 js로 작성할 수 밖에 없었다.

> https://github.com/vercel/next.js/pull/57656

하지만 설정파일을 typescript로 개발하는 중인 것으로보아 조만간 next.config.ts도 지원될 것으로 기대하고 있다.

## 참고 링크

:pushpin: https://5fingers.hashnode.dev/how-to-execute-nodejs-code-on-nextjs-server-startup
