---
title: "Node.js로 디렉토리 트리 탐색하기"
description: "fs.readdir의 recursive 옵션으로 모든 마크다운 파일 찾기"
tag:
  - Node.js
  - TypeScript
  - Next.js
date: "2024-06-20"
---

Next.js 블로그 스타터를 시작하면 마크다운 포스트를 가져오는 로직은 `fs.readFileSync()`를 사용하여 컨텐츠 폴더 아래의 파일만 탐색하게 된다.

```ts:lib/api.ts {15}
import { Post } from "@/interfaces/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const postsDirectory = join(process.cwd(), "_posts");

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return { ...data, slug: realSlug, content } as Post;
}
//...
```

하지만 컨텐츠 폴더 내부에 하위 폴더가 존재하면 해당 폴더 내의 파일은 찾지 못하는 문제가 있다.

<!-- end -->

이번 포스트에서는 컨텐츠 내부의 하위 폴더를 모두 탐색하여 마크다운 파일을 가져오는 방법에 대해 알아보도록 하겠다.

## Node File System 모듈

Node.js의 File System(fs) 모듈은 파일과 디렉토리를 다루기 위한 기능을 제공하는 내장 모듈이다.

이 모듈을 사용하면 파일 읽기, 쓰기, 생성, 삭제, 디렉토리 생성, 삭제 등의 작업을 수행할 수 있다.

fs 모듈은 동기(Synchronous)와 비동기(Asynchronous) 버전의 메서드를 모두 제공한다.  
동기 메서드는 작업이 완료될 때까지 블로킹되며, 비동기 메서드는 작업을 백그라운드에서 수행하고 콜백 함수나 Promise를 통해 결과를 전달한다.

## readdir 메서드와 recursive 옵션

`fs.promises.readdir` 메서드를 사용하여 디렉토리 내의 파일과 하위 디렉토리를 읽어올 수 있다.
이때 `recursive` 옵션을 `true`로 설정하면 하위 디렉토리까지 모두 탐색할 수 있다.

```ts:api/action.ts
export const getAllPosts = async (): Promise<Post[]> => {
  const fileNames = await fs.promises.readdir(postsDirectory, {
    recursive: true,
  });

  console.log(fileNames);
  //...
};
```

위의 코드를 실행하면 `fileNames`에는 모든 파일과 디렉토리의 경로가 담기게 된다.

```bash:console.log(fileNames)
[
  '.DS_Store',
  'db',
  'etc',
  'infra',
  'js-ts',
  'js-ts/date-fns.md',
  'js-ts/deepdive',
  'js-ts/nest-js',
  'js-ts/next',
  'js-ts/node-readdir.md',
  'js-ts/next/hot-reload.md',
  'js-ts/next/prisma-token-schema-error.md',
  'js-ts/next/run-script-build-time.md',
  ...(생략),
  'etc/coding-test/programmers-mbti.md',
  'etc/coding-test/programmers-report.md',
  'db/dynamoose.md',
  'db/prisma-instance.md',
  'db/prisma-relation-mode.md',
  'db/query-range.md',
  'db/sql',
  'db/transaction-rollback.md',
  'db/typeorm-distinct.md',
  ... 4 more items
]
```

하지만 결과를 보면 필요 없는 파일(`.DS_Store`)이나 디렉토리만 포함된 경로도 있다.  
이를 필터링하여 마크다운 파일만 처리하도록 수정해보자.

```ts:api/action.ts
export const getAllPosts = async (): Promise<Post[]> => {
  const fileNames = await fs.promises.readdir(postsDirectory, {
    recursive: true,
  });

  for (const fileName of fileNames) {
    if (fileName.endsWith(".md")) {
      const filePath = join(postsDirectory, fileName);
      const slug = getSlugFromFilePath(filePath);
      const post = await getPostBySlug(slug);
      posts.push(post);
    }
  }
};
```

위의 코드에서는 `fileName`이 ".md"로 끝나는 경우에만 해당 파일을 처리하도록 하였다.  
이렇게 하면 필요한 마크다운 파일만 선택적으로 가져올 수 있다.

> 로직 전체는 여기서 확인할 수 있다.  
> https://github.com/Zamoca42/next-blog/blob/main/src/app/api/action.ts

## readdir의 recursive 옵션 동작 원리

`fs.readdir`의 `recursive` 옵션이 어떻게 동작하는지 Node.js 소스코드를 살펴보면 다음과 같다.

```js:node/lib/fs.js
function readdirSyncRecursive(basePath, options) {
  // ...

  const readdirResults = [];
  const pathsQueue = [basePath];

  function read(path) {
    const readdirResult = binding.readdir(
      path,
      encoding,
      withFileTypes,
    );

    if (readdirResult === undefined) {
      return;
    }

    // ...

    for (let i = 0; i < readdirResult.length; i++) {
      const resultPath = pathModule.join(path, readdirResult[i]);
      const relativeResultPath = pathModule.relative(basePath, resultPath);
      const stat = binding.internalModuleStat(resultPath);
      ArrayPrototypePush(readdirResults, relativeResultPath);
      // 1 indicates directory
      if (stat === 1) {
        ArrayPrototypePush(pathsQueue, resultPath);
      }
    }
  }

  for (let i = 0; i < pathsQueue.length; i++) {
    read(pathsQueue[i]);
  }

  return readdirResults;
}
```

위의 코드는 `fs.readdirSync`의 `recursive` 옵션을 사용할 때 내부적으로 호출되는 `readdirSyncRecursive` 함수이다.

이 함수는 다음과 같은 동작을 수행한다.

1. `basePath`부터 시작하여 `pathsQueue`에 디렉토리 경로를 추가한다.
2. `pathsQueue`에서 경로를 하나씩 꺼내며 `read` 함수를 호출한다.
3. `read` 함수에서는 해당 경로의 파일과 디렉토리를 읽어온다.
4. 읽어온 파일은 `readdirResults`에 추가하고, 디렉토리는 `pathsQueue`에 추가한다.
5. `pathsQueue`가 빌 때까지 2-4 과정을 반복한다.
6. 최종적으로 `readdirResults`에는 모든 파일과 디렉토리의 경로가 저장된다.

이러한 과정을 통해 `recursive` 옵션을 사용하면 하위 디렉토리까지 모두 탐색하여 결과를 반환할 수 있다.

## 참고 링크

- [Next.js Blog Starter](https://github.com/vercel/next.js/blob/canary/examples/blog-starter/src/lib/api.ts)
- [Node.js fs 모듈](https://inpa.tistory.com/entry/NODE-%F0%9F%93%9A-%ED%8C%8C%EC%9D%BC-%EC%97%85%EB%A1%9C%EB%93%9C-fs-%EB%AA%A8%EB%93%88)
- [Node.js fs.readdir recursive directory search](https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search)
