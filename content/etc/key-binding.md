---
title: "반복된 코드 자동입력하기"
description: "vscode에서 코드 스니펫을 단축키로 등록해보자"
tag:
  - VSCode
---

마크다운으로 포스트를 수정하다가 미리보기 기능을 위해 마크다운 에서 `<❕-- end -->`를 반복 입력해야하는 일이 생겼다.

매번 복사해서 붙여넣기도 귀찮기도해서 단축키로 만들면 어떨까 했는데 vscode에 알맞는 기능이 있었다.

> https://code.visualstudio.com/docs/editor/userdefinedsnippets#_assign-keybindings-to-snippets

'명령 표시 및 실행'에서 '**바로가기 키 열기(JSON)**'을 열면 keybindings.json이 나온다.

![>와 바로가기만 입력하면 자동완성이 보인다.](https://github.com/Zamoca42/next-blog/assets/96982072/5c58c4b0-03bb-4a43-bd9d-d381588ea1e4)

<!-- end -->

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

![json을 다음과 같이 설정하고 저장하면 단축키를 누를 때 마다 코드가 입력된다.](https://github.com/Zamoca42/next-blog/assets/96982072/e93a9d5c-d4d7-4be0-a66d-dca08b051275)
