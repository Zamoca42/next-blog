---
title: 17. 생성자 함수에 의한 객체 생성
date: "2023-10-03"
tag:
  - JavaScript
---

이번 장에서는 생성자 함수를 사용하여 객체를 생성하는 방식을 살펴보고, 객체 리터럴을 사용하여 객체를 생성하는 방식과의 장단점을 비교해보자.

<!-- end -->

## 1. `Object` 생성자 함수

new 연산자와 함께 `Object` 생성자 함수를 호출하면 빈 객체를 생성하여 반환한다.

```js
const person = new Object();

person.name = "Lee";
person.sayHello = function () {
  console.log("Hi! My name is " + this.name);
};

console.log(person); // {name: "Lee", sayHello: ƒ}
person.sayHello(); // Hi! My name is Lee
```

여기서 **생성자 함수(constructor)**란 `new` 연산자와 함께 호출하여 객체(인스턴스)를 생성하는 함수를 말하며,  
생성자 함수에 의해 생성된 객체를 **인스턴스(instance)**라 한다.

## 2. 생성자 함수

### 객체 리터럴에 의한 객체 생성 방식의 문제점

객체 리터럴에 의한 객체 생성 방식은 단 하나의 객체만 생성한다. 따라서 동일한 프로퍼티를 갖는 객체를 여러 개 생성해야 할 때는 매번 같은 프로퍼티를 기술해야 해서 비효율적이다.

### 생성자 함수에 의한 객체 생성 방식의 장점

생성자 함수를 사용하면 프로퍼티 구조가 동일한 객체 여러 개를 간편하게 생성할 수 있다.

```js
function Circle(radius) {
  this.radius = radius;
  this.getDiameter = function () {
    return 2 * this.radius;
  };
}

const circle1 = new Circle(5);
const circle2 = new Circle(10);

console.log(circle1.getDiameter()); // 10
console.log(circle2.getDiameter()); // 20
```

:::info{title="this"}

`this`는 객체 자신의 프로퍼티나 메서드를 참조하기 위한 자기 참조 변수(self-referencing variable)다.

`this`가 가리키는 값은 함수 호출 방식에 따라 동적으로 결정된다.

| 함수 호출 방식       | this가 가리키는 값                     |
| :------------------- | :------------------------------------- |
| 일반 함수로서 호출   | 전역 객체                              |
| 메서드로서 호출      | 메서드를 호출한 객체(마침표 앞의 객체) |
| 생성자 함수로서 호출 | 생성자 함수가 (미래에) 생성할 객체     |

:::

### 생성자 함수의 인스턴스 생성 과정

new 연산자와 함께 생성자 함수를 호출하면 다음과 같은 과정을 거쳐 암묵적으로 인스턴스를 생성하고 초기화한 후 반환한다.

1. **인스턴스 생성과 this 바인딩**: 암묵적으로 빈 객체가 생성되고, 이 객체는 `this`에 바인딩 된다.
2. **인스턴스 초기화**: `this`에 바인딩되어 있는 인스턴스에 프로퍼티나 메서드를 추가하고 생성자 함수가 인수로 전달받은 초기값을 인스턴스 프로퍼티에 할당하여 초기화한다.
3. **인스턴스 반환**: 생성자 함수 내부의 모든 처리가 끝나면 완성된 인스턴스가 바인딩된 `this`를 암묵적으로 반환한다.

### 내부 메서드 `[[Call]]`과 `[[Construct]]`

함수는 객체이지만 일반 객체와는 다르게 호출할 수 있다.

함수 객체는 일반 객체가 가지고 있는 내부 슬롯과 메서드 외에도, 함수로서 동작하기 위한 `[[Call]]`, `[[Construct]]` 같은 내부 메서드를 추가로 가지고 있다.

- 함수가 일반 함수로서 호출되면 함수 객체의 내부 메서드 `[[Call]]`이 호출된다.
- new 연산자와 함께 생성자 함수로서 호출되면 내부 메서드 `[[Construct]]`가 호출된다.

### constructor와 non-constructor의 구분

자바스크립트 엔진은 함수 정의를 평가하여 함수 객체를 생성할 때 함수 정의 방식에 따라 함수를 constructor와 non-constructor로 구분한다.

- **constructor**: 함수 선언문, 함수 표현식, 클래스(클래스도 함수다)
- **non-constructor**: 메서드(ES6 메서드 축약 표현), 화살표 함수

### new 연산자

new 연산자와 함께 함수를 호출하면 해당 함수는 생성자 함수로 동작한다. 반대로 new 연산자 없이 생성자 함수를 호출하면 일반 함수로 호출된다.

### new.target

ES6에서는 생성자 함수가 new 연산자 없이 호출되는 것을 방지하기 위해 `new.target`을 지원한다.

new 연산자와 함께 생성자 함수로서 호출되면 함수 내부의 `new.target`은 함수 자신을 가리킨다.
new 연산자 없이 일반 함수로서 호출된 함수 내부의 `new.target`은 `undefined`다.

:::info{title="스코프 세이프 생성자 패턴(scope-safe constructor)"}

`new.target`을 사용할 수 없는 상황이라면 스코프 세이프 생성자 패턴(scope-safe constructor)을 사용할 수 있다.

```js
// Scope-Safe Constructor Pattern
function Circle(radius) {
  // 생성자 함수가 new 연산자와 함께 호출되면 함수의 선두에서 빈 객체를 생성하고
  // this에 바인딩한다. 이때 this와 Circle은 프로토타입에 의해 연결된다.

  // 이 함수가 new 연산자와 함께 호출되지 않았다면 이 시점의 this는 전역 객체 window를 가리킨다.
  // 즉, this와 Circle은 프로토타입에 의해 연결되지 않는다.
  if (!(this instanceof Circle)) {
    // new 연산자와 함께 호출하여 생성된 인스턴스를 반환한다.
    return new Circle(radius);
  }

  this.radius = radius;
  this.getDiameter = function () {
    return 2 * this.radius;
  };
}

// new 연산자 없이 생성자 함수를 호출하여도 생성자 함수로서 호출된다.
const circle = Circle(5);
console.log(circle.getDiameter()); // 10
```

:::

`Object`와 `Function` 생성자 함수는 new 연산자 없이 호출해도 new 연산자와 함께 호출했을 때와 동일하게 동작한다.

하지만 `String`, `Number`, `Boolean` 생성자 함수는 new 연산자 없이 호출하면 생성자 함수가 아닌 형 변환 함수로 동작한다.
