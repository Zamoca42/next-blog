---
title: "블로그 마크다운 문법 정리"
tag:
  - Markdown
---

<!-- markdownlint-disable -->

## 마크다운(Markdown)이란?

마크다운(Markdown)은 텍스트 기반의 가벼운 마크업 언어 중 하나로, 읽기 쉽고 쓰기 쉬운 문법을 가지고 있다.

마크다운은 HTML로 변환이 가능하며, 다양한 플랫폼과 프로그램에서 지원되고 있다.

마크다운을 사용하면 **간단한 문법**으로 서식이 있는 문서를 작성할 수 있다.

<!-- end -->

### 마크다운의 장점

- 문법이 간단하고 쉽게 배울 수 있다.
- 텍스트 파일로 저장되므로 버전 관리 시스템과 호환성이 좋다.
- 다양한 플랫폼과 프로그램에서 지원된다.
- HTML로 변환이 가능하여 웹에서 손쉽게 게시할 수 있다.

### 마크다운의 단점

- 표준화된 문법이 없어 프로그램마다 지원되는 문법이 조금씩 다를 수 있다.
- 복잡한 서식을 적용하기에는 한계가 있다.
- 일부 프로그램에서는 마크다운 문법의 모든 기능을 지원하지 않을 수 있다.

마크다운은 간단한 문서 작성에 적합하며, 특히 개발자들 사이에서 널리 사용되고 있다. 깃허브(GitHub)와 같은 협업 플랫폼에서도 마크다운을 기본적인 문서 형식으로 채택하고 있다.

현재 나의 블로그에서는 GitHub에서 사용하는 마크다운 문법(GFM)과 [unified](https://github.com/unifiedjs/unified)
로 지원하는 마크다운 문법을 추가해 사용 중이다.

## Frontmatter

Frontmatter는 파일의 시작 부분에 위치하는 메타데이터 블록으로, 주로 마크다운(Markdown), HTML, 또는 기타 텍스트 파일에서 사용된다.
Frontmatter는 파일에 대한 추가 정보를 제공하며, 변수, 설정, 또는 파일의 내용과 관련된 데이터를 포함할 수 있다.
일반적으로 YAML, TOML 또는 JSON 형식으로 작성되며, 파일 내용과 구분하기 위해 `---` 또는 `+++`로 둘러싸인다.

### [gray-matter](https://github.com/jonschlinkert/gray-matter) 라이브러리

Node.js 환경에서 사용되는 자바스크립트 라이브러리로, 파일에서 Frontmatter를 파싱하고 추출하는 기능을 제공한다.
이 라이브러리를 사용하면 마크다운 파일의 Frontmatter와 내용을 쉽게 분리할 수 있다.
Next.js의 블로그 스타터를 사용하면 package.json에 포함되어 있다.

```markdown:마크다운_예시
---
title: Hello
slug: home
---

<h1>Hello world!</h1>
```

```javascript:파싱_결과
{
  content: '<h1>Hello world!</h1>',
  data: {
    title: 'Hello',
    slug: 'home'
  }
}
```

### 다른 관련 라이브러리

1. `js-yaml`: YAML 형식의 데이터를 파싱하고 직렬화하는 라이브러리이다.
2. `toml`: TOML 형식의 데이터를 파싱하고 직렬화하는 라이브러리이다.
3. `remark-frontmatter`: gray-matter와 유사한 기능을 제공하는 또 다른 라이브러리이다.

이러한 라이브러리를 사용하면 Frontmatter를 쉽게 다룰 수 있으며, 정적 사이트 생성기, 블로그 엔진, 또는 콘텐츠 관리 시스템 등에서 유용하게 활용될 수 있다.

## Excerpt

'excerpt'는 gray-matter에서 markdown 컨텐츠의 일부분을 자동으로 추출하는 기능이다.

```js
const matter = require("gray-matter");

const markdown = `---
title: 샘플 포스트
---
이것은 첫 번째 단락입니다.

이것은 두 번째 단락입니다.

<!-- end -->
`;

const result1 = matter(markdown, { excerpt: true });
console.log(result1.excerpt); // "이것은 첫 번째 단락입니다."

const result2 = matter(markdown, {
  excerpt: true,
  excerpt_separator: "<!-- end -->",
});
console.log(result2.excerpt); // "이것은 첫 번째 단락입니다.\n\n이것은 두 번째 단락입니다."
```

## Directive

directive 문법은 remark-directive 플러그인에서 사용되는 특별한 구문으로, 마크다운 문서에 추가적인 기능을 제공한다.
Directive는 `:::`로 시작하며, 바로 뒤에 directive의 이름이 따라온다.
Directive의 내용은 `:::`로 둘러싸인 블록 안에 위치한다.

```markdown
:::info{title="정보"}

내용

:::
```

```html:변환_예시
<info title="정보">
  내용
</info>
```

:::info{title="정보"}

내용

:::

```markdown
:::details{title="요약"}

펼치기 줄이기가 가능한 directive 문법

:::
```

:::details{title="요약"}

펼치기 줄이기가 가능한 directive 문법

:::

## Github Flavored Markdown(GFM) 문법

GFM은 GitHub에서 사용되는 마크다운 문법으로, 기본적인 마크다운 문법에 몇 가지 확장 기능을 추가한 것이다. 다음은 GFM에서 지원하는 주요 문법들이다.

### 헤더(Headers)

```markdown
# H1

## H2

### H3

#### H4

##### H5

###### H6
```

# H1

### H3

#### H4

##### H5

###### H6

### 강조(Emphasis)

```markdown
_italic_
**bold**
~~strikethrough~~
```

_italic_
**bold**
~~strikethrough~~

### 리스트(Lists)

```markdown
- Item 1
- Item 2
  - Item 2a
  - Item 2b

1. Item 1
2. Item 2
3. Item 3
```

- Item 1
- Item 2
  - Item 2a
  - Item 2b

1. Item 1
2. Item 2
3. Item 3

### 링크(Links)

```markdown
[링크 텍스트](url)
```

### 이미지(Images)

```markdown
![대체 텍스트](이미지_url)
```

### 코드 블록(Code Blocks)

```markdown
​`언어이름:제목
코드 내용
​`
```

### 테이블(Tables)

```markdown
| 헤더 1 | 헤더 2 |
| ------ | ------ |
| 셀 1   | 셀 2   |
| 셀 3   | 셀 4   |
```

| 헤더 1 | 헤더 2 |
| ------ | ------ |
| 셀 1   | 셀 2   |
| 셀 3   | 셀 4   |

### 인용구(Blockquotes)

```markdown
> 인용구 내용
```

> 인용구 내용

### 작업 목록(Task Lists)

```markdown
- [x] 완료된 작업
- [ ] 완료되지 않은 작업
```

- [x] 완료된 작업
- [ ] 완료되지 않은 작업

## 마크다운 테마

마크다운 문서의 스타일링은 CSS를 사용하여 커스터마이징할 수 있다. 다양한 마크다운 에디터에서는 기본 제공되는 테마를 선택하거나, 사용자 정의 CSS를 적용하여 원하는 디자인을 구현할 수 있다.

대표적인 마크다운 테마로는 다음과 같은 것들이 있다:

1. GitHub 테마: GitHub에서 사용되는 기본 마크다운 스타일이다.
2. Material 테마: Material Design 가이드라인을 기반으로 한 모던하고 깔끔한 디자인의 테마이다.
3. Tailwind Typography: Tailwind CSS 프레임워크의 확장 플러그인 중 하나로, 마크다운으로 작성된 콘텐츠를 일관성 있게 스타일링하는 데 도움을 준다.  
   HTML 또는 마크다운 콘텐츠를 감싸는 요소에 prose 클래스를 추가한다.

```jsx
<article class="prose">
  <!-- 마크다운 콘텐츠 -->
</article>
```

이 외에도 수많은 마크다운 테마가 존재하며, 사용자의 취향과 필요에 따라 선택할 수 있다. 또한 CSS를 직접 수정하여 자신만의 고유한 테마를 만들 수도 있다.  
현재 블로그에서는 Tailwind Typography를 커스텀해서 적용중이다.
