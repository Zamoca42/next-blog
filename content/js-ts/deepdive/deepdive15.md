---
title: 15. let, const 키워드와 블록 레벨 스코프
date: "2023-09-30"
tag:
  - JavaScript
---

## 1. var 키워드로 선언한 변수의 문제점

ES5까지 변수를 선언할 수 있는 유일한 방법은 `var` 키워드를 사용하는 것이었다.  
var 키워드로 선언된 변수는 다음과 같은 특징이 있다.

<!-- end -->

### 변수 중복 선언 허용

```js
var x = 1;
var y = 1;

var x = 100;
var y;

console.log(x); // 100
console.log(y); // 1
```

`var` 키워드로 선언한 변수는 중복 선언이 가능하다.

이처럼 `var` 키워드로 선언한 변수를 중복 선언하면 초기화문 유무에 따라 다르게 동작한다.

### 함수 레벨 스코프

`var` 키워드로 선언한 변수는 오로지 함수의 코드 블록만을 지역 스코프로 인정한다.

따라서 함수 외부에서 `var` 키워드로 선언한 변수는 코드 블록 내에서 선언해도 모두 전역 변수가 된다.

```js
var i = 10;

for (var i = 0; i < 5; i++) {
  console.log(i); // 0 1 2 3 4
}

console.log(i); // 5
```

### 변수 호이스팅

```js
console.log(foo); //undefined

foo = 123;

console.log(foo); // 123

var foo;
```

`var` 키워드로 변수를 선언하면 변수 호이스팅에 의해 변수 선언문이 선두로 끌어 올려진 것처럼 동작한다.

단, 할당문 이전에 변수를 참조하면 언제나 `undefined`를 반환한다.

## 2. let 키워드

### 변수 중복 선언 금지

```js
var foo = 123;
var foo = 456;

let bar = 123;
let bar = 456; // SyntaxError: Identifier 'bar' has already been declared
```

let 키워드로 이름이 같은 변수를 중복 선언하면 문법 에러(SyntaxError)가 발생한다.

### 블록 레벨 스코프

```js
let foo = 1; // 전역 변수

{
  let foo = 2; // 지역 변수
  let bar = 3; // 지역 변수
}

console.log(foo); // 1
console.log(bar); // ReferenceError: bar is not defined
```

`let` 키워드로 선언한 변수는 모든 코드 블록을 지역 스코프로 인정하는 블록 레벨 스코프를 따른다.

### 변수 호이스팅

```js
console.log(foo); // ReferenceError: foo is not defined
let foo;
```

`let` 키워드로 선언한 변수는 변수 호이스팅이 발생하지 않는 것처럼 동작한다.

`let` 키워드로 선언한 변수는 "선언 단계"와 "초기화 단계"가 분리되어 진행된다.

스코프의 시작 지점부터 초기화 시작 지점까지 변수를 참조할 수 없는 구간을 **일시적 사각지대(TDZ\: Temporal Dead Zone)**라고 부른다.

![그림 15-3. let 키워드로 선언한 변수의 생명 주기](https://github.com/Zamoca42/blog/assets/96982072/61f5f0d6-c5b7-4dda-b95e-6122a7d06c96)

### 전역 객체와 let

```js
let x = 1;

console.log(window.x); // undefined
console.log(x); // 1
```

`let` 키워드로 선언한 전역 변수는 전역 객체의 프로퍼티가 아니다. 즉, `window.x`와 같이 접근할 수 없다.

## 3. const 키워드

`const`는 상수를 선언하기 위해 사용한다. 하지만 반드시 상수만을 위해 사용하지는 않는다.

### 선언과 초기화

```js
const foo = 1;
```

`const` 키워드로 선언한 변수는 반드시 선언과 동시에 초기화 해야한다.

### 재할당 금지

```js
const foo = 1;
foo = 2; // TypeError: Assignment to constant varialbe
```

`const` 키워드로 선언한 변수는 재할당이 금지된다.

### 상수

```js
const TAX_RATE = 0.1;

let preTaxPrice = 100;
let afterTaxPrice = preTaxPrice + preTaxPrice * TAX_RATE;

console.log(afterTaxPrice); // 110
```

변수의 상대 개념인 **상수는 재할당이 금지된 변수를 말한다.**

상수도 값을 저장하기 위한 메모리 공간이 필요하므로 변수라고 할 수 있다.  
상수는 상태 유지와 가독성, 유지보수의 편의를 위해 적극적으로 사용해야한다.

### const 키워드와 객체

```js
const person = {
  name: "Lee",
};

person.name = "Kim";

console.log(person); // {name: "Kim"}
```

**`const` 키워드로 선언된 변수에 객체를 할당한 경우 값을 변경할 수 있다.**

변경 가능한 값인 객체는 재할당 없이도 직접 변경이 가능하기 때문이다.

**`const` 키워드는 재할당을 금지할 뿐 "불변"을 의미하지 않는다.**

## 4. `var` vs. `let` vs. `const`

변수 선언에는 기본적으로 `const`를 사용하고 `let`은 재할당이 필요한 경우에 한정해 사용하는 것이 좋다.
`const` 키워드를 사용하면 의도치 않은 재할당을 방지하기 때문에 좀 더 안전하다.

- ES6을 사용한다면 `var` 키워드는 사용하지 않는다.
- 재할당이 필요한 경우에 한정해 `let` 키워드를 사용한다. 이때 변수의 스코프는 최대한 좁게 만든다.
- 변경이 발생하지 않고 읽기 전용으로 사용하는 원시 값과 객체에는 `const` 키워드를 사용한다.
