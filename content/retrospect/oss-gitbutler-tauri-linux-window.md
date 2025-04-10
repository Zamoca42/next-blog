---
title: "리눅스 환경 GitButler 앱 최대화 버그 분석과 해결 과정"
star: true
tag:
  - GitButler
  - Linux
  - Open-Source
date: "2024-10-20"
---

## 들어가며

우연히 WSL 환경에서 GitButler를 실행하던 중 앱을 최대화하는 순간 종료되는 현상을 발견했습니다. 이 문제는 단순한 앱 버그가 아닌 Tauri 프레임워크 자체의 문제였고, 수많은 앱에 영향을 미치는 이슈였습니다.  
이 글에서는 문제 발견부터 해결까지의 과정과 겪었던 어려움들을 공유하고자 합니다.  

<!-- end -->

## GitButler와 Tauri 소개
GitButler는 GitHub 창립자인 Scott Chacon이 설립한 회사에서 개발한 Git 클라이언트입니다.  
기존 Git 클라이언트와 달리 브랜치 관리에 혁신적인 접근 방식을 제공하며, 페어소스(Fair-source) 모델을 채택하여 소스 코드가 공개되어 있으면서도 상업적 서비스로 운영되고 있습니다.  
16K 이상의 GitHub 스타를 보유한 인기 프로젝트입니다.

Tauri는 웹 기술(HTML, CSS, JavaScript)로 데스크톱 애플리케이션을 개발할 수 있는 크로스 플랫폼 프레임워크입니다.  
Electron의 대안으로 주목받고 있으며, Rust 기반으로 개발되어 성능과 보안 측면에서 강점을 가지고 있습니다.  
90K 이상의 GitHub 스타를 보유한 대형 오픈소스 프로젝트로, GitButler를 포함한 수많은 데스크톱 애플리케이션이 이 프레임워크를 기반으로 구축되고 있습니다.  

## 문제 발견

리눅스 환경에서 GitButler 앱을 실행하고 창을 최대화하는 순간, 다음과 같은 에러 메시지와 함께 앱이 종료되었습니다.

```
Gdk-Message: Error 71 (Protocol error) dispatching to Wayland display.
wl_display@1.error(xdg_wm_base@20, 4, "xdg_surface buffer (1160 x 757) does not match the configured maximized state (0 x 0)")
```

이 오류는 Wayland 프로토콜 관련 문제로, GitButler의 이슈 트래커에 이미 여러 사용자가 보고한 상태였습니다.

## 문제 분석의 어려움

### 1. 복잡한 의존성 구조

GitButler 코드를 처음 분석했을 때 다음과 같은 플러그인을 사용하고 있음을 발견했습니다.  

```rust
.plugin(tauri_plugin_window_state::Builder::default().build())
```

문제가 이 플러그인에서 발생한다고 생각했으나, 실제로는 더 깊은 의존성인 Tauri의 Tao 라이브러리까지 문제가 이어져 있었습니다.  

### 2. Wayland 프로토콜 이해의 어려움

Wayland는 리눅스 환경의 디스플레이 서버 프로토콜로, 이에 대한 사전 지식이 없었기 때문에 문제 이해에 많은 시간이 필요했습니다.  
특히 maximize와 관련된 내용을 문서를 찾아내느라 시간이 많이 걸렸습니다.   

```xml
<!-- 복잡한 Wayland 프로토콜 정의 -->
  <request name="set_max_size">
      <description summary="set the maximum size">
	Set a maximum size for the window.

	The client can specify a maximum size so that the compositor does
	not try to configure the window beyond this size.

	The width and height arguments are in window geometry coordinates.
	See xdg_surface.set_window_geometry.

	Values set in this way are double-buffered, see wl_surface.commit.

	The compositor can use this information to allow or disallow
	different states like maximize or fullscreen and draw accurate
	animations.

	Similarly, a tiling window manager may use this information to
	place and resize client windows in a more effective way.

	The client should not rely on the compositor to obey the maximum
	size. The compositor may decide to ignore the values set by the
	client and request a larger size.

	If never set, or a value of zero in the request, means that the
	client has no expected maximum size in the given dimension.
	As a result, a client wishing to reset the maximum size
	to an unspecified state can use zero for width and height in the
	request.

	Requesting a maximum size to be smaller than the minimum size of
	a surface is illegal and will result in an invalid_size error.

	The width and height must be greater than or equal to zero. Using
	strictly negative values for width or height will result in a
	invalid_size error.
      </description>
      <arg name="width" type="int"/>
      <arg name="height" type="int"/>
    </request>

```

### 3. 로그 분석

`WAYLAND_DEBUG=1` 환경 변수를 설정하고 앱을 실행하면 다음과 같은 로그가 생성됩니다.

```
[3521097.278] -> xdg_toplevel@22.set_maximized()
[3521097.300] -> xdg_toplevel@22.unset_fullscreen()
[3521098.399] xdg_toplevel@22.configure(0, 0, array[4])
[3521098.410] xdg_surface@21.configure(900)
[3521101.568] -> xdg_toplevel@22.set_min_size(900, 587)
[3521101.586] -> xdg_toplevel@22.set_max_size(3840, 2160)
[3521101.617] -> xdg_surface@21.set_window_geometry(0, 0, 1160, 757)
```

가장 어려웠던 점은 Tauri에서 5분마다 창 관리 관련 이벤트(최대화, 최소화, 창 크기 조정, 포커스 변경 등)를 수차례 실행하여 저장된 로그들을 비교분석하는 과정이었습니다.  
각 이벤트마다 정상 케이스와 오류 케이스의 차이점을 찾기 위해 모든 이벤트를 실행하고 비교하면서 분석한 로그가 100만 줄 이상 되었습니다.  
이 로그 중에서 패턴 차이를 발견하기 위해 여러 로그 파일을 교차 비교하고, 특정 이벤트 시퀀스를 추적하는 과정이 어려웠습니다.

## 문제 해결 과정

### 1. 임시 우회 방법 구현

먼저 GitButler에서 리눅스 환경일 때 문제가 되는 플러그인을 비활성화하는 임시 해결책을 제안했습니다:

```rust
#[cfg(not(target_os = "linux"))]
let builder = builder.plugin(tauri_plugin_window_state::Builder::default().build());
```

이 PR은 승인되었지만, 근본적인 해결책이 아니라는 것을 알고 있었습니다.

### 2. 근본 원인 파악

로그 분석과 Tao 라이브러리 코드 검토를 통해 두 가지 핵심 문제를 발견했습니다:

1. 최대화 전에 `set_resizable(false)`로 설정된 경우, 최대화 작업(resize의 일종)이 Wayland 프로토콜 위반을 일으킴
2. Wayland에서 이벤트 루프의 우선순위 처리 문제로 인한 경쟁 상태(race condition) 발생

이 중에서도 특히 난해했던 부분은 이벤트 루프 문제였습니다. GTK와 Wayland의 이벤트 처리 방식의 차이로 인해 특정 순서로 이벤트가 처리되어야 했지만, 그렇지 않아 문제가 발생했습니다.

### 3. 해결책 제안

Tao 라이브러리에 다음과 같은 해결책을 제안했습니다.

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
        // 1단계: 최대화 전에 항상 resizable을 true로 설정
        self.window.set_resizable(true);
        self.step += 1;
        glib::ControlFlow::Continue
      }
      1 => {
        // 2단계: 최대화 실행
        self.window.maximize();
        self.step += 1;
        glib::ControlFlow::Continue
      }
      2 => {
        // 3단계: 원래 resizable 속성으로 복원
        self.window.set_resizable(self.resizable);
        glib::ControlFlow::Break
      }
      _ => glib::ControlFlow::Break,
    }
  }
}
```

이 상태 머신은 최대화 과정을 세 단계로 나누어 처리합니다:
1. 최대화 전에 창을 항상 resizable하게 변경
2. 최대화 수행
3. 원래의 resizable 상태로 복원

또한 이벤트 루프 우선순위 설정도 추가했습니다:

```rust
// GTK 이벤트 루프에 적절한 우선순위 설정
glib::idle_add_local_once(move || {
  let process = WindowMaximizeProcess::new(window.clone(), window.is_resizable());
  glib::idle_add_local(move || {
    process.borrow_mut().next_step()
  });
});
```

### 4. 코드 리뷰와 반복 개선

PR을 제출한 후 메인테이너와 여러 차례 피드백을 주고받으며 코드를 개선했습니다. 

특히 어려웠던 점들은

1. 시간대 차이로 인한 커뮤니케이션 지연
2. 영어로 복잡한 기술적 이슈를 설명하는 어려움
3. 다양한 리눅스 환경에서의 테스트 필요성

30건 이상의 코멘트와 수정을 거치며, 최초 제안했던 해결책이 점점 더 견고해졌습니다.  
특히 경쟁 상태를 방지하기 위한 이벤트 처리 방식에 대해 많은 논의가 있었습니다.

## 추가 발견 문제와 해결

디버깅 과정에서 다음과 같은 추가 문제들도 발견했습니다.

1. 헤더 영역에서 드래그를 통한 창 이동 문제
2. 윈도우 경계에서 드래그를 통한 창 리사이즈 문제
3. 네이티브 환경에서 창 버튼이 없는 문제

이 문제들을 해결하기 위해 헤더와 창 경계 관련 이벤트 처리 로직도 개선했습니다.

## 배운 점과 어려웠던 점

### 기술적 어려움

1. **복잡한 프로토콜 이해**: Wayland 프로토콜은 문서화가 잘 되어 있지만 매우 복잡합니다. 특히 이벤트 핸들링 방식을 이해하는 데 많은 시간이 필요했습니다.

2. **방대한 로그 분석**: 1ms마다 기록된 이벤트 로그는 그 양이 방대해서, 패턴을 찾기 위해 각 이벤트마다 로그를 정리하고 비교하는 작업이 필요했습니다.

3. **다양한 환경 테스트**: 다양한 리눅스 배포판과 데스크톱 환경에서 모두 테스트해야 했기 때문에 여러 가상 머신을 설정하고 테스트하는 과정이 필요했습니다.

### 개인적 도전

1. **지속적인 끈기**: 3일 동안 계속해서 같은 문제를 파고들면서 포기하지 않는 끈기가 필요했습니다. 특히 여러 번 접근법을 바꿔가며 시도했을 때의 좌절감을 극복하는 것이 어려웠습니다.

2. **효과적인 커뮤니케이션**: 메인테이너와의 의사소통에서 기술적 내용을 명확하게 전달하는 것이 중요했습니다. 특히 영어로 복잡한 내용을 설명할 때의 어려움이 있었습니다.

3. **학습 곡선**: Rust, GTK, Wayland 등 여러 기술 스택을 동시에 학습해야 했기 때문에 학습 곡선이 가파를 수밖에 없었습니다.

## 성과와 의미

이 문제 해결을 통해 다음과 같은 성과를 얻었습니다.

1. GitButler(16K stars)와 같은 실제 서비스에 직접 기여
2. Tauri 프레임워크(90K stars)의 핵심 버그 해결
3. 20명 이상의 개발자가 3개월 넘게 해결하지 못했던 이슈를 해결
4. 리눅스 윈도우 시스템과 Wayland 프로토콜에 대한 이해 획득

## 마치며

이번 경험은 단순한 버그 수정을 넘어, 깊은 기술적 이해와 끈기의 중요성을 일깨워 주었습니다.  
처음에는 단순해 보였던 문제가 점점 깊어지면서 여러 기술 스택과 프로토콜에 대한 이해가 필요했고, 이 과정에서 많은 도전과 좌절을 경험했습니다.  

하지만 결국 근본적인 문제를 해결했을 때의 성취감은 그 어떤 것과도 바꿀 수 없는 값진 경험이었습니다.  
특히 혼자서 끙끙대기보다는 커뮤니티와 함께 문제를 해결해 나가는 것의 중요성을 깨달았습니다.  

앞으로도 이런 경험을 바탕으로 오픈소스에 더 많이 기여하고, 기술적 문제 해결 과정을 공유하고 싶습니다.

## 참고 자료

- GitButler PR: https://github.com/gitbutlerapp/gitbutler/pull/4864
- Tauri Tao PR: https://github.com/tauri-apps/tao/pull/979
- Wayland 프로토콜: https://gitlab.freedesktop.org/wayland/wayland-protocols