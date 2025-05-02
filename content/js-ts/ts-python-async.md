---
title: "TypeScript, Python에서의 비동기 I/O의 이해와 비교"
tag:
  - Python
  - TypeScript
  - Async
date: "2025-05-02"
---

## 비동기 I/O란 무엇인가?

### 기본 개념

비동기 I/O는 입출력 작업을 요청한 후 완료를 기다리지 않고 다른 작업을 수행할 수 있게 해주는 프로그래밍 패턴입니다. 이는 시스템 자원을 효율적으로 활용하고 응답성을 높이는 데 도움이 됩니다.

### 동기 vs 비동기

동기 방식에서는 I/O 작업이 완료될 때까지 프로그램이 멈춰 있어야 합니다. 이런 블로킹 동작은 리소스 낭비로 이어질 수 있죠. 

```
🔄 동기 I/O: "네가 끝날 때까지 나는 아무것도 못 해"
🔀 비동기 I/O: "할 일 맡겨놓고 나는 다른 일 하다가 완료되면 알려줘"
```

<!-- end -->

### 블로킹/논블로킹 vs 동기/비동기

이 두 개념은 혼동되기 쉽지만 다른 개념입니다.

- **블로킹/논블로킹**: 함수의 제어권 반환 시점과 관련
- **동기/비동기**: 작업의 완료 순서와 관련

> 💡 가끔 혼동되는 이 두 개념을 구분하기 위한 쉬운 방법은, 블로킹/논블로킹은 "내가 기다려야 하는가?"라는 질문에 대한 답이고, 동기/비동기는 "작업이 언제 완료되는지 내가 관리하는가?"라는 질문에 대한 답이라고 생각하는 것입니다.

## TypeScript와 Python의 비동기 처리 비교

### TypeScript: Promise와 async/await

TypeScript는 JavaScript의 비동기 모델을 기반으로 하면서 정적 타입 시스템을 추가해 코드의 안전성을 높여줍니다.

```typescript
// Promise를 사용한 비동기 코드 예시
function fetchUserData(userId: string): Promise<UserData> {
    return new Promise((resolve, reject) => {
        // API 호출 로직
        if (success) {
            resolve(userData);
        } else {
            reject(new Error("사용자 데이터를 가져오는 데 실패했습니다"));
        }
    });
}

// async/await를 사용한 간결한 비동기 처리
async function getUserInfo(userId: string): Promise<UserInfo> {
    try {
        const userData = await fetchUserData(userId);
        const userPosts = await fetchUserPosts(userId);
        return { ...userData, posts: userPosts };
    } catch (error) {
        console.error("사용자 정보 조회 실패:", error);
        throw error;
    }
}
```

### Python: asyncio와 코루틴

Python은 asyncio 라이브러리와 코루틴을 통해 비동기 프로그래밍을 지원합니다.

```python
import asyncio

async def fetch_user_data(user_id):
    # API 호출 로직 (aiohttp 등 사용)
    await asyncio.sleep(1)  # 네트워크 지연 시뮬레이션
    return {"id": user_id, "name": "사용자"}

async def fetch_user_posts(user_id):
    await asyncio.sleep(0.5)
    return [{"title": "첫 번째 포스트"}, {"title": "두 번째 포스트"}]

async def get_user_info(user_id):
    # 두 작업을 동시에 실행
    user_data_task = asyncio.create_task(fetch_user_data(user_id))
    user_posts_task = asyncio.create_task(fetch_user_posts(user_id))
    
    user_data = await user_data_task
    user_posts = await user_posts_task
    
    return {**user_data, "posts": user_posts}

# 비동기 함수 실행
result = asyncio.run(get_user_info("user123"))
```

### 핵심 차이점

두 언어의 비동기 처리에는 몇 가지 주요 차이점이 있습니다.

1. **이벤트 루프**:
   - TypeScript(Node.js): libuv 라이브러리로 구현된 단일 이벤트 루프 사용
   - Python: asyncio 내부에 구현된 이벤트 루프 사용, 개발자가 직접 제어 가능

2. **비동기 모델**:
   - TypeScript: Promise 기반 모델에 정적 타입 추가
   - Python: 제너레이터 기반에서 발전한 네이티브 코루틴 사용

3. **GIL(Global Interpreter Lock)**:
   - TypeScript: 싱글 스레드 모델이지만 GIL 같은 제약 없음
   - Python: GIL의 영향으로 I/O 바운드에는 강점, CPU 바운드에는 약점

## Python 코루틴의 내부 동작 원리

### 코루틴과 제너레이터의 관계

Python의 코루틴은 제너레이터에서 발전했습니다. 코루틴의 핵심은 실행을 일시 중지하고 나중에 재개할 수 있는 능력입니다.

```python
# 제너레이터 기반 코루틴 (Python 3.4 이전)
@asyncio.coroutine
def old_style_coroutine():
    yield from asyncio.sleep(1)
    return "결과"

# 네이티브 코루틴 (Python 3.5+)
async def modern_coroutine():
    await asyncio.sleep(1)
    return "결과"
```

### 이벤트 루프의 동작 방식

이벤트 루프는 비동기 프로그램의 심장과 같습니다. Python의 이벤트 루프는 다음과 같이 동작합니다.

1. 코루틴을 태스크로 변환
2. 준비된 태스크 실행 (ready 상태)
3. 블로킹 작업을 만나면 태스크 일시 중단 (waiting 상태)
4. 다른 준비된 태스크로 전환
5. I/O 작업 완료 시 해당 태스크를 다시 ready 상태로 변경

### 시각적 이해를 위한 예제

다음 코드의 실행 흐름을 시각화해 보겠습니다:

```python
import asyncio

async def task_a():
    print("A: 시작")
    await asyncio.sleep(2)  # I/O 작업 시뮬레이션
    print("A: 완료")
    return "A 결과"

async def task_b():
    print("B: 시작")
    await asyncio.sleep(1)  # I/O 작업 시뮬레이션
    print("B: 완료")
    return "B 결과"

async def main():
    # 두 태스크 동시 실행
    results = await asyncio.gather(task_a(), task_b())
    print(f"결과: {results}")

asyncio.run(main())
```

**실행 타임라인**

```
시간(초) | 실행 중인 코루틴 | 이벤트
--------|----------------|----------
   0    |     main       | 시작
   0    |     task_a     | "A: 시작" 출력, sleep(2) 요청 후 중단
   0    |     task_b     | "B: 시작" 출력, sleep(1) 요청 후 중단
   1    |     task_b     | 깨어남, "B: 완료" 출력, 결과 반환
   2    |     task_a     | 깨어남, "A: 완료" 출력, 결과 반환
   2    |     main       | gather 완료, 결과 출력
```

> 🔍 **주목할 점**: 순차 실행했다면 3초가 걸렸을 작업이 비동기 실행으로 2초만에 완료됩니다. 태스크가 많아질수록 이 효율성은 더 커집니다!

## 실전 응용 사례

### TypeScript 비동기 API 호출 최적화

```typescript
// 여러 API 동시 호출 최적화
async function fetchDashboardData(userId: string) {
    // Promise.all로 여러 API 호출을 병렬 처리
    const [userProfile, notifications, recentActivity] = await Promise.all([
        fetchUserProfile(userId),
        fetchNotifications(userId),
        fetchRecentActivity(userId)
    ]);
    
    return { userProfile, notifications, recentActivity };
}
```

### Python aiohttp를 사용한 비동기 웹 크롤링

```python
import asyncio
import aiohttp

async def fetch_url(session, url):
    async with session.get(url) as response:
        return await response.text()

async def crawl_websites(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
        return results

# 수십 개의 웹사이트 동시 크롤링
urls = ["https://example1.com", "https://example2.com", ...]
results = asyncio.run(crawl_websites(urls))
```

## 마치며

TypeScript와 Python은 각각 고유한 방식으로 비동기 프로그래밍을 지원하며, 두 언어 모두 개발자가 효율적인 비동기 코드를 작성할 수 있는 강력한 도구를 제공합니다.

TypeScript는 JavaScript의 비동기 모델과 Promise에 정적 타입 시스템을 결합하여 타입 안전성을 제공합니다. Python은 코루틴과 asyncio 라이브러리를 통해 직관적이고 표현력 있는 비동기 프로그래밍 모델을 제공합니다.

특히 Python의 코루틴은 제너레이터에서 발전한 강력한 메커니즘으로, 복잡한 비동기 작업을 단순하고 직관적인 코드로 표현할 수 있게 해줍니다. 
이벤트 루프와의 통합을 통해 Python은 효율적인 비동기 I/O 처리가 가능하며, 이는 웹 서버, 데이터베이스 연결, 네트워크 애플리케이션 등 다양한 영역에서 활용됩니다.