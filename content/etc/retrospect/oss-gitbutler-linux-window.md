---
title: "GitButler - 리눅스 환경에서 실행시 창이 꺼지는 문제 기여 후기"
tag:
  - GitButler
  - Linux
  - Open-Source
---

> 해당 이슈: https://github.com/gitbutlerapp/gitbutler/issues/4039

GitButler를 살펴보다 발견한 이슈는 리눅스 환경에서 최대화를 시도하면 창이 자동으로 꺼지는 문제였다.

링크에서 이슈를 살펴보면 Tauri의 window-state와 관련이 있는거 같긴 했지만 Tauri와 의존된 부분이 많아서 정확히 부분을 찾아야했다.

helpwanted 라벨이 달려있어서 해당 이슈에 기여해보고 싶어졌다.

## 문제 파악

> `Gdk-Message: 10:20:40.636: Error 71 (Protocol error) dispatching to Wayland display.`

디버깅 로그들을 살펴보면 창을 최대화시에 wayland 프로토콜을 위반한다고 발견했다.
어떤 부분을 위반했을까?

앱을 실행할 때 `WAYLAND_DEBUG=1` 환경변수를 추가하면 자세한 로그를 볼 수 있다.

```
Gdk-Message: Error 71 (Protocol error) dispatching to Wayland display.

`wl_display@1.error(xdg_wm_base@20, 4, "xdg_surface buffer (1160 x 757) does not match the configured maximized state (0 x 0)")

[3521097-278] -> xdg_toplevel@22.set._maximized()
[3521097.300] -> xdg_toplevel@22.unset_fullscreen()
[3521098.399] xdg_toplevel@22.configure(0, 0, array[4])
[3521098.410] xdg_surface@21.configure (900)
[3521101.5681] → xdg_toplevel@22.set_min_size(900, 587)
[3521101.586] -> xdg_toplevel@22.set_max_size (3840, 2160)
[3521101.617] -> xdg_surface@21.set_window_geometry(0, 0, 1160, 757)
```

최대화된 상태는 (0, 0)이 되어야 하는데 윈도우 사이즈가 저장된 상태는 (1160, 757)이다.
즉, 픽셀 버퍼의 크기가 맞지 않아 발생한 오류라는 것이다.

## 해결 방법

결론적으로는 최대화된 상태를 저장하는 부분을 수정하면 된다.
하지만 최대화된 윈도우 상태를 저장하는 부분은 GitButler에서는 Tauri의 window-state 플러그인에서 관리하고 있었다.

```rust
.plugin(tauri_plugin_window_state::Builder::default().build())
```

즉, 전체 버그는 Tauri의 window-state 플러그인에서 발생하는 버그라는 것을 알 수 있었다.
실제로 해당 버그는 다른 앱에서도 발생하는 것을 확인할 수 있었다.

> https://github.com/tauri-apps/tauri/issues/10702

일단은 문제를 플러그인을 리눅스에서는 제외하고 테스트하면 프로토콜 에러는 발생하지 않았다.

```rust
#[cfg(not(target_os = "linux"))]
let builder = builder.plugin(tauri_plugin_window_state::Builder::default().build());
```

## 기여 후기

> https://github.com/gitbutlerapp/gitbutler/pull/4864

처음에는 버그를 발견하고 해결했다는 사실이 뿌듯했지만 본질적인 문제는 해결되지 않았다는 사실이 마음에 걸렸다.
이에 대해 Byron이 남긴 코멘트에서 Tauri에서 더 나은 솔루션이 있으면 좋겠다는 의견을 보았고, 
Tauri에서 근본적인 문제를 해결하는 방법을 찾아보기로 결심했다.
