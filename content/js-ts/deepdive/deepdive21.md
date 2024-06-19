---
title: 21. 빌트인 객체
date: "2023-10-12"
tag:
  - JavaScript
---

## 1. 자바스크립트 객체의 분류

자바스크립트 객체는 다음과 같이 크게 3개의 객체로 분류할 수 있다.

- 표준 빌트인 객체: ECMAScript 사양에 정의된 객체
- 호스트 객체: 브라우저나 Node.js 환경에서 제공하는 객체
- 사용자 정의 객체

## 2. 표준 빌트인 객체

자바스크립트는 Object, String, Number, Boolean, Symbol, Date, Math, Function, Promise, JSON, Error 등  
40여 개의 표준 빌트인 객체를 제공한다.

Math, Reflect, JSON을 제외한 표준 빌트인 객체는 모두 인스턴스를 생성할 수 있는 생성자 함수이다.

생성자 함수인 표준 빌트인 객체는 프로토타입 메서드와 정적 메서드를 제공하고, 표준 빌트인 객체는 정적 메서드만 제공한다.

```js
const strObj = new String("Lee");
console.log(typeof strObj); // object
```

생성자 함수인 표준 빌트인 객체가 생성한 인스턴스의 프로토타입은 표준 빌트인 객체의 prototype 프로퍼티에 바인딩된 객체다.

## 3. 원시값과 래퍼 객체

문자열, 숫자, 불리언 등의 원시값이 있는데도 String, Number, Boolean 등의 표준 빌트인 생성자 함수가 존재하는 이유는 원시값을 객체처럼 사용하기 위해서다.
원시값을 객체처럼 사용하면 자바스크립트 엔진이 일시적으로 원시값을 연관된 객체로 변환해 준다.

```js
const str = "hello";

console.log(str.length); // 5
console.log(str.toUpperCase()); // HELLO
```

이처럼 문자열, 숫자, 불리언 값에 대해 객체처럼 접근하면 생성되는 임시 객체를 래퍼 객체(wrapper object)라 한다.

![그림 21-1. 문자열 래퍼 객체의 프로토타입 체인](https://github.com/Zamoca42/blog/assets/96982072/70a79933-b286-4cc0-90ba-8a91f89c22da)

따라서 String, Number, Boolean 생성자 함수를 new 연산자와 함께 호출하여 문자열, 숫자, 불리언 인스턴스를 생성할 필요가 없으며 권장하지도 않는다.
null과 undefined는 래퍼 객체를 생성하지 않는다.

## 4. 전역 객체

전역 객체는 코드가 실행되기 이전 단계에 자바스크립트 엔진에 의해 어떤 객체보다도 먼저 생성되는 특수한 객체이며, 어떤 객체에도 속하지 않은 최상위 객체다.

브라우저 환경에서는 window가 Node.js 환경에서는 global이 전역 객체를 가리킨다.
ECMAScript2020(ES11)에서 도입된 globalThis는 브라우저 환경과 Node.js 환경에서 전역 객체를 가리키던 다양한 식별자를 통일한 식별자다.

전역 객체의 특징은 다음과 같다.

- 전역 객체는 개발자가 의도적으로 생성할 수 없다. 즉, 전역 객체를 생성할 수 있는 생성자 함수가 제공되지 않는다.
- 전역 객체의 프로퍼티를 참조할 때 window(또는 global)를 생략할 수 있다.
- 전역 객체는 Object, String, Number, Boolean, Function, Array, RegExp, Date, Math, Promise 등
  모든 표준 빌트인 객체를 프로퍼티로 가지고 있다.
- 자바스크립트 실행 환경(브라우저 또는 Node.js 환경)에 따라 추가적인 프로퍼티와 메서드를 가지고 있다.
- var 키워드로 선언한 전역 변수와 선언하지 않은 변수에 값을 할당한 암묵적 전역, 그리고 전역 함수는 전역 객체의 프로퍼티가 된다.
- let이나 const 키워드로 선언한 전역 변수는 전역 객체의 프로퍼티가 아니다.
- 브라우저 환경의 모든 자바스크립트 코드는 하나의 전역 객체 window를 공유한다.

### 빌트인 전역 프로퍼티

- **Infinity** : 양/음의 무한대를 나타내는 숫자값 Infinity를 갖는다.
- **NaN** : 숫자가 아님(Not-a-Number)을 나타내는 숫자값 NaN을 갖는다.
- **undefined** : 원시 타입 undefined를 값으로 갖는다.

### 빌트인 전역 함수

- **eval** : 매개변수에 전달된 문자열 코드를 런타임에 평가 또는 실행한다.
- **isFinite** : 매개변수에 전달된 값이 정상적인 유한수인지 검사하여 그 결과를 Boolean으로 반환한다.
- **isNaN** : 매개변수에 전달된 값이 NaN인지 검사하여 그 결과를 Boolean으로 반환한다.
- **parseFloat** : 매개변수에 전달된 문자열을 부동 소수점 숫자(floating point number), 즉 실수로 해석하여 반환한다.
- **parseInt** : 매개변수에 전달된 문자열을 정수(Integer)로 해석하여 반환한다.
- **encodeURI / decodeURI** : encodeURI 함수는 매개변수로 전달받은 URI를 인코딩한다. decodeURI 함수는 매개변수로 전달받은 URI을 디코딩한다.
- **encodeURIComponent / decodeURIComponent** : encodeURIComponent 함수는 매개변수로 전달받은 URI 구성요소를 인코딩한다.
  decodeURIComponent 함수는 매개변수로 전달받은 URI 구성요소를 디코딩한다.

### 암묵적 전역

선언하지 않은 식별자에 값을 할당하면 전역 객체의 프로퍼티가 되어 마치 전역 변수처럼 동작한다. 이를 암묵적 전역이라 한다.

```js
var x = 10;

function foo() {
  y = 20;
}
foo();

console.log(x + y); // 30
```

foo 함수 내에서 선언하지 않은 변수 y에 값을 할당하면, 자바스크립트 엔진은 y를 전역 객체의 프로퍼티로 동적 생성한다.
따라서 y는 전역 변수처럼 동작하게 된다. 암묵적 전역은 오류를 발생시키는 원인이 될 수 있으므로 var, let, const 키워드를 사용하여 변수를 선언한 다음 사용해야 한다.
