---
title: Next.js 블로그로 이전 후기
description: Vuepress에서 Next.js로 블로그를 이전한 후기입니다.
tag:
  - Retrospect
---

![블로그 템플릿을 이용한 Next.js 블로그](https://github.com/user-attachments/assets/f4ba8b87-6d10-40d2-9ff9-df53437d666a)

Vuepress를 이용한 블로그를 사용하다가 여러 가지 문제에 부딪히게 되었다.
처음에는 블로그에 최적화된 레이아웃과 마크다운을 사용하는 것이 편했으나,
의존성 충돌이 빈번하게 일어나고 제한적인 플러그인과 트러블 슈팅에 대한 정보가 부족해 한계를 느껴 Next.js로 변경을 고려하게 되었다.

이번 포스트에서는 Next.js로 블로그를 이전하기까지 과정을 정리하고 공유해보려고 한다.

<!-- end -->

## 내가 느꼈던 문제점들

내가 느꼈던 점들은 기능적인 문제보다는 문서에서의 불만이 원인이었고, 의존성 충돌이 블로그를 Next.js로 옮기게 되는 트리거가 되었다.

### 복잡한 문서와 커뮤니티

기본적인 Vuepress의 설치 방법과 가이드는 깔끔하게 정리되어 있는 편이었다.
하지만 테마와 플러그인을 추가하게 되면 봐야 할 문서의 depth가 커지게 되고 무엇을 봐야 할지부터 막막해졌다.

또한 오류가 발생했을 때 공식 문서를 찾아도 트러블슈팅에 포함된 내용이 없고, GitHub 이슈에 포함된 내용을 보면 대부분 중국어라 번역해 읽기가 힘들었다.

### 제한적인 플러그인

npm으로 패키지를 포함하는 방식이 아닌 Vuepress를 지원하는 플러그인을 사용해야 했다.
예를 들어, Giscus 같은 댓글 기능을 사용하려면 컴포넌트 방식이 아닌 `defineUserConfig`에서 플러그인을 설정해야 한다.

추가 설정 없이 플러그인만 추가하면 동작한다는 게 장점이었지만, 내부에서 어떻게 동작하는지 확인할 수 없어서 오류가 나도 해결할 수 없는 부분이 있다는 것이 문제였다.

### 플러그인 의존성 충돌

문제는 Vuepress에서 shiki 플러그인을 사용하려고 했을 때 발생했다.
shiki는 syntax highlighter로, 코드 블록에서 코드 예시를 보여줄 때 언어를 감지해서 그에 맞는 언어로 보여주는 라이브러리이다.

내가 사용하는 hope 테마에서는 prism 플러그인을 사용 중이었는데,  
prism에서 지원하는 언어 중에 prisma를 지원하지 않아서 언어를 추가하거나 shiki 플러그인으로 교체해야 했다.

Vuepress에서 지원하는 prism 플러그인에는 언어를 추가하는 방법이 없었고,
shiki 플러그인에서 기본적으로 prisma를 지원하기 때문에 shiki 플러그인으로 변경했다.

하지만 shiki 플러그인이 Vuepress 2.0.0-beta.xx 버전에서 동작하지 않았고, 2.0.0-rc.xx 버전으로 업데이트했을 때,
다른 플러그인이 버전 오류로 동작하지 않게 되었다.

`.npmrc`를 이용해 strict-peer-dependencies를 false로 변경해보는 등 여러 방법을 시도했지만 여전히 동작하지 않았다.

GitHub 이슈에서의 답변은 다른 버전이 업데이트될 때까지 기다리는 방법밖에 없다고 해서,
플러그인을 사용하는 방식과는 다른 방식을 사용하도록 찾아보는 계기가 되었다.

![플러그인 의존성 충돌](https://github.com/user-attachments/assets/57833166-07b3-47da-bace-8060840b4f29)

## 블로그 마이그레이션

위의 의존성 충돌을 겪고 나니 이러한 조건들을 가지고 마이그레이션을 해보기로 했다.

1. 라이브러리 내부 동작을 알고 변경할 수 있어야 한다.
2. 전에 있던 포스트를 바로 옮겨올 수 있도록 마크다운을 이용한다.
3. 쉽게 이해하고 해결할 수 있는 문서와 커뮤니티가 갖춰져야 한다.

이러한 조건을 확인하니 Gatsby와 Ruby on Rails 등 블로그에 최적화된 여러 프레임워크가 있었지만,
간단한 배포 프로세스와 커뮤니티, 플러그인을 사용하지 않고 패키지로 필요한 기능을 가져오는 Next.js + Vercel을 이용하기로 했다.

Next.js를 사용하기로 한 후 계획했던 것은 정적 페이지(SSG)를 사용하는 블로그를 만드는 것이었는데,
Next.js 14를 사용하는 [blog-starter 템플릿](https://vercel.com/templates/next.js/blog-starter-kit)
을 사용하게 되면서 자연스럽게 App Router를 사용하게 되었다.

App Router에서도 당연히 SSG를 지원할 줄 알고 개발을 시작했지만,  
App Router에서는 React Server Component(RSC)를 사용하며 내가 생각한 렌더링 방식과 완전히 달라서 오해하는 부분이 생겼다.  
바로 SSR과 RSC는 다르다는 점이였고, App Router는 완전한 SSG와는 차이가 있다는 것이였다.  
무슨 얘기 인지는 아래에서 자세히 설명하려고한다.

![빌드 시 정적 페이지를 생성하는 것으로 인지했다.](https://github.com/user-attachments/assets/dab21679-d4d3-44fb-85d4-23a8bcb09b11)

### SSG vs SSR

먼저 SSG와 SSR의 차이점은 다음과 같다:

1. SSG (정적 사이트 생성):

   - 빌드 시 HTML 파일을 생성
   - 장점: 빠른 로딩 속도, 높은 확장성
   - 적합한 경우: 자주 변경되지 않는 콘텐츠 (예: 블로그, 문서 사이트)

2. SSR (서버 사이드 렌더링):

   - 요청 시 서버에서 HTML을 생성
   - 장점: 실시간 콘텐츠, 개인화 가능
   - 적합한 경우: 자주 변경되는 동적 콘텐츠 (예: 전자상거래, 소셜 미디어)

### SSR !== RSC

서버 사이드 렌더링(SSR)과 React Server Component(RSC)에 대해 같은 것으로 오해하고 있었는데

결론부터 말하자면 SSR과 RSC는 확연하게 다르다. SSR은 HTML, RSC는 RSC Payload라는 JSON 포맷으로 온다.

다시 말해, SSR은 초기 렌더링을 서버에서 처리하고 클라이언트에서 JS 코드를 추가해 상호 작용을 추가하는 반면,
RSC는 서버에서 생성된 React 엘리먼트를 직렬화(RSC Payload)하여 클라이언트로 전송하고, 클라이언트에서 초기 렌더링 및 확장을 수행하는 형태라고 보면 된다.

SSR과 RSC의 주요 차이점은 다음과 같다:

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

### App Router에서 generateStaticParams를 사용한 렌더링 방식

Next.js 14버전에서 App Router를 사용하는 경우에는 `generateStaticParams`를 사용하면  
SSG로 내보낸다고 이해했었지만, 위에서 알아본 SSG 방식과는 다르다.

`generateStaticParams`으로 빌드 시 페이지가 생성되는 것 처럼 보이지만 실제로는 script 태그에 RSC payload가 포함된 html 페이지가 생성된다.

즉, App directory에서는 React Server Components(RSC)와 정적 사이트 생성(SSG)을 결합한 새로운 접근 방식을 채택하고 있다.

![`self.__next_f.push` 포함된 페이지가 생성된다.](https://github.com/user-attachments/assets/4b005652-dad6-4de8-88a8-2216b5c4192e)

#### 주요 포인트

1. RSC의 사용: `self.__next_f.push`의 존재는 실제로 React Server Components가 사용되고 있음을 나타낸다. 이는 App Router의 기본 동작이다.
2. SSG와 RSC의 결합: `generateStaticParams`를 사용하면 여전히 빌드 시점에 페이지가 생성되지만, 이제 이 페이지들은 RSC 형식으로 생성된다.
3. 정적이면서도 동적인 특성: 이 접근 방식은 정적 생성의 이점(빠른 초기 로드, SEO 친화적)과 RSC의 이점(더 작은 번들 크기, 서버 측 로직)을 결합한다.
4. 클라이언트 측 하이드레이션 변화: 전통적인 SSG와 달리, 클라이언트는 전체 HTML을 받는 대신 RSC 페이로드를 받아 페이지를 구성한다.
5. 성능 최적화: 이 방식은 초기 페이지 로드 시 전송되는 JavaScript의 양을 줄이고, 필요한 컴포넌트만 클라이언트로 전송할 수 있게 한다.

## 그렇다면 Page Router로 전환해야 하는 것이 아닌가?

완전한 정적 페이지는 아니지만 속도면에서 크게 차이가 없고 클라이언트 컴포넌트도 유연하게 사용할 수 있는 장점이 있다.
그리고 앞으로 Next.js의 새로운 기능들은 주로 App Router에 초점을 맞추어 개발될 것이라고 설명하는 것으로 볼 때,
장기적인 유지보수를 위해서는 App Router를 사용하는 게 좋을 것이라 판단되어 App Router로 유지하기로 했다.

## 참고 링크

📌 https://aws.amazon.com/ko/blogs/mobile/ssg-vs-ssr-in-next-js-web-applications-choosing-the-right-rendering-approach/

📌 https://github.com/vercel/next.js/discussions/54114
