---
title: "GitButler - 이미지 미리보기 기능 기여 후기"
tag:
  - GitButler
  - Git
  - Open-Source
date: "2024-10-21"
---

> 관련 이슈 1: https://github.com/gitbutlerapp/gitbutler/issues/2752  
> 관련 이슈 2: https://github.com/gitbutlerapp/gitbutler/issues/3093

이번 후기는 GitButler에서 바이너리 파일(이미지, 폰트파일 등)을 미리보기 기능을 구현한 것에 대한 후기이다.

![UI에서 미리보기 없이 Binary content not shown을 출력한다](https://github.com/user-attachments/assets/bc6269bd-14c0-4874-afc5-526d8ca82dfa)

관련 이슈를 살펴보면 바이너리 파일을 미리보기 기능을 구현하는 것에 대한 이슈가 있었다.  
UI에서 이미지는 미리보기 기능, 이미지 외의 파일에 대한 사이즈 정보를 보여주는 기능을 구현하는 것이 목표였다.

<!-- end -->

처음에는 프론트에서 로컬 파일의 경로를 읽어와서 보여주면 된다고 생각했다.  
하지만 프론트에서 미리보기를 구현하는건 단순한 문제였고, 백엔드에서 파일을 가져오는 방법에 대한 문제가 고민이 더 필요했다.

## 문제 파악

> 해결 시도: https://github.com/gitbutlerapp/gitbutler/pull/4852  
> 관련 이슈 3: https://github.com/gitbutlerapp/gitbutler/issues/4957

처음에는 프론트에서 로컬 파일을 가져와 보여주는 방법을 시도했다.
Tauri에서 로컬 경로에 대한 파일을 가져와 변환하는 방법을 사용했고 [convertFileSrc](https://v1.tauri.app/v1/api/js/tauri/#convertfilesrc)를 사용하면 파일을 보여줄 수 있다.

이 방법의 문제점은 **파일 경로가 조작되었을 때 보안 문제가 발생할 수 있다는 것이다**.  
클라이언트에서 로컬 파일 경로에 접근을 모두 허용하는 것은 "**경로 조작 공격**"같은 보안 문제가 발생할 수 있다.  
백엔드에서 git 저장소에 대한 파일만 내보내는 방법을 사용하면 로컬에서 경로를 가져오는 방법보다 안전하게 조회할 수 있다.

마침 다른 메인테이너가 git 저장소의 pull request template 파일을 가져오는 함수를 구현하고 있었고,  
이를 활용해 백엔드에서 바이너리 파일을 가져오는 방법을 시도했다.

## 해결 방법

> 해당 PR: https://github.com/gitbutlerapp/gitbutler/pull/5089

### 어려웠던점

처음 Rust 패키지를 설치하는 과정에서 오류를 많이 만났다.

![Rust 패키지 설치 오류](https://github.com/user-attachments/assets/6205275c-1f13-48a9-871b-e0ca404f36a3)

Rust 버전을 nightly로 설정하고 패키지를 설치하면 오류가 발생하지 않았다.  
그 외에 개발환경에 따라 OS가 mac이나 windows인 경우 발생하는 오류가 달랐다.  
개발환경에 따라 패키지 설치 방법이 다른 것은 조금 불편했지만 컴파일 단계에서 오류를 잡아주기 때문에 장점이 더 크다고 믿고싶다.

### 백엔드에서 바이너리 파일을 가져오는 함수 구현

백엔드에서 바이너리 파일을 가져오는 함수를 구현하는 이슈가 다른 사람에게 할당되었고,  
구현 되기를 기다리는데 시간이 걸렸지만 이슈를 할당받은 사람이 로컬 빌드에 실패해서 다시 내가 할당받아 해결했다.

백엔드에서 git 저장소에서 바이너리 파일을 조회하려면 다음과 같은 조건을 고려해야한다.

1. untracked 상태
2. git에 commited된 상태
3. 워크트리와 인덱스에서 삭제된 상태

untracked 상태는 워크트리에 존재하지 않는 상태이고,  
git에 commited된 상태는 워크트리에 존재하는 상태이고,  
워크트리와 인덱스에서 삭제된 상태는 워크트리에 존재하지만 인덱스에 존재하지 않는 상태이다.

정리하면, 각 브랜치에서 파일이 존재하는 상태가 다르기 때문에 각 상태에 따라 파일을 읽어오는 방법이 다르다.  
이미지 파일을 커밋하고 다음 커밋에서 삭제되더라도 이전 커밋을 조회하면 이미지 파일을 조회할 수 있어야한다.

![삭제된 이미지의 이전 커밋 조회](https://github.com/user-attachments/assets/b20ad0bf-8074-4f77-8b54-b135aeb2b944)

그 다음은 파일 이름, 크기, 내용을 blob 형식으로 조회하고 mime type을 infer 패키지를 통해 어떤 타입인지 구분해서 출력하는 기능을 구현했다.

```Rust
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileInfo {
    pub content: String,
    pub name: Option<String>,
    pub size: Option<usize>,
    pub mime_type: Option<String>,
    pub status: FileStatus,
}
```

### 프론트에서 바이너리 파일을 가져오는 함수 구현

나머지는 프론트에서 바이너리 파일을 가져와서 파일 크기를 출력하고, 파일 타입에 따라 이미지일 경우 미리보기 기능을 구현했다.

```javascript:파일사이즈_포맷팅
const KB = 1024;
const MB = 1024 ** 2;
const GB = 1024 ** 3;

function formatFileSize(bytes: number): string {
  if (bytes < KB) return bytes + " B";
  else if (bytes < MB) return (bytes / KB).toFixed(1) + " KB";
  else if (bytes < GB) return (bytes / MB).toFixed(1) + " MB";
  else return (bytes / GB).toFixed(1) + " GB";
}
```

이미지 타입일 경우 미리보기가 제공되지만 나머지는 파일 크기만 출력된다.

```javascript:이미지_미리보기
<div class="hunks">
	{#if isBinary}
		{#if fileInfo.mimeType && fileInfo.content}
			<img src="data:{fileInfo.mimeType};base64,{fileInfo.content}" alt={fileInfo.name} />
		{/if}
		{#if fileInfo.status === 'deleted'}
			<p>File has been deleted</p>
		{:else}
			<p>Size: {formatFileSize(fileInfo.size || 0)}</p>
		{/if}
</div>
```

## 기여 후기

> 후속 조치: https://github.com/gitbutlerapp/gitbutler/pull/5165

![0.13 버전부터 배포되어 미리보기 기능이 추가되었다](https://github.com/user-attachments/assets/4cdd20b2-1f3a-4519-9f90-b1d74cd506d9)

Tauri에 기여한 이후로 몇 번 기여를 했지만 이번 기여가 사용자들의 편의를 증가시키는 기능이라 뿌듯했다.  
이번 기여에서 코드를 보고 리뷰를 받는 것보다 코드를 보는 것이 더 도움이 될 수 있다는 것을 배웠다.

그리고 Rust를 사용하면서 느낀점들은 다음과 같다.

1. 강력한 컴파일러와 타입 시스템

   - 소유권 규칙을 지키지 않으면 컴파일 단계에서 오류 발생
   - 패키지 의존성 문제를 빌드 전에 감지
   - 상세한 오류 메시지로 디버깅이 수월함

2. 메모리 안전성

   - 소유권과 대여 개념으로 메모리 누수 방지
   - 컴파일 타임에 스레드 안전성 보장
   - null 또는 undefined 문제를 Option 타입으로 안전하게 처리

3. 생태계와 도구

   - Cargo를 통한 편리한 패키지 관리
   - infer 같은 유용한 커뮤니티 패키지 활용
   - rust-analyzer의 강력한 IDE 지원

4. 활성화된 커뮤니티

   - Discord를 통한 실시간 질문과 빠른 피드백
   - 메인테이너들의 적극적인 리뷰와 대응
   - 상세한 문서화와 예제 코드 공유

다만 처음에는 소유권 개념과 라이프타임 이해가 어려웠고, 컴파일러와 싸우는 시간이 많았다. 하지만 이런 제약사항들이 오히려 오류 없는 코드를 작성하는데 도움이 되었다고 생각한다.
