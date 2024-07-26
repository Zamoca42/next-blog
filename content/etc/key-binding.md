---
title: "VSCode - 커스텀 스니펫과 키 바인딩"
description: "코드 스니펫을 VSCode에 단축키로 등록해 자동입력하기"
tag:
  - VSCode
star: false
---

> https://code.visualstudio.com/docs/editor/userdefinedsnippets#_assign-keybindings-to-snippets

VSCode에서는 커스텀 스니펫과 키 바인딩 기능을 제공한다.

이를 활용하면 자주 사용하는 코드나 텍스트를 단축키나 단축어로 쉽게 입력할 수 있다.
블로그 포스트를 작성 시 매번 frontmatter나 excerpt 키워드를 복사하여 붙여넣는 번거로움을 줄이기 위해 VSCode의 이 기능을 사용해 보기로 했다.

<!-- end -->

## excerpt 키워드 단축키 등록

gray-matter를 이용한 마크다운용 excerpt 키워드를 `<❕-- end -->`로 설정해 미리 보여주고 싶은 부분을 지정할 수 있다.

'명령 표시 및 실행'에서 '**바로가기 키 열기(JSON)**'을 열면 keybindings.json이 나온다.

![>와 바로가기만 입력하면 자동완성이 보인다.](https://github.com/Zamoca42/next-blog/assets/96982072/5c58c4b0-03bb-4a43-bd9d-d381588ea1e4)

json을 다음과 같이 설정하고 저장하면 단축키를 누를 때 마다 코드가 입력된다.

```json:keybindings.json
[
  {
    "key": "cmd+;",
    "command": "editor.action.insertSnippet",
    "when": "editorTextFocus",
    "args": {
      "snippet": "<!-- end -->"
    }
  }
]
```

![`cmd` + `;` 단축키를 누를 때 마다 설정한 코드가 입력된다.](https://github.com/Zamoca42/next-blog/assets/96982072/e93a9d5c-d4d7-4be0-a66d-dca08b051275)

## frontmatter 단축어 지정

frontmatter는 마크다운 문서에서 최상단에 위치한 메타데이터 섹션이다. 주로 YAML 형식을 사용하고 TOML, JSON형식으로도 작성 가능하다.
마크다운 문서에서 frontmatter를 구분하는 방식은 기본적으로 `---`를 처음과 끝에 사용해 구분하고 라이브러리에 따라 임의로 설정이 가능하다.

우선 내가 사용하는 frontmatter 형식의 예시는 다음과 같다.

```markdown
---
title: "VSCode - 커스텀 스니펫과 키 바인딩"
description: "코드 스니펫을 VSCode에 단축키로 등록해 자동입력하기"
tag:
  - VSCode
star: false
date: 2024-07-26
---
```

해당 형식을 VSCode에서 `markdown.json`에 이렇게 설정할 수 있다.

![VSCode에서 markdown.json 설정 파일 찾기](https://github.com/user-attachments/assets/95205b92-3ce4-40f2-8b4f-7a783f298e8f)

```json
{
  "Post Matter": {
    "prefix": ["matter", "---"],
    "description": "Output a file header with the file name and date",
    "body": [
      "---",
      "title: '$1'",
      "description: '$2'",
      "tag:",
      "  - $3",
      "star: false",
      "date: $CURRENT_YEAR-$CURRENT_MONTH-$CURRENT_DATE",
      "---",
      "",
      "$0"
    ]
  }
}
```

![이제 마크다운 파일에서 `---`를 입력하면 설정한 형식을 불러올 수 있다.](https://github.com/user-attachments/assets/9f21391e-61e1-404b-a0b9-0d2bd9fb0224)
