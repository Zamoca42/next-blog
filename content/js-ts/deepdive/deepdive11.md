---
title: 11. 원시 값과 객체의 비교
date: "2023-09-28"
tag:
  - JavaScript
---

자바스크립트에서 값은 크게 원시 타입과 객체 타입으로 구분할 수 있다.

- **원시 타입**의 값은 변경 불가능한 값이며, 변수에 할당될 때 **값에 의한 전달**로 동작한다.
- **객체 타입**의 값은 변경 가능한 값이며, 변수에 할당될 때 **참조에 의한 전달**로 동작한다.

<!-- end -->

## 1. 원시 값

### 변경 불가능한 값

원시 타입의 값은 변경 불가능한 값으로, 한번 생성된 원시 값은 읽기 전용(read only) 값이다.
변수는 언제든지 재할당을 통해 값을 변경할 수 있지만, 원시 값 자체를 변경할 수는 없다.

```js
var str = "string";

// 문자열은 변경 불가능한 값이다.
str[0] = "S";
console.log(str); // "string"
```

이처럼 원시 값을 변경할 수 없는 특성을 **불변성**(immutability)이라 한다.

## 2. 객체

### 변경 가능한 값

객체는 변경 가능한 값이다. 객체를 할당한 변수는 재할당 없이도 객체를 직접 변경할 수 있다.

```js
var person = {
  name: "Lee",
};

// 프로퍼티 값 갱신
person.name = "Kim";

// 프로퍼티 동적 생성
person.address = "Seoul";

console.log(person); // {name: "Kim", address: "Seoul"}
```

### 참조에 의한 전달

객체를 가리키는 변수를 다른 변수에 할당하면 원본의 **참조 값이 복사되어 전달**된다. 이를 **참조에 의한 전달**이라 한다.

```js
var person = {
  name: "Lee",
};

var copy = person;

copy.name = "Kim";

person.address = "Seoul";

console.log(person); // {name: "Kim", address: "Seoul"}
console.log(copy); // {name: "Kim", address: "Seoul"}
```

:::details{title="포인터(pointer)"}
포인터는 프로그래밍 언어에서 변수의 **메모리 공간의 주소를 가리키는 변수**를 말한다.
포인터가 가리키는 값을 가져오는 것을 역참조라고 한다.

[위키백과 - C 언어의 포인터](<https://ko.wikipedia.org/wiki/%ED%8F%AC%EC%9D%B8%ED%84%B0_(%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8D)>)
:::

## 퀴즈

```js
var person1 = {
  name: "Lee",
};

var person2 = {
  name: "Lee",
};

console.log(person1 === person2); // 1
console.log(person1.name === person2.name); // 2
```

1. `person1` 변수와 `person2` 변수가 가리키는 객체는 비록 내용은 같지만 다른 메모리에 저장된 별개의 객체다. 따라서 **false**다.

2. `person1.name`과 `person2.name`은 모두 원시 값 "Lee"로 평가된다. 따라서 **true**다.
