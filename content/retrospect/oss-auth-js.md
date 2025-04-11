---
title: "오픈소스 기여: NextAuth.js 에서 객체 병합 함수 개선하기"
star: true
tag:
  - Authjs
  - Open-Source
date: "2024-09-30"
---

## 시작하며

개발 중에 마주치는 작은 불편함이 종종 의미 있는 기여로 이어지곤 합니다. NextAuth.js를 사용하면서 발견한 한 가지 문제가 PR #11685의 시작점이 되었습니다.

이번 글에서는 NextAuth.js의 객체 병합 함수를 개선한 경험을 공유하려 합니다. 단순한 유틸리티 함수의 변경이지만, 여러 이슈들을 한번에 해결할 수 있었습니다.  
GitHub 이슈 #9448과 #11698에서 확인할 수 있듯이, 다양한 OAuth 제공자(Google, GitHub, Azure AD 등)를 사용하는 많은 개발자들이 비슷한 문제를 겪고 있었거든요.

## 문제 발견

GitHub에서 NextAuth.js의 이슈 #9448을 살펴보던 중, 여러 개발자들이 OAuth 제공자의 스코프 설정 관련 문제를 보고하고 있었습니다.

코드를 분석해보니 원인은 NextAuth.js 내부의 `merge` 함수에 있었습니다.  
이 함수가 객체만 병합할 수 있게 설계되어 있어서, 문자열과 같은 원시 타입을 제대로 처리하지 못하고 있었습니다.  
이러한 제약은 사용자들이 OAuth 제공자 설정을 유연하게 구성하는데 어려움을 주고 있었죠.

구체적으로는 다음과 같은 상황에서 문제가 발생했습니다.

```typescript
// 기본 설정은 객체
const defaultOptions = {
  authorization: {
    params: {
      scope: "openid email profile",
    },
  },
};

// 사용자가 문자열로 덮어쓰려고 할 때
const userOptions = {
  authorization: "https://example.com/auth",
};

// 병합 결과 (의도와 다름)
const result = merge(defaultOptions, userOptions);
// {
//   authorization: {
//     params: { scope: "openid email profile" }
//   }
// }
```

사용자는 `authorization`을 문자열로 완전히 대체하고 싶었지만, 기존 `merge` 함수는 이를 지원하지 않았습니다.

## 기술적 분석

문제의 원인은 `merge` 함수의 구현에 있었습니다. 기존 코드는 다음과 같았습니다.

```typescript
function isObject(item: any): boolean {
  return item && typeof item === "object" && !Array.isArray(item);
}

export function merge(target: any, ...sources: any[]): any {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        merge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return merge(target, ...sources);
}
```

이 코드에는 몇 가지 문제점이 있었습니다.

1. 원시 타입을 객체로 대체할 수 없었습니다.
2. 객체를 원시 타입으로 대체할 수 없었습니다.
3. 타입 체크가 엄격하지 않았습니다.
4. TypeScript 타입 시그니처가 모호했습니다.

## 개선 방안

이러한 문제를 해결하기 위해 다음과 같은 개선을 진행했습니다.

### 1. 더 정확한 타입 체크

```typescript
function isObject(item: unknown): item is object {
  return item !== null && typeof item === "object";
}
```

이제 `isObject` 함수는 타입 가드(type guard)로 작동하며, `null` 체크가 명시적으로 이루어집니다.

### 2. 배열 타입 처리 개선

```typescript
function isArray(item: unknown): item is unknown[] {
  return Array.isArray(item);
}
```

배열 타입을 명확하게 식별하기 위한 별도의 함수를 추가했습니다.

### 3. 타입 시그니처 개선

```typescript
export function merge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Array<Record<string, unknown> | undefined>
): T & Record<string, unknown>;
```

제네릭 타입을 사용하여 입력과 출력 타입 관계를 명확히 했습니다.

### 4. 병합 로직 업데이트

```typescript
export function merge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Array<Record<string, unknown> | undefined>
): T & Record<string, unknown> {
  if (!sources.length) return target;
  const source = sources.shift();

  // Handle undefined sources
  if (source === undefined) {
    return merge(target, ...sources);
  }

  // Handle target and source
  for (const key in source) {
    const sourceValue = source[key];

    if (key in target) {
      const targetValue = target[key];

      // Case: source value is an object (but not array)
      if (isObject(sourceValue) && !isArray(sourceValue)) {
        // Target value is also an object - merge them
        if (isObject(targetValue) && !isArray(targetValue)) {
          target[key] = merge(
            targetValue as Record<string, unknown>,
            sourceValue as Record<string, unknown>
          );
        }
        // Target value is not an object - replace with source
        else {
          target[key] = sourceValue;
        }
      }
      // Case: source value is an array
      else if (isArray(sourceValue)) {
        target[key] = sourceValue;
      }
      // Case: source value is a primitive (or function) - replace target
      else {
        target[key] = sourceValue;
      }
    }
    // Key doesn't exist in target, just add it
    else {
      target[key] = sourceValue;
    }
  }

  return merge(target, ...sources);
}
```

**주요 변경 사항**

- 원시 타입으로 객체를 덮어쓸 수 있음
- 객체로 원시 타입을 덮어쓸 수 있음
- 배열은 항상 통째로 교체됨
- `undefined` 값은 건너뜀

## 테스트 검증

NextAuth.js 코드베이스를 검토하면서 발견한 중요한 점은 `merge` 함수에 대한 전용 테스트 케이스가 없다는 것이었습니다.  
미래에 발생할 수 있는 같은 문제의 재발을 방지하기 위해 새로운 테스트 파일(`merge.test.ts`)을 추가했습니다.

이러한 테스트 케이스는 현재의 이슈를 해결하고, 향후 누군가 이 함수를 수정하더라도 기존 기능이 유지되도록 안전장치 역할을 합니다.

```typescript
describe("merge", () => {
  test("should merge two objects", () => {
    const a = { foo: "bar" };
    const b = { baz: "qux" };
    expect(merge(a, b)).toEqual({ foo: "bar", baz: "qux" });
  });

  test("should override primitive values", () => {
    const a = { foo: "bar" };
    const b = { foo: "baz" };
    expect(merge(a, b)).toEqual({ foo: "baz" });
  });

  // 더 많은 테스트 케이스...
});
```

특히 `authorization` 옵션과 관련된 실제 사용 사례를 집중적으로 테스트했습니다.

```typescript
test("should override object values with string (authorization case)", () => {
  const a = {
    authorization: {
      params: {
        scope: "openid email profile",
      },
    },
  };
  const b = {
    authorization: "https://example.com/oauth/authorize",
  };
  expect(merge(a, b)).toEqual({
    authorization: "https://example.com/oauth/authorize",
  });
});

test("should override string values with object (authorization case)", () => {
  const a = {
    authorization: "https://example.com/oauth/authorize",
  };
  const b = {
    authorization: {
      params: {
        scope: "openid email profile",
      },
    },
  };
  expect(merge(a, b)).toEqual({
    authorization: {
      params: {
        scope: "openid email profile",
      },
    },
  });
});
```

## 마무리

제가 직접 사용하고 있는 라이브러리의 문제점을 해결할 수 있었던 점은 매우 보람찼습니다.  
이슈 댓글들을 통해 Google, GitHub, Azure AD, Auth0 등 다양한 OAuth 제공자를 사용하는 많은 개발자들이 같은 문제로 어려움을 겪고 있었다는 것을 알게 되었고,  
하나의 유틸리티 함수 개선으로 이 모든 사례가 해결되는 것을 보는 것은 정말 뿌듯한 경험이었습니다.

---

_PR #11685: [fix(core): Improve object merging](https://github.com/nextauthjs/next-auth/pull/11685)_  
_관련 이슈: [#9448: Scope not working as expected](https://github.com/nextauthjs/next-auth/issues/9448)_  
_관련 이슈: [#11698: Azure AD Provider - authorization config in the config object is not passed to the final authorization url](https://github.com/nextauthjs/next-auth/issues/11698)_
