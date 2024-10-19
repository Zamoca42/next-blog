---
title: "Tauri - 리눅스 환경에서 실행시 창이 꺼지는 문제 기여 후기 2"
tag:
  - Tauri
  - Linux
  - Open-Source
---

> [이전 포스트](https://zamoca.space/etc/retrospect/oss-gitbutler-linux-window)에서 이어지는 내용입니다.
> 해당 이슈: https://github.com/tauri-apps/tao/issues/977

처음에는 linux에서 `Error 71 (Protocol error) dispatching to Wayland display.`이 발생하는 이유는
Tauri의 window-state 플러그인의 자체적인 문제라고 생각했다.

그래서 Tauri의 플러그인 레포지토리에 [이슈](https://github.com/tauri-apps/plugins-workspace/issues/1779)를 남겼지만
창이 최대화시에 발생하는 문제라면 Tauri의 업스트림 중 하나인 Tao에서 발생하는 문제라고 답변을 들을 수 있었다.

![타우리의 아키텍쳐](https://github.com/user-attachments/assets/cc83e09a-0ad6-4da6-9e25-bd812079a2ec)

Tao는 Tauri에서 창을 생성하고 관리하는 라이브러리이다.

그래서 이슈를 Tao에서 다시 작성한 후에 Discord에 메인테이너에게 기여를 해도되는지 문의를 했고
메인테이너에게 자유롭게 기여를 해도된다는 답변을 받았다.

## 문제 파악

Tao에서는 창을 생성하고 이벤트를 처리하는 로직을 가지고 있었다.
Linux에서 `cargo run --example resizable`을 같이 예제를 실행하면 창이 뜨는 것을 확인할 수 있었다.
resizable 예제는 창의 크기를 조절할 수 있는 예제였는데 최대화 버튼을 누르면
`Error 71 (Protocol error) dispatching to Wayland display.`이 발생하고 창이 꺼지는 문제가 발생하였다.

![리눅스에서 창이 꺼지는 문제 재현](https://github.com/user-attachments/assets/7d458a74-07fd-48ca-ad26-20e5a530a9e2)

저장된 버퍼의 크기의 불일치 문제가 진짜 문제가 아닐 수도 있겠다는 생각이 들어서 이벤트 루프 쪽을 수정해보기로 했다.
그리고 이벤트 루프 쪽을 수정하면서 gnome이나 kde가 없는 native 환경에서는 창을 종료하는 버튼이 없고
창 이동이 안되는 문제를 추가로 발견했고 같이 수정하기로 했다.

## 해결 방법

> https://github.com/tauri-apps/tao/pull/979

해당 버그를 수정하면서 알게된 것은 `dispatching to Wayland display.` 에러가 발생하는 근본적인 이유는
최대화 전에 `set_resizable(false)`면 최대화도 resize 이벤트에 들어가므로 오류가 발생한다.
그리고 wayland에서는 이벤트가 발생할 때 이벤트 루프에 우선순위를 나눠줬어야 하는데 이벤트 루프에서 충돌이 발생해서 발생하는 문제였다.

```rust 
pub struct WindowMaximizeProcess<W: GtkWindowExt + WidgetExt> {
  window: W,
  resizable: bool,
  step: u8,
}

impl<W: GtkWindowExt + WidgetExt> WindowMaximizeProcess<W> {
  pub fn new(window: W, resizable: bool) -> Rc<RefCell<Self>> {
    Rc::new(RefCell::new(Self {
      window,
      resizable,
      step: 0,
    }))
  }

  pub fn next_step(&mut self) -> glib::ControlFlow {
    match self.step {
      0 => {
        self.window.set_resizable(true);
        self.step += 1;
        glib::ControlFlow::Continue
      }
      1 => {
        self.window.maximize();
        self.step += 1;
        glib::ControlFlow::Continue
      }
      2 => {
        self.window.set_resizable(self.resizable);
        glib::ControlFlow::Break
      }
      _ => glib::ControlFlow::Break,
    }
  }
}
```

그래서 최대화전에 `set_resizable(true)`로 바꿔주고 최대화 후에 원래 사용자가 설정한 resizable attribute로 돌려주는 코드를 추가하였다.

## 기여 후기

메인테이너와 많은 논의를 했다. 작업하는 시간대가 달라서 논의하는 시간이 많이 걸렸다.
전체적인 이벤트에서 여러 문제가 발생하고 있었고 문제가 있는 이벤트 루프 전체를 확인하느라 일주일 정도 걸렸다.

정리하자면 총 4개의 주제를 해결했다.

1. 최대화 이벤트시 이벤트 루프 우선순위 충돌 문제
2. 헤더 영역에서 드래그를 통한 창 이동 문제
3. 윈도우 경계에서 드래그를 통한 창 리사이즈 문제
4. Native 환경에서 창 버튼이 없는 문제

최대화 이벤트에 대해서는 처음에 제시한 해결 방법은 최대화 시에 resizable을 확인하고 false면 최대화를 막는 단순한 방법이였지만,
그건 단순히 최대화를 막아버리는 방법이라 메인테이너와 논의할 수록 좀 더 좋은 방법을 생각할 수 있었다.

커스텀 헤더에 관해서는 헤더와 창에 대한 이벤트 부분을 수정하면서 드래그를 통한 리사이즈나 창이동 문제가 해결되었다고 생각했지만,
헤더의 크기와 사이즈를 인식하지 못하는 문제가 생겨서 후속조치가 필요했다.
후속 조치에 대한 PR을 올렸지만 메인테이너가 바쁜지 리뷰에는 오랜 시간이 걸리고 있다.

글로 주고받는 의사소통의 한계를 느꼈고 좀 더 원활한 의사소통을 위한 영어 실력이 더 필요하다는 생각을 했다.