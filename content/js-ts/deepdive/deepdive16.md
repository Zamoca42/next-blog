---
title: 16. 프로퍼티 어트리뷰트
date: "2023-10-01"
tag:
  - JavaScript
---

## 1. 내부 슬롯과 내부 메서드

내부 슬롯과 내부 메서드는 자바스크립트 엔진의 구현 알고리즘을 설명하기 위해 ECMAScript 사양에서 사용하는 의사 프로퍼티와 의사 메서드다.

ECMAScript 사양에 등장하는 이중 대괄호(`[[...]]`)으로 감싼 이름들이 내부 슬롯과 내부 메서드다.

<!-- end -->

![그림 16-1. 내부 슬롯과 내부 메서드](https://github.com/Zamoca42/blog/assets/96982072/3f224dcd-f0d8-42f5-a713-7dded3781068)

내부 슬롯과 내부 메서드는 자바스크립트 엔진에서 실제로 동작하지만 개발자가 직접 접근할 수 있는 방법은 원칙적으로 제공하지 않는다.  
단, 일부는 간접적으로 접근할 수 있는 수단을 제공한다.

## 2. 프로퍼티 어트리뷰트와 프로퍼티 디스크립터 객체

자바스크립트 엔진은 프로퍼티를 생성할 때 프로퍼티의 상태를 나타내는 프로퍼티 어트리뷰트를 기본값으로 자동 정의한다.  
프로퍼티의 상태란 프로퍼티의 값(value), 값의 갱신 가능 여부(writable), 열거 가능 여부(enumerable), 재정의 가능 여부(configurable)를 말한다.

`Object.getOwnPropertyDescriptor` 메서드를 사용하면 간접적으로 프로퍼티 어트리뷰트 정보를 확인할 수 있다.

```js
const person = {
  name: "Lee",
};

console.log(Object.getOwnPropertyDescriptor(person, "name"));
// {value: "Lee", writable: true, enumerable: true, configurable: true}
```

`Object.getOwnPropertyDescriptor` 메서드는 프로퍼티 어트리뷰트 정보를 제공하는 프로퍼티 디스크립터(Property Descriptor) 객체를 반환한다.

ES8에서는 모든 프로퍼티의 프로퍼티 어트리뷰트 정보를 제공하는 `Object.getOwnPropertyDescriptors` 메서드도 도입되었다.

## 3. 데이터 프로퍼티와 접근자 프로퍼티

프로퍼티는 데이터 프로퍼티와 접근자 프로퍼티로 구분할 수 있다.

- **데이터 프로퍼티**: 키와 값으로 구성된 일반적인 프로퍼티다.
- **접근자 프로퍼티**: 자체적으로는 값을 갖지 않고 다른 데이터 프로퍼티의 값을 읽거나 저장할 때 호출되는 접근자 함수로 구성된 프로퍼티다.

### 데이터 프로퍼티

데이터 프로퍼티는 다음과 같은 프로퍼티 어트리뷰트를 갖는다.

- `[[Value]]`
- `[[Writable]]`
- `[[Enumerable]]`
- `[[Configurable]]`

### 접근자 프로퍼티

접근자 프로퍼티는 다음과 같은 프로퍼티 어트리뷰트를 갖는다.

- `[[Get]]`
- `[[Set]]`
- `[[Enumerable]]`
- `[[Configurable]]`

```js
const person = {
  firstName: "Ungmo",
  lastName: "Lee",

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  },

  set fullName(name) {
    [this.firstName, this.lastName] = name.split(" ");
  },
};

person.fullName = "Heegun Lee";
console.log(person); // {firstName: "Heegun", lastName: "Lee"}
```

fullName은 접근자 함수로 구성된 접근자 프로퍼티다. 접근자 프로퍼티는 자체적으로 값을 가지지 않고 다른 데이터 프로퍼티의 값을 읽거나 저장할 때 사용된다.

## 4. 프로퍼티 정의

프로퍼티 정의란 새로운 프로퍼티를 추가하면서 프로퍼티 어트리뷰트를 명시적으로 정의하거나, 기존 프로퍼티의 프로퍼티 어트리뷰트를 재정의하는 것을 말한다.

`Object.defineProperty` 메서드를 사용하면 프로퍼티의 어트리뷰트를 정의할 수 있다.

```js
const person = {};

Object.defineProperty(person, "firstName", {
  value: "Ungmo",
  writable: true,
  enumerable: true,
  configurable: true,
});

Object.defineProperty(person, "lastName", {
  value: "Lee",
});

console.log(Object.getOwnPropertyDescriptor(person, "firstName"));
// {value: "Ungmo", writable: true, enumerable: true, configurable: true}

console.log(Object.getOwnPropertyDescriptor(person, "lastName"));
// {value: "Lee", writable: false, enumerable: false, configurable: false}
```

`Object.defineProperty` 메서드로 프로퍼티를 정의할 때 프로퍼티 디스크립터 객체의 프로퍼티를 일부 생략할 수 있다. 생략된 어트리뷰트는 기본값이 적용된다.

한번에 여러 개의 프로퍼티를 정의하려면 `Object.defineProperties` 메서드를 사용한다.

## 5. 객체 변경 방지

자바스크립트는 객체의 변경을 방지하는 다양한 메서드를 제공한다.

| 구분           | 메서드                   | 프로퍼티 추가 | 프로퍼티 삭제 | 프로퍼티 값 읽기 | 프로퍼티 값 쓰기 | 프로퍼티 어트리뷰트 재정의 |
| :------------- | :----------------------- | :-----------: | :-----------: | :--------------: | :--------------: | :------------------------: |
| 객체 확장 금지 | Object.preventExtensions |       ✕       |       ○       |        ○         |        ○         |             ○              |
| 객체 밀봉      | Object.seal              |       ✕       |       ✕       |        ○         |        ○         |             ✕              |
| 객체 동결      | Object.freeze            |       ✕       |       ✕       |        ○         |        ✕         |             ✕              |

### 객체 확장 금지

`Object.preventExtensions` 메서드는 객체의 확장을 금지한다. 즉, 프로퍼티 추가가 금지된다.

### 객체 밀봉

`Object.seal` 메서드는 객체를 밀봉한다. 객체 밀봉이란 프로퍼티 추가 및 삭제와 프로퍼티 어트리뷰트 재정의를 금지한다. 즉, 프로퍼티 값 읽기와 쓰기만 가능하다.

### 객체 동결

`Object.freeze` 메서드는 객체를 동결한다. 객체 동결이란 프로퍼티 추가 및 삭제와 프로퍼티 어트리뷰트 재정의 금지, 프로퍼티 값 쓰기를 금지한다.  
즉, 프로퍼티 값 읽기만 가능하다.

```js
const person = { name: "Lee" };

Object.freeze(person);

console.log(Object.isFrozen(person)); // true

person.name = "Kim"; // 무시. strict mode에서는 에러
console.log(person); // {name: "Lee"}
```

### 불변 객체

`Object.freeze` 메서드로 객체를 동결하여도 중첩 객체까지 동결할 수는 없다.
객체의 중첩 객체까지 동결하여 변경이 불가능한 읽기 전용의 불변 객체를 구현하려면 객체를 값으로 갖는 모든 프로퍼티에 대해  
재귀적으로 `Object.freeze` 메서드를 호출해야 한다.

```js
function deepFreeze(target) {
  if (target && typeof target === "object" && !Object.isFrozen(target)) {
    Object.freeze(target);
    Object.keys(target).forEach((key) => deepFreeze(target[key]));
  }
  return target;
}

const person = {
  name: "Lee",
  address: { city: "Seoul" },
};

deepFreeze(person);

console.log(Object.isFrozen(person)); // true
console.log(Object.isFrozen(person.address)); // true

person.address.city = "Busan"; // 무시
console.log(person); // {name: "Lee", address: {city: "Seoul"}}
```
