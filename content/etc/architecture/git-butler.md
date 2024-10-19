---
title: "GitButler - 페어소스 기반의 Git 버전 관리 자동화 툴"
tag:
  - Git
  - AI
  - Architecture
  - Rust
  - Svelte
---

> https://news.hada.io/topic?id=16281

## GitButler 소개

Git Butler는 Git Client로 Source Tree와 Git Desktop, AI를 합쳐놓은 듯한 프로그램이다.
흔히 CLI를 통해 명령어를 입력하는 것과 달리 좀 더 쉽게 버전 관리를 할 수 있도록 도와준다.

직접 사용해보면서 느낀점은 AI를 통해 커밋 메시지를 자동으로 생성해주는 것이 아주 편리하다는 점이였다.

다른 특이한 점은 소스 코드가 공개되어있다는 것인데 저작권은 회사가 가지고 있고 커뮤니티를 위해 소스를 공개하고, 읽고, 배우고, 기여하고, 수정할 수 있는 방식으로 운영되고 있다는 점에서 오픈소스가 아닌 페어소스(fair source)라고 불리고 있다.

페어소스는 오픈소스와 달리 소스코드는 공개되지만, 상업적 사용이 제한되거나 일정 조건 하에만 사용할 수 있는 라이선스 모델인 것이다.

개발자들이 상주하며 어떤 기능이 작성되고 있는지 PR도 실시간으로 확인할 수 있어
실제 사용해본 유저로서 기여할 수 있는 기회가 있었다.

## GitButler 구조

> [GitButler Repository](https://github.com/gitbutlerapp/gitbutler)

GitBulter의 레포지토리 구조를 보면 프론트엔드와 백엔드로 나뉘어져 있고,
프론트엔드는 Sevelte, 백엔드는 Rust로 이루어져 있다.

이렇게 작성된 이유는 프론트엔드와 백엔드 사이 통신을 위한 IPC와 빌드 도구, 창 구성 등 여러 Tauri의 API들을 사용하고 있기 때문이다.

Tauri의 공식문서를 살펴보면 GitButler의 구조를 파악하기 쉽다.

> [Tauri IPC](https://v2.tauri.app/concept/inter-process-communication/)

Tauri의 IPC (Inter-Process Communication)는 시스템 자원내부에서 프로세스 간 통신을 하기 위한 방법이다. 그래서 네트워크 지연이 없고 외부로의 공격위험이 적다.

백엔드에서는 invoke 핸들러를 통해 비즈니스 로직을 처리하고, 프론트엔드에서는 invoke 함수를 통해 백엔드에 등록된 로직을 호출한다.

invoke가 사실상 fetch API 역할을 하는 것이다.

> [Tauri invoke](https://v2.tauri.app/develop/calling-rust/)

백엔드에서 Rust로 작성된 비즈니스 로직은 주로 gitoxide와 libgit2를 사용한다.

gitoxide는 rust로 작성된 git 라이브러리이고, libgit2는 C로 작성된 git 시스템 라이브러리이다.

gitoxide는 빠르고 안정적이며, gitoxide에서 구현되지 않은 부분은 libgit2가 기능을 제공한다.

gitoxide와 libgit2 모두 오픈소스이며 코드가 공개되어 있어 해당 코드를 비교하며 분석하는 것도 흥미롭고, git2와 gitoxide를 비교해보며 gitoxide에서 구현되지 않은 부분을 기여할 수 있을 것 같다.

## 마무리

GitButler도 소스 코드가 공개되어있고 누구나 기여할 수 있게 되어있어 코드를 분석하고 기여할 수 있게 열려있어 운좋게 기여할 수 있었는데, 다음 포스트에서 정리하려고한다.
