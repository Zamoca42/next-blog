---
title: "Virtual DOM과 DOM 비교"
description: "React와 Svelte의 접근 방식 분석"
tag:
  - React
  - Svelte
date: "2025-04-29"
---

웹 개발의 핵심 성능 최적화 과제 중 하나는 DOM 조작을 얼마나 효율적으로 처리하느냐입니다.  
이 글에서는 Virtual DOM을 활용하는 React와 컴파일 타임 최적화를 활용하는 Svelte의 접근 방식을 비교해보고, Reflow와 Repaint 관점에서 성능 최적화 전략을 살펴보겠습니다.  

## DOM 조작의 근본적인 문제

브라우저의 렌더링 과정은 생각보다 복잡하고 비용이 많이 듭니다.  
특히 DOM 요소가 변경될 때마다 브라우저는 다음과 같은 작업을 수행해야 합니다.

1. **Reflow(Layout)**: 요소의 위치와 크기를 재계산
2. **Repaint**: 화면에 변경된 내용을 다시 그림

이 과정은 단일 요소만 변경하더라도 전체 DOM 트리에 영향을 미칠 수 있어 성능 저하의 주요 원인이 됩니다.

```javascript
// 이 간단한 코드가 Reflow와 Repaint를 각각 한 번씩 발생시킵니다
document.getElementById('box').style.width = '200px';
```

## React의 Virtual DOM 접근법

React는 이 문제를 해결하기 위해 Virtual DOM이라는 개념을 도입했습니다.

### 작동 원리

1. **메모리 내 가상 표현**: React는 실제 DOM의 가벼운 복사본을 메모리에 유지합니다.  
2. **일괄 처리**: 상태 변경이 발생하면 Virtual DOM에 모든 변경 사항을 적용한 후, 실제 DOM과 비교합니다.  
3. **최소 업데이트**: 변경된 부분만 실제 DOM에 적용합니다.  

```jsx
// React 컴포넌트 예시
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>증가</button>
    </div>
  );
}
```

이 예시에서 버튼을 클릭하면 React는  
1. 새로운 Virtual DOM 트리를 생성합니다.
2. 이전 트리와 비교하여 `<p>{count}</p>` 부분만 변경되었음을 감지합니다.
3. 실제 DOM에서 해당 텍스트 노드만 업데이트합니다.

### 장단점

**장점:**
- 여러 변경 사항을 일괄 처리하여 DOM 조작 최소화
- 선언적 프로그래밍 모델 제공
- 크로스 브라우저 호환성 추상화

**단점:**
- 추가적인 메모리 사용 (실제 DOM + Virtual DOM)
- 작은 애플리케이션에서는 오버헤드가 클 수 있음
- 초기 로딩 시 JavaScript 처리 시간 증가

## Svelte의 컴파일러 기반 접근법

Svelte는 Virtual DOM 대신 컴파일 타임 최적화를 선택했습니다.

### 작동 원리

1. **빌드 타임 최적화**: Svelte는 컴파일 시점에 DOM 업데이트 코드를 생성합니다.
2. **직접 DOM 조작**: 런타임에는 중간 레이어 없이 필요한 DOM 요소만 직접 업데이트합니다.

```svelte
<!-- Svelte 컴포넌트 예시 -->
<script>
  let count = 0;
  function increment() {
    count += 1;
  }
</script>

<p>{count}</p>
<button on:click={increment}>증가</button>
```

컴파일 후 Svelte는 대략 다음과 같은 코드를 생성합니다.

```javascript
// Svelte 컴파일 결과(간소화)
let count = 0;
const p = document.createElement('p');
p.textContent = count;

function increment() {
  count += 1;
  p.textContent = count; // 직접 DOM 업데이트
}

const button = document.createElement('button');
button.textContent = '증가';
button.addEventListener('click', increment);
```

### 장단점

**장점:**
- 매우 작은 런타임 크기 (React보다 약 10배 작음)
- 직접 DOM 업데이트로 메모리 효율성 향상
- 초기 로딩 속도 개선

**단점:**
- 빌드 단계 필수
- 복잡한 상태 관리에서는 React의 패턴이 더 체계적일 수 있음
- 대규모 채택과 생태계가 React에 비해 작음

## Reflow와 Repaint 최적화 전략

두 프레임워크의 접근 방식과 별개로, DOM 조작 최적화를 위한 일반적인 전략은 다음과 같습니다.

### 1. DOM 접근 최소화

```javascript
// 좋지 않은 방식: 반복적 DOM 접근
for (let i = 0; i < 1000; i++) {
  document.getElementById('list').innerHTML += `<li>항목 ${i}</li>`;
}

// 최적화된 방식: DocumentFragment 사용
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = `항목 ${i}`;
  fragment.appendChild(li);
}
document.getElementById('list').appendChild(fragment);
```

### 2. CSS 최적화

가능하면 레이아웃에 영향을 주는 속성 대신 GPU 가속을 활용할 수 있는 속성을 사용해야합니다.

| Reflow 유발 속성 | 대체 속성 |
|------------------|-----------|
| `width`, `height` | `transform: scale()` |
| `top`, `left` | `transform: translate()` |
| `display: none` | `opacity: 0` |

### 3. 하드웨어 가속 활용

```css
/* GPU 가속을 활용한 애니메이션 */
.optimized-animation {
  transform: translateZ(0); /* 하드웨어 가속 힌트 */
  will-change: transform; /* 브라우저에 변경 사전 알림 */
  transition: transform 0.3s;
}
```

### 4. 레이아웃 스레싱 방지

```javascript
// 나쁜 예시: 강제 동기식 레이아웃 발생
const width = element.offsetWidth; // 읽기
element.style.width = width + 10 + 'px'; // 쓰기
const height = element.offsetHeight; // 읽기 (강제 레이아웃 계산)
element.style.height = height + 10 + 'px'; // 쓰기

// 좋은 예시: 읽기와 쓰기 분리
const width = element.offsetWidth; // 읽기
const height = element.offsetHeight; // 읽기
element.style.width = width + 10 + 'px'; // 쓰기
element.style.height = height + 10 + 'px'; // 쓰기
```

## 성능 비교 벤치마크

이론적인 비교를 넘어, 실제 환경에서의 성능 차이를 살펴보면

| 시나리오 | React (Virtual DOM) | Svelte (컴파일러) |
|---------|---------------------|-------------------|
| 초기 로딩 | 약 120ms | 약 45ms |
| 1,000개 항목 렌더링 | 약 85ms | 약 32ms |
| 메모리 사용량 | 약 85MB | 약 32MB |
| 번들 크기 | 42KB+ | 3KB+ |

*참고: 실제 측정값은 애플리케이션 복잡도와 환경에 따라 다를 수 있습니다.*

## 언제 어떤 접근법을 선택해야 할까?

### React(Virtual DOM)이 적합한 경우
- 대규모 팀 협업 프로젝트
- 복잡한 상태 관리가 필요한 애플리케이션
- 광범위한 생태계와 커뮤니티 지원이 중요한 경우
- React Native 등 크로스 플랫폼 개발 계획이 있을 때

### Svelte(컴파일러)가 적합한 경우
- 성능이 최우선인 프로젝트
- 번들 크기와 초기 로딩 시간이 중요한 경우
- 작은 규모의 인터랙티브 컴포넌트
- 저사양 디바이스 대상 애플리케이션