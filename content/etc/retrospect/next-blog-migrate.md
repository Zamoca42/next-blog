---
title: Next.js 블로그로 이전 후기
description: Vuepress에서 Next.js로 블로그를 이전한 후기입니다.
tag:
  - Retrospect
---

Vuepress를 이용한 블로그를 사용하다가 여러 가지 문제에 부딪히게 되었다.
처음에는 블로그에 최적화된 레이아웃과 마크다운을 사용하는 것이 편했으나,
의존성 충돌이 빈번하게 일어나고 제한적인 플러그인과 트러블 슈팅에 대한 정보가 부족해 한계를 느껴 Next.js로 변경을 고려하게 되었다.

이번 포스트에서는 Next.js로 블로그를 이전하기까지 과정을 정리하고 공유해보려고 한다.

<!-- end -->

## 내가 느꼈던 문제점

Vuepress 사용 중 겪었던 주요 문제점은 다음과 같다.

1. 복잡한 문서와 커뮤니티
2. 제한적인 플러그인
3. 플러그인 의존성 충돌

### 복잡한 문서와 커뮤니티

기본 설치와 가이드는 잘 정리되어 있었지만, 테마와 플러그인 추가 시 문서의 깊이가 깊어져 어려움을 겪었다.  
또한, 오류 발생 시 트러블슈팅 정보가 부족하고, GitHub 이슈의 대부분이 중국어여서 자동으로 번역되지 않는 부분은 이해되지않아 해결에 어려움이 있었다.

### 제한적인 플러그인

npm으로 패키지를 포함하는 방식이 아닌 Vuepress를 지원하는 플러그인만 사용해야 했다.
내부 동작을 확인하기 어려워 오류 해결에 제한이 있었고 지원하는 플러그인이 많지 않았다.

### 플러그인 의존성 충돌

문제는 Vuepress에서 shiki 플러그인을 사용하려고 했을 때 발생했다.
shiki는 syntax highlighter로, 코드 블록에서 코드 예시를 보여줄 때 언어를 감지해서 그에 맞는 언어로 보여주는 라이브러리이다.

내가 사용하는 hope 테마에서는 prism 플러그인을 사용 중이었는데,  
prism에서 지원하는 언어 중에 prisma를 지원하지 않아서 언어를 추가하거나 shiki 플러그인으로 교체해야 했다.

Vuepress에서 지원하는 prism 플러그인에는 언어를 추가하는 방법이 없었고,
shiki 플러그인에서 기본적으로 prisma를 지원하기 때문에 shiki 플러그인으로 변경했다.

하지만 shiki 플러그인이 Vuepress 2.0.0-beta.xx 버전에서 동작하지 않았고, 2.0.0-rc.xx 버전으로 업데이트했을 때, 다른 플러그인이 동작하지 않게 되었다.

![플러그인의 버전 충돌](https://github.com/user-attachments/assets/57833166-07b3-47da-bace-8060840b4f29)

## 블로그 마이그레이션

이러한 문제들을 겪고 나서, 다음 조건을 고려하여 마이그레이션을 결정했다.

1. 라이브러리 내부 동작 이해 및 변경 가능성
2. 마크다운 사용으로 기존 포스트 이전 용이성
3. 간단한 공식 문서 구조

이를 바탕으로 Next.js와 Vercel을 선택하게 되었다.

어떻게 블로그를 만들어 나가야할지 고민하던 중 [Next.js 14를 사용하는 blog-starter](https://vercel.com/templates/next.js/blog-starter-kit)
템플릿을 사용하게 되면서 자연스럽게 App Router를 사용하게 되었다.

개발을 진행하면서 내가 알고 있는 정적 페이지의 렌더링 결과물과 달라서 생소했지만 Next.js 13부터 도입된 React Server Component(RSC)에 대해 찾아보게 되면서
SSR과 SSG, CSR 같은 렌더링 방식에 대해 좀 더 이해할 수 있게 되었다.

![Next.js는 SSG가 기본이고 빌드 시 정적 페이지를 생성한다.](https://github.com/user-attachments/assets/dab21679-d4d3-44fb-85d4-23a8bcb09b11)

### SSG vs SSR

먼저 SSG와 SSR의 차이점은 다음과 같다.

1. SSG (정적 사이트 생성):

   - **빌드 시** HTML 파일을 생성
   - 장점: 빠른 로딩 속도, 높은 확장성
   - 적합한 경우: 자주 변경되지 않는 콘텐츠 (예: 블로그, 문서 사이트)

2. SSR (서버 사이드 렌더링):

   - **요청 시** 서버에서 HTML을 생성
   - 장점: 실시간 콘텐츠, 개인화 가능
   - 적합한 경우: 자주 변경되는 동적 콘텐츠 (예: 전자상거래, 소셜 미디어)

SSG와 SSR의 공통점은 완성된 HTML페이지를 보여준다는 것이다.
Next.js에서는 직접 렌더링된 페이지를 보게 되면 script 태그에 `self.__next_f.push`가 포함된 부분을 보게된다.
이는 React 프레임워크인 Next.js가 서버 컴포넌트를 사용하면서 포함된 RSC payload다.

![`self.__next_f.push` 포함된 페이지가 생성된다.](https://github.com/user-attachments/assets/4b005652-dad6-4de8-88a8-2216b5c4192e)

### RSC vs SSR

처음에는 서버 사이드 렌더링(SSR)과 React Server Component(RSC)가 같다고 알고 있었는데
SSR은 HTML, RSC는 RSC Payload라는 JSON 포맷으로 온다.

다시 말해, SSR은 초기 렌더링을 서버에서 처리하고 클라이언트에서 JS 코드를 추가해 상호 작용을 추가하는 반면,
RSC는 서버에서 생성된 React 엘리먼트를 직렬화(RSC Payload)하여 클라이언트로 전송하고, 클라이언트에서 확장을 수행하는 형태라고 보면 된다.

**SSR과 RSC의 주요 차이점을 표로 정리했다**

| 특성                 | SSR (Server-Side Rendering)                     | RSC (React Server Components)                                         |
| -------------------- | ----------------------------------------------- | --------------------------------------------------------------------- |
| 렌더링 위치          | 서버에서 전체 페이지 렌더링                     | 서버에서 일부 컴포넌트만 렌더링                                       |
| 클라이언트로의 전송  | 완성된 HTML                                     | RSC Payload (JSON 형식)                                               |
| 클라이언트 측 처리   | JavaScript로 상호작용 추가 (Hydration)          | RSC Payload를 기반으로 렌더링 및 확장                                 |
| 컴포넌트 실행        | 모든 컴포넌트가 서버와 클라이언트 양쪽에서 실행 | 서버 컴포넌트는 서버에서만, 클라이언트 컴포넌트는 클라이언트에서 실행 |
| 초기 로드 성능       | 완전한 HTML로 인해 빠른 초기 로드               | 작은 Payload로 인해 더 빠른 초기 로드 가능                            |
| JavaScript 번들 크기 | 전체 앱의 JS 필요                               | 클라이언트 컴포넌트의 JS만 필요하여 번들 크기 감소                    |
| 데이터 fetching      | 서버에서 모든 데이터 fetch                      | 서버 컴포넌트에서 효율적으로 데이터 fetch 가능                        |
| SEO                  | 완전한 HTML로 유리                              | 서버에서 렌더링되어 SEO에 유리                                        |
| 유연성               | 전체 페이지 단위의 렌더링                       | 컴포넌트 단위의 더 세밀한 제어 가능                                   |

RSC가 서버 컴포넌트라는 의미니 반대로 클라이언트 컴포넌트도 존재한다.
React 18 이전 버전에서 사용했던 모든 컴포넌트가 클라이언트 컴포넌트다.

서버 컴포넌트와 클라이언트 컴포넌트의 가장 큰 차이점은 컴포넌트가 렌더링되는 장소가 서버냐 클라이언트냐의 차이다.

### 실제 사용 예시

RSC와 SSR의 차이를 알아보면서 RSC가 기존의 렌더링 개념과는 다르게  
SSR와 CSR의 장점을 가져온 렌더링 방식이라는 것은 이론적으로 이해했다.

하지만 개발을 진행하면서 느낀 바로는 어디서 어떻게 렌더링이 적용되고 있는지는 구분하기 어렵다는 것이다.
블로그를 개발하면서 작성한 코드를 예시로 정리해보겠다.

#### Dynamic Routes

Dynamic Routes는 URL 경로를 동적으로 생성할 수 있다.
URL 요청에 대한 경로를 파라미터로 인식해 해당 페이지에 대한 데이터를 동적으로 보여줄 수 있는데,
`generateStaticParams`함수를 사용하여 빌드 시 또는 요청 시 렌더링 여부를 결정할 수 있다.

```tsx:app/post/[...slug]/page.tsx
export default async function PostDetail({
  params,
}: {
  params: { slug: string[] };
}) {
  if (!params.slug || params.slug.length === 0) {
    notFound();
  }

  const postSlug = params.slug.join("/");
  const postBranch = params.slug[0];
  const post = await getPostBySlug(postSlug);

  if (!post) {
    return notFound();
  }

  return (
    <div>
      <div>
        <article className="my-10 px-1">
          <div className="mb-12 max-w-3xl">
            <MarkdownBody content={post.content} />
          </div>
        </article>
      </div>
    </div>
  );
}

export const generateStaticParams = async () => {
  const posts = await getAllPosts();

  return posts.map((post: Post) => ({
    slug: post.slug.split("/").filter(Boolean),
  }));
};
```

![generateStaticParams을 사용하고 빌드하면 미리 정적페이지를 생성한다.](https://github.com/user-attachments/assets/dab21679-d4d3-44fb-85d4-23a8bcb09b11)

반대로 generateStaticParams을 삭제하고 빌드를 하면 요청시 렌더링하게 바뀐다.

![정적페이지를 생성하던 /post/[...slug]가 Dynamic으로 변경](https://github.com/user-attachments/assets/4e6391bb-e45e-4263-a801-5d6b0c7b6536)

### 클라이언트 컴포넌트

Next.js에서 App Router의 컴포넌트는 서버 컴포넌트를 기본으로 사용한다.
서버 컴포넌트에서는 Intersection Observer같은 브라우저 API나 `useState`, `useEffect`와 같은
브라우저 상호작용이 필요한 부분은 사용할 수 없으므로 컴포넌트 파일 최상위에 "use client"로 클라이언트 컴포넌트임을 명시해야한다.

```tsx:component/layout/navbar.tsx {1}
"use client";

export const NavBar = () => {
  const { isOpen, setIsOpen, isLinkOpen, setIsLinkOpen } = useSideBar();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

   //...
};
```

### Static Exports

> https://nextjs.org/docs/app/building-your-application/deploying/static-exports

Next.js 공식문서에서 next.config.js에 `output: 'export'`를 작성해 앱을 HTML/CSS/JS로 변환해 정적로 내보낸다는 설정이 있다.

```js:next.config.js
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'export',

  // Optional: Change links `/me` -> `/me/` and emit `/me.html` -> `/me/index.html`
  // trailingSlash: true,

  // Optional: Prevent automatic `/me` -> `/me/`, instead preserve `href`
  // skipTrailingSlashRedirect: true,

  // Optional: Change the output directory `out` -> `dist`
  // distDir: 'dist',
}

module.exports = nextConfig
```

해당 기능은 Vercel/Netlify 외의 `.next` 폴더를 인식할 수 없는 Github Pages같은 같은 플랫폼에서 사용하기 위한 기능이다.

## 마무리

이번에 블로그를 옮기면서 생각보다 많은 걸 배웠다.

Next.js로 블로그를 만들어보면서 서버와 클라이언트의 구분이 애매하고 렌더링 결과물에 RSC payload가 포함되는 것을 보면서 처음엔 혼란스러웠던 부분이 많이 있었다.
최근까지도 Next.js에 대한 렌더링 방식을 이해하기 어려웠는데 지속적으로 렌더링에 대해 찾아보게 되면서 오히려 웹의 렌더링 방식에 대해 더 자세히 이해해볼 수 있는 시간이였다.

또한 기존 블로그에서 어떤 기능이 진짜 필요한지, 또 그런 기능들이 성능에 어떤 영향을 줄지 고민하느라 시간이 꽤 걸렸지만, 그만큼 값진 경험이었다.

이 과정을 통해 단순히 블로그를 옮기는 것을 넘어서 웹 개발의 깊이 있는 부분들을 탐구하게 되었고,
앞으로도 계속해서 새로운 도전을 하면서 배움의 기회를 만들어가고 싶다. 그리고 이런 경험들을 블로그에 기록하면서 나중에 돌아볼 때 그때의 고민과 성장을 되새길 수 있을 것 같다.

## 참고 링크

📌 https://aws.amazon.com/ko/blogs/mobile/ssg-vs-ssr-in-next-js-web-applications-choosing-the-right-rendering-approach/

📌 https://github.com/vercel/next.js/discussions/54114

📌 https://velog.io/@2ast/React-%EC%84%9C%EB%B2%84-%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8React-Server-Component%EC%97%90-%EB%8C%80%ED%95%9C-%EA%B3%A0%EC%B0%B0
