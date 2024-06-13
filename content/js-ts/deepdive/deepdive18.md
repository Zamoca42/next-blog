---
title: 18. 함수와 일급 객체
date: "2023-10-04"
tag:
  - JavaScript
---

## 1. 일급 객체

자바스크립트의 함수는 다음 조건을 모두 만족하는 **일급 객체**다.

1. 런타임에 생성이 가능하다.
2. 변수나 자료구조(객체, 배열 등)에 저장할 수 있다.
3. 함수의 매개변수에 전달할 수 있다.
4. 함수의 반환값으로 사용할 수 있다.

<!-- end -->

함수가 일급 객체라는 것은 함수를 객체와 동일하게 사용할 수 있다는 의미다. 즉, 함수는 값과 동일하게 취급할 수 있다.

```js
// 1. 함수는 무명의 리터럴로 생성할 수 있다.
// 2. 함수는 변수에 저장할 수 있다.
const increase = function (num) {
  return ++num;
};

const decrease = function (num) {
  return --num;
};

// 2. 함수는 객체에 저장할 수 있다.
const auxs = { increase, decrease };

// 3. 함수의 매개변수에 전달할 수 있다.
// 4. 함수의 반환값으로 사용할 수 있다.
function makeCounter(aux) {
  let num = 0;

  return function () {
    num = aux(num);
    return num;
  };
}

// 3. 함수는 매개변수에게 함수를 전달할 수 있다.
const increaser = makeCounter(auxs.increase);
console.log(increaser()); // 1
console.log(increaser()); // 2

const decreaser = makeCounter(auxs.decrease);
console.log(decreaser()); // -1
console.log(decreaser()); // -2
```

## 2. 함수 객체의 프로퍼티

함수는 객체이지만 일반 객체와는 차이가 있다.

1. 일반 객체는 호출할 수 없지만 함수 객체는 호출할 수 있다.
2. 함수 객체는 일반 객체에는 없는 함수 고유의 프로퍼티를 소유한다.

![그림 18-1. 함수 객체의 프로퍼티](https://github.com/Zamoca42/blog/assets/96982072/4366580f-c9b0-4227-bc1e-9c2cd3f99a5a)

`arguments`, `caller`, `length`, `name`, `prototype` 프로퍼티는 모두 함수 객체의 데이터 프로퍼티다.  
하지만 `__proto__`는 접근자 프로퍼티며, 함수 객체의 고유 프로퍼티가 아니라 `Object.prototype` 객체의 프로퍼티를 상속받은 것이다.

### arguments 프로퍼티

함수 객체의 `arguments` 프로퍼티 값은 **arguments 객체**다.  
arguments 객체는 함수 호출 시 전달된 인수들의 정보를 담고 있는 순회 가능한 유사 배열 객체이며, 함수 내부에서 지역 변수처럼 사용된다.

```js
function multiply(x, y) {
  console.log(arguments);
  return x * y;
}

console.log(multiply()); // NaN
console.log(multiply(1)); // NaN
console.log(multiply(1, 2)); // 2
console.log(multiply(1, 2, 3)); // 2
```

`arguments` 객체는 매개변수 개수를 확정할 수 없는 **가변 인자 함수**를 구현할 때 유용하다.

arguments 객체는 배열이 아니므로 배열 메서드를 사용할 경우 에러가 발생한다. 이러한 번거로움을 해결하기 위해 ES6에서는 Rest 파라미터를 도입했다.

```js
// ES6 Rest parameter
function sum(...args) {
  return args.reduce((pre, cur) => pre + cur, 0);
}

console.log(sum(1, 2)); // 3
console.log(sum(1, 2, 3, 4, 5)); // 15
```

### length 프로퍼티

함수 객체의 `length` 프로퍼티는 함수를 정의할 때 선언한 매개변수의 개수를 가리킨다.

### name 프로퍼티

함수 객체의 `name` 프로퍼티는 함수 이름을 나타낸다. `name` 프로퍼티는 ES6에서 정식 표준이 되었다.

### `__proto__` 접근자 프로퍼티

모든 객체는 `[[Prototype]]`이라는 내부 슬롯을 갖는다.  
`__proto__` 프로퍼티는 `[[Prototype]]` 내부 슬롯이 가리키는 프로토타입 객체에 접근하기 위해 사용하는 접근자 프로퍼티다.

```js
const obj = { a: 1 };

// 객체 리터럴 방식으로 생성한 객체의 프로토타입 객체는 Object.prototype이다.
console.log(obj.__proto__ === Object.prototype); // true
```

### prototype 프로퍼티

`prototype` 프로퍼티는 생성자 함수로 호출할 수 있는 함수 객체, 즉 constructor만이 소유하는 프로퍼티다.  
non-constructor에는 `prototype` 프로퍼티가 없다.

```js
// 함수 객체는 prototype 프로퍼티를 소유한다.
(function () {}).hasOwnProperty("prototype"); // -> true

// 일반 객체는 prototype 프로퍼티를 소유하지 않는다.
({}).hasOwnProperty("prototype"); // -> false
```
