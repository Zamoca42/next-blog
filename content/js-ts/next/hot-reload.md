---
title: "Next.js 14 - HotReload 에러"
tag:
  - Next.js
  - TypeScript
star: true
---

NextJS로 프로젝트를 진행하던 중에 [Parallel Routes](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes)
를 설정해 모달창을 구현하다가 HotReload 에러를 만나게 되었다.

![나와 완전히 같은 에러라 참고링크의 사진을 첨부했다.](https://github.com/Zamoca42/blog/assets/96982072/9df58ab8-0822-4079-8e18-072df747b9fd)

Next로 모달을 구현하게되면 Parallel Routes를 자주 사용하게 될텐데 같은 에러가 생기면 다시 해결하기 위해 기록으로 남겨두려고한다.

<!-- end -->

## 원인 파악

처음에는 작성한 코드의 오류라고 생각해 공식문서와 비교하며 문제점을 찾아봤지만 실패했다. 그래서 관련 이슈를 검색하다 [레딧 글](https://www.reddit.com/r/nextjs/comments/15t76dj/parallel_routes_and_interception_issues/)
에서 해결 방법을 찾을 수 있었다.

레딧 글에 따르면 HotReload 에러의 주요 원인은 다음과 같다.

1. 동일한 route 내에 `layout.tsx` 파일이 두 개 이상 존재하면 안 된다.
2. 중첩된 레이아웃의 부모 요소로 Fragment 태그(`<></\>`)를 사용하면 문제가 생길 수 있다.
   - Fragment 태그가 "중첩된 `<html>` 태그"를 발생시킬 수 있음
   - 일반 `<div>` 태그로 변경하면 해결될 수 있음
   - 개발자 도구로 html 태그가 중복인지 확인 필요

다만 NextJS 모달 튜토리얼에서는 Fragment 태그를 사용해도 이슈 없이 동작한다고 하여 의문이 남는다.

## 해결 시도

layout 파일에서 Fragment 태그를 div 태그로 아래와 같이 변경해봤다.

```ts:layout.tsx
import { Metadata } from "next";

const metadata: Metadata = {
  title: "Routine",
};

export default function HomeLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div> // Fragment에서 div로 변경
      {children}
      {modal}
    </div>
  );
}
```

하지만 여전히 같은 에러가 발생했다.

## 해결 방법

결국 루트 디렉토리에 있는 `.next` 폴더를 삭제하고 서버를 재실행하니 HotReload 에러가 해결되었다.  
NextJS에서 HotReload 관련 에러가 계속 발생한다면 빌드 캐시인 `.next` 폴더를 지우고 다시 실행해보는 것이 도움될 수 있겠다.  
물론 근본적인 원인은 레이아웃과 라우팅 설정에 있겠지만, 임시방편으로 사용할 수 있는 해결책이 될 것 같다.
