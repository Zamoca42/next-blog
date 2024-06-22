---
title: "Markdownlint - 마크다운 linting 도구"
tag:
  - Markdown
  - VSCode
---

Markdownlint는 VSCode 확장 프로그램 중 하나로, 마크다운 형식의 파일을 일관성있게 작성하도록 도와주는 도구다.

![https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint](https://github.com/Zamoca42/next-blog/assets/96982072/13d22865-eed5-46b1-b2bd-503f81cafa12)

블로그를 작성할 때 주로 사용하고있고, VSCode 설정에서 `codeActionsOnSave` 설정 시 자동으로 규칙과 어긋난 부분을 수정한다.

```diff-json:settings.json
    //...
    "editor.codeActionsOnSave": {
        "source.fixAll": "explicit",
+       "source.fixAll.markdownlint": "explicit"
    },
    //...
```

<!-- end -->

:::details{title="블로그에 적용한 설정"}

```json:.markdownlint.json
{
  "MD001": false,
  "MD013": {
    "code_blocks": false,
    "line_length": 100,
    "tables": false
  },
  "MD024": {"siblings_only": true},
  "MD034": false,
  "MD033": false,
  "MD036": false
}

```

:::

![실시간으로 어떤 부분이 문제인지 바로 확인 할 수 있다.](https://github.com/Zamoca42/next-blog/assets/96982072/7d3da747-7650-4b9e-9f98-9e0677b8f08c)
