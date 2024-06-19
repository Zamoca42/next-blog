---
title: 20. strict mode
date: "2023-10-11"
tag:
  - JavaScript
---

## 1. strict mode란?

strict mode는 자바스크립트 언어의 문법을 좀 더 엄격히 적용하여 오류를 발생시킬 가능성이 높거나
자바스크립트 엔진의 최적화 작업에 문제를 일으킬 수 있는 코드에 대해 명시적인 에러를 발생시킨다.

예를 들어, 선언하지 않은 변수를 참조하면 암묵적으로 전역 변수가 생성되는 현상(암묵적 전역)은 오류를 발생시키는 원인이 될 수 있다. strict mode에서는 이를 에러로 인식한다.

<!-- end -->

## 2. strict mode의 적용

strict mode를 적용하려면 전역의 선두 또는 함수 몸체의 선두에 `'use strict';`를 추가한다.

```js
"use strict";

function foo() {
  x = 10; // ReferenceError: x is not defined
}
foo();
```

함수 몸체의 선두에 추가하면 해당 함수와 중첩 함수에 strict mode가 적용된다.

```js
function foo() {
  "use strict";

  x = 10; // ReferenceError: x is not defined
}
foo();
```

## 3. 전역에 strict mode를 적용하는 것은 피하자

전역에 적용한 strict mode는 스크립트 단위로 적용된다.

하지만 strict mode 스크립트와 non-strict mode 스크립트를 혼용하는 것은 오류를 발생시킬 수 있다.
특히 외부 서드파티 라이브러리를 사용하는 경우, 라이브러리가 non-strict mode인 경우도 있기 때문에 전역에 strict mode를 적용하는 것은 바람직하지 않다.

대신 즉시 실행 함수로 스크립트 전체를 감싸서 스코프를 구분하고 즉시 실행 함수의 선두에 strict mode를 적용한다.

```js
// 즉시 실행 함수의 선두에 strict mode 적용
(function () {
  "use strict";

  // Do something...
})();
```

## 4. 함수 단위로 strict mode를 적용하는 것도 피하자

함수 단위로도 strict mode를 적용할 수 있지만, 어떤 함수는 strict mode를 적용하고 어떤 함수는 그렇지 않은 것은 바람직하지 않다.
또한 모든 함수에 일일이 strict mode를 적용하는 것도 번거로운 일이다.

```js
(function () {
  // non-strict mode
  var lеt = 10; // 에러가 발생하지 않는다.

  function foo() {
    "use strict";

    let = 20; // SyntaxError: Unexpected strict mode reserved word
  }
  foo();
})();
```

따라서 strict mode는 즉시 실행 함수로 감싼 스크립트 단위로 적용하는 것이 바람직하다.

## 5. strict mode가 발생시키는 에러

### 암묵적 전역

선언하지 않은 변수를 참조하면 `ReferenceError`가 발생한다.

```js
(function () {
  "use strict";

  x = 1;
  console.log(x); // ReferenceError: x is not defined
})();
```

### 변수, 함수, 매개변수의 삭제

`delete` 연산자로 변수, 함수, 매개변수를 삭제하면 `SyntaxError`가 발생한다.

### 매개변수 이름의 중복

중복된 매개변수 이름을 사용하면 `SyntaxError`가 발생한다.

### `with` 문의 사용

`with` 문을 사용하면 `SyntaxError`가 발생한다.

## 6. strict mode 적용에 의한 변화

### 일반 함수의 `this`

strict mode에서 함수를 일반 함수로서 호출하면 `this`에 `undefined`가 바인딩된다.

```js
(function () {
  "use strict";

  function foo() {
    console.log(this); // undefined
  }
  foo();
})();
```

### arguments 객체

strict mode에서는 매개변수에 전달된 인수를 재할당하여 변경해도 arguments 객체에 반영되지 않는다.

```js
(function (a) {
  "use strict";
  // 매개변수에 전달된 인수를 재할당하여 변경
  a = 2;

  // 변경된 인수가 arguments 객체에 반영되지 않는다.
  console.log(arguments); // { 0: 1, length: 1 }
})(1);
```
