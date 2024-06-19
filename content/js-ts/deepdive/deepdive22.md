---
title: 22. this
date: "2023-10-14"
tag:
  - JavaScript
---

## 1. this 키워드

메서드에서 자신이 속한 객체의 프로퍼티를 참조하려면 자신이 속한 객체를 가리키는 식별자를 사용해야 한다.  
이때 사용되는 것이 this 키워드다.

```js
const circle = {
  radius: 5,
  getDiameter() {
    return 2 * this.radius;
  },
};

console.log(circle.getDiameter()); // 10
```

<!-- end -->

this는 자신이 속한 객체 또는 자신이 생성할 인스턴스를 가리키는 자기 참조 변수(self-referencing variable)로, 자바스크립트 엔진에 의해 암묵적으로 생성된다.

this는 상황에 따라 가리키는 대상이 다른 동적인 값이다.

```js
// 전역에서 this는 전역 객체 window를 가리킨다.
console.log(this); // window

function square(number) {
  // 일반 함수 내부에서 this는 전역 객체 window를 가리킨다.
  console.log(this); // window
  return number * number;
}

const person = {
  name: "Lee",
  getName() {
    // 메서드 내부에서 this는 메서드를 호출한 객체를 가리킨다.
    console.log(this); // {name: "Lee", getName: ƒ}
    return this.name;
  },
};

function Person(name) {
  this.name = name;
  // 생성자 함수 내부에서 this는 생성자 함수가 생성할 인스턴스를 가리킨다.
  console.log(this); // Person {name: "Lee"}
}
```

## 2. 함수 호출 방식과 this 바인딩

this 바인딩은 함수 호출 방식에 따라 동적으로 결정된다.

- 일반 함수 호출
- 메서드 호출
- 생성자 함수 호출
- Function.prototype.apply/call/bind 메서드에 의한 간접 호출

### 일반 함수 호출

일반 함수로 호출하면 함수 내부의 this에는 전역 객체가 바인딩된다.

```js
function foo() {
  console.log("foo's this: ", this); // window
  function bar() {
    console.log("bar's this: ", this); // window
  }
  bar();
}
foo();
```

strict mode가 적용된 일반 함수 내부의 this에는 undefined가 바인딩된다.

콜백 함수가 일반 함수로 호출되면 콜백 함수 내부의 this에도 전역 객체가 바인딩된다.

이 문제를 해결하기 위한 방법은 크게 3가지가 있다.

1. that 변수 활용
2. apply/call/bind 메서드 활용
3. 화살표 함수 활용

### 메서드 호출

메서드 내부의 this는 메서드를 소유한 객체가 아닌 메서드를 호출한 객체에 바인딩된다.

```js
const person = {
  name: "Lee",
  getName() {
    return this.name;
  },
};

console.log(person.getName()); // Lee
```

프로토타입 메서드 내부에서 사용된 this도 일반 메서드와 마찬가지로 해당 메서드를 호출한 객체에 바인딩된다.

```js
function Person(name) {
  this.name = name;
}

Person.prototype.getName = function () {
  return this.name;
};
```

### 생성자 함수 호출

생성자 함수 내부의 this에는 생성자 함수가 (미래에) 생성할 인스턴스가 바인딩된다.

```js
function Person(name) {
  // 생성자 함수 내부의 this는 생성자 함수가 생성할 인스턴스를 가리킨다.
  this.name = name;
}

const me = new Person("Lee");
```

### Function.prototype.apply/call/bind 메서드에 의한 간접 호출

apply, call, bind 메서드는 Function.prototype 의 메서드로, 모든 함수가 상속받아 사용할 수 있다.

![그림 22-4. apply, call, bind 메서드는 모든 함수가 상속받아 사용할 수 있다.](https://github.com/Zamoca42/blog/assets/96982072/ad0ef02b-67a3-4d12-888d-2e85e4fb129a)

apply와 call 메서드는 함수를 호출하면서 첫 번째 인수로 전달한 특정 객체를 호출한 함수의 this에 바인딩 한다.

```js
function getThisBinding() {
  return this;
}

const thisArg = { a: 1 };

console.log(getThisBinding()); // window

console.log(getThisBinding.apply(thisArg)); // {a: 1}
console.log(getThisBinding.call(thisArg)); // {a: 1}
```

bind 메서드는 apply와 call 메서드와 달리 함수를 호출하지 않고 this로 사용할 객체만 전달한다.

```js
function getThisBinding() {
  return this;
}

const thisArg = { a: 1 };

console.log(getThisBinding.bind(thisArg)); // getThisBinding
console.log(getThisBinding.bind(thisArg)()); // {a: 1}
```

bind 메서드는 메서드의 this와 메서드 내부의 중첩 함수 또는 콜백 함수의 this가 불일치하는 문제를 해결하기 위해 유용하게 사용된다.

```js
const person = {
  name: "Lee",
  foo(callback) {
    setTimeout(callback.bind(this), 100);
  },
};

person.foo(function () {
  console.log(`Hi! my name is ${this.name}.`); // Hi! my name is Lee.
});
```

함수 호출 방식에 따른 this 바인딩 정리:

| 함수 호출 방식         | this 바인딩                   |
| ---------------------- | ----------------------------- |
| 일반 함수              | 전역 객체                     |
| 메서드                 | 메서드를 호출한 객체          |
| 생성자 함수            | 생성자 함수가 생성할 인스턴스 |
| apply/call/bind 메서드 | 첫번째 인수로 전달한 객체     |
