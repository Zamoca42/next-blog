---
title: 19. 프로토타입
date: "2023-10-05"
tag:
  - JavaScript
---

자바스크립트는 프로토타입을 기반으로 상속을 구현하여 객체 지향 프로그래밍 능력을 지니고 있다.

<!-- end -->

## 1. 객체지향 프로그래밍

객체지향 프로그래밍은 실세계의 실체를 인식하는 철학적 사고를 프로그래밍에 접목하려는 시도에서 시작하였다.
실체는 특징이나 성질을 나타내는 속성(attribute/property)을 가지고 있고, 이를 통해 실체를 인식하거나 구별할 수 있다.

예를 들어, 사람은 이름, 주소, 나이, 직업 등 다양한 속성을 갖는다. 이러한 다양한 속성 중에서 필요한 속성만 간추려 내는 것을 **추상화(abstraction)**라 한다.

![그림 19-1. 객체와 프로토타입과 생성자 함수는 서로 연결되어 있다.](https://github.com/Zamoca42/blog/assets/96982072/acf4b8a2-7f4a-478e-9063-896927d4877d)

객체지향 프로그래밍은 객체의 **상태**를 나타내는 데이터와 상태 데이터를 조작할 수 있는 **동작**을 하나의 논리적인 단위로 묶어 생각한다.
이때 객체의 상태 데이터를 프로퍼티(property), 동작을 메서드(method)라 부른다.

## 2. 상속과 프로토타입

상속(inheritance)은 객체지향 프로그래밍의 핵심 개념으로, 어떤 객체의 프로퍼티 또는 메서드를 다른 객체가 상속받아 그대로 사용할 수 있는 것을 말한다.
자바스크립트는 프로토타입을 기반으로 상속을 구현하여 불필요한 중복을 제거한다.

![그림 19-2. 상속에 의한 메서드 공유](https://github.com/Zamoca42/blog/assets/96982072/2e28ebe4-b7ae-404c-b232-0a89df2cfb74)

`Circle` 생성자 함수가 생성한 모든 인스턴스는 자신의 프로토타입, 즉 상위(부모) 객체 역할을 하는 `Circle.prototype`의 모든 프로퍼티와 메서드를 상속받는다.

상속은 코드의 재사용이란 관점에서 유용하다.

## 3. 프로토타입 객체

프로토타입 객체란 객체지향 프로그래밍의 근간을 이루는 객체 간 상속을 구현하기 위해 사용된다.
프로토타입은 어떤 객체의 상위(부모) 객체의 역할을 하는 객체로서 다른 객체에 공유 프로퍼티를 제공한다.

모든 객체는 `[[Prototype]]` 이라는 내부 슬롯을 가지며, 이 내부 슬롯의 값은 프로토타입의 참조다.
`[[Prototype]]`에 저장되는 프로토타입은 객체 생성 방식에 의해 결정된다.
즉, 객체가 생성될 때 객체 생성 방식에 따라 프로토타입이 결정되고 `[[Prototype]]`에 저장된다.

모든 객체는 하나의 프로토타입을 갖는다. 그리고 모든 프로토타입은 생성자 함수와 연결되어 있다.

### `__proto__` 접근자 프로퍼티

모든 객체는 `__proto__` 접근자 프로퍼티를 통해 자신의 프로토타입에 간접적으로 접근할 수 있다.

```js
const person = { name: "Lee" };

// person 객체는 __proto__ 프로퍼티를 소유하지 않는다.
console.log(person.hasOwnProperty("__proto__")); // false

// __proto__ 프로퍼티는 모든 객체의 프로토타입 객체인 Object.prototype의 접근자 프로퍼티다.
console.log(Object.getOwnPropertyDescriptor(Object.prototype, "__proto__"));
// {get: ƒ, set: ƒ, enumerable: false, configurable: true}
```

`__proto__` 접근자 프로퍼티는 객체가 직접 소유하는 프로퍼티가 아니라 `Object.prototype`의 프로퍼티다.
모든 객체는 상속을 통해 `Object.prototype.__proto__` 접근자 프로퍼티를 사용할 수 있다.

### prototype 프로퍼티

함수 객체만이 소유하는 prototype 프로퍼티는 생성자 함수가 생성할 인스턴스의 프로토타입을 가리킨다.

| 구분                        | 소유        | 값                                | 사용 주체   | 사용 목적                                                                    |
| --------------------------- | ----------- | --------------------------------- | ----------- | ---------------------------------------------------------------------------- |
| `__proto__` 접근자 프로퍼티 | 모든 객체   | 프로토타입의 참조                 | 모든 객체   | 객체가 자신의 프로토타입에 접근 또는 교체하기 위해 사용                      |
| prototype 프로퍼티          | constructor | 프로토타입으로 교체할 객체의 참조 | 생성자 함수 | 생성자 함수가 자신이 생성할 객체(인스턴스)의 프로토타입을 할당하기 위해 사용 |

```js
// 생성자 함수
function Person(name) {
  this.name = name;
}

const me = new Person("Lee");

// 결국 Person.prototype과 me.__proto__는 결국 동일한 프로토타입을 가리킨다.
console.log(Person.prototype === me.__proto__); // true
```

![그림 19-7. 객체의 **proto** 접근자 프로퍼티와 함수 객체의 prototype 프로퍼티는 결국 동일한 프로토타입을 가리킨다.](https://github.com/Zamoca42/blog/assets/96982072/f0ebfda7-7532-4a04-bd79-19f1fc4bc9dc)

### 프로토타입의 constructor 프로퍼티와 생성자 함수

모든 프로토타입은 constructor 프로퍼티를 갖는다.
이 constructor 프로퍼티는 prototype 프로퍼티로 자신을 참조하고 있는 생성자 함수를 가리킨다.
이 연결은 생성자 함수가 생성될 때 이뤄진다.

![그림 19-8. 프로토타입의 constructor 프로퍼티](https://github.com/Zamoca42/blog/assets/96982072/2a448388-1f1c-4da8-8531-46d46717308d)

## 4. 리터럴 표기법에 의해 생성된 객체의 생성자 함수와 프로토타입

```js
// obj 객체는 Object 생성자 함수로 생성한 객체가 아니라 객체 리터럴로 생성했다.
const obj = {};

// 하지만 obj 객체의 생성자 함수는 Object 생성자 함수다.
console.log(obj.constructor === Object); // true
```

객체 리터럴에 의해 생성된 객체는 Object.prototype을 프로토타입으로 갖게 되며, 이로써 Object.prototype을 상속받는다.

## 5. 프로토타입의 생성 시점

### 사용자 정의 생성자 함수와 프로토타입 생성 시점

생성자 함수로서 호출할 수 있는 함수(constructor)는 함수 정의가 평가되어 함수 객체를 생성하는 시점에 프로토타입도 더불어 생성된다.

### 빌트인 생성자 함수와 프로토타입 생성 시점

Object, String, Number, Function, Array 등과 같은 빌트인 생성자 함수도 일반 함수와 마찬가지로 빌트인 생성자 함수가 생성되는 시점에 프로토타입이 생성된다.
모든 빌트인 생성자 함수는 전역 객체가 생성되는 시점에 생성된다.

![그림 19-13. Object 생성자 함수와 프로토타입](https://github.com/Zamoca42/blog/assets/96982072/d619b6f5-b231-42c7-99ed-bb4239d0dd38)

## 6. 객체 생성 방식과 프로토타입의 결정

객체는 다음과 같이 다양한 생성 방법이 있다.

- 객체 리터럴
- Object 생성자 함수
- 생성자 함수
- Object.create 메서드
- 클래스(ES6)

객체 리터럴에 의해 생성된 객체와 Object 생성자 함수에 의해 생성된 객체의 프로토타입은 Object.prototype이다.
생성자 함수에 의해 생성된 객체의 프로토타입은 생성자 함수의 prototype 프로퍼티에 바인딩된 객체이다.

## 7. 프로토타입 체인

자바스크립트는 객체의 프로퍼티에 접근하려고 할 때, 해당 객체에 접근하려는 프로퍼티가 없다면
`[[Prototype]]` 내부 슬롯의 참조를 따라 자신의 부모 역할을 하는 프로토타입의 프로퍼티를 순차적으로 검색한다.
이것을 프로토타입 체인이라고 한다.

![그림 19-18. 프로토타입 체인](https://github.com/Zamoca42/blog/assets/96982072/95b6e198-e0cb-4f65-be2e-3992d0302fe0)

## 8. 오버라이딩과 프로퍼티 섀도잉

![그림 19-19. 오버라이딩과 프로퍼티 섀도잉](https://github.com/Zamoca42/blog/assets/96982072/6a87e851-8831-4091-89a3-42d6bd732096)

프로토타입 프로퍼티와 같은 이름의 프로퍼티를 인스턴스에 추가하면, 프로토타입 체인을 따라 프로토타입 프로퍼티를 검색하여 덮어쓰는 것이 아니라 인스턴스 프로퍼티로 추가한다.

이때 인스턴스 메서드 `sayHello`는 프로토타입 메서드 `sayHello`를 오버라이딩했고 프로토타입 메서드 `sayHello`는 가려진다.
이처럼 상속 관계에 의해 프로퍼티가 가려지는 현상을 프로퍼티 섀도잉(property shadowing)이라 한다.

하위 객체를 통해 프로토타입의 프로퍼티를 변경 또는 삭제하는 것은 불가능하다.
다시 말해 하위 객체를 통해 프로토타입에 get 액세스는 허용되나 set 액세스는 허용되지 않는다.

## 9. 프로토타입의 교체

### 생성자 함수에 의한 프로토타입의 교체

![그림 19-20. 생성자 함수에 의한 프로토타입 교체](https://github.com/Zamoca42/blog/assets/96982072/15e23de0-5e55-49e4-91b9-78f268f0699f)

### 인스턴스에 의한 프로토타입의 교체

![그림 19-21. 인스턴스에 의한 프로토타입의 교체](https://github.com/Zamoca42/blog/assets/96982072/42b8010e-f390-4798-9546-ae3e2f7eb4f3)

![그림 19-22. 프로토타입 교체 방식에 의해 발생하는 차이](https://github.com/Zamoca42/blog/assets/96982072/acbb95b4-c32d-4922-8e5d-09f4ae3dff15)

## 10. instanceof 연산자

```js
객체 instanceof 생성자 함수
```

우변의 생성자 함수의 prototype에 바인딩된 객체가 좌변의 객체의 프로토타입 체인 상에 존재하면 true로 평가되고, 그렇지 않은 경우 false로 평가된다.

![그림 19-23. instanceof 연산자](https://github.com/Zamoca42/blog/assets/96982072/857da284-85bb-4f14-9470-dfa341ca8571)

## 11. 직접 상속

Object.create 메서드는 명시적으로 프로토타입을 지정하여 새로운 객체를 생성한다.

```js
let obj = Object.create(null);

obj = Object.create(Object.prototype);

obj = Object.create(Object.prototype, {
  x: { value: 1, writable: true, enumerable: true, configurable: true },
});

const myProto = { x: 10 };

obj = Object.create(myProto);

function Person(name) {
  this.name = name;
}

obj = Object.create(Person.prototype);
obj.name = "Lee";
```

Object.create 메서드의 장점은 다음과 같다.

- new 연산자 없이도 객체를 생성할 수 있다.
- 프로토타입을 지정하면서 객체를 생성할 수 있다.
- 객체 리터럴에 의해 생성된 객체도 상속받을 수 있다.

### 객체 리터럴 내부에서 `__proto__`에 의한 직접 상속

ES6에서는 객체 리터럴 내부에서 `__proto__` 접근자 프로퍼티를 사용하여 직접 상속을 구현할 수 있다.

```js
const myProto = { x: 10 };

const obj = {
  y: 20,
  __proto__: myProto,
};
```

## 12. 정적 프로퍼티/메서드

정적(static) 프로퍼티/메서드는 생성자 함수로 인스턴스를 생성하지 않아도 참조/호출할 수 있는 프로퍼티/메서드를 말한다.

![그림 19-24. 정적 프로퍼티/메서드](https://github.com/Zamoca42/blog/assets/96982072/2ff3f64d-7471-4e73-9aeb-bd8da2c38b73)

정적 프로퍼티/메서드는 생성자 함수가 생성한 인스턴스로 참조/호출할 수 없다.

![그림 19-25. MDN(https://developer.mozilla.org)](https://github.com/Zamoca42/blog/assets/96982072/f7b69a07-1fc0-452a-b6f7-f5bd92ef0763)

## 13. 프로퍼티 존재 확인

### in 연산자

in 연산자는 객체 내에 특정 프로퍼티가 존재하는지 여부를 확인한다.

```js
key in object;
```

### Object.prototype.hasOwnProperty 메서드

Object.prototype.hasOwnProperty 메서드를 사용해도 객체에 특정 프로퍼티가 존재하는지 확인할 수 있다.
hasOwnProperty 메서드는 인수로 전달받은 프로퍼티 키가 객체 고유의 프로퍼티 키인 경우에만 true를 반환하고 상속받은 프로토타입의 프로퍼티 키인 경우 false를 반환한다.

## 14. 프로퍼티 열거

### for ... in 문

객체의 모든 프로퍼티를 순회하며 열거(enumeration)하려면 for ... in 문을 사용한다.

```js
for (변수선언문 in 객체) {...}
```

for ... in 문은 객체의 프로토타입 체인 상에 존재하는 모든 프로토타입의 프로퍼티 중에서
프로퍼티 어트리뷰트 `[[Enumerable]]`의 값이 true인 프로퍼티를 순회하며 열거한다.

상속받은 프로퍼티는 제외하고 객체 자신의 프로퍼티만 열거하려면 `Object.prototype.hasOwnProperty` 메서드를 사용하여 객체 자신의 프로퍼티인지 확인해야 한다.

### Object.keys/values/entries 메서드

객체 자신의 고유 프로퍼티만 열거하기 위해서는 for ... in 문보다는 Object.keys/values/entries 메서드를 사용하는 것이 좋다.

- `Object.keys` : 객체 자신의 열거 가능한 프로퍼티 키를 배열로 반환
- `Object.values` : 객체 자신의 열거 가능한 프로퍼티 값을 배열로 반환
- `Object.entries` : 객체 자신의 열거 가능한 프로퍼티 키와 값의 쌍의 배열을 배열에 담아 반환

```js
const person = {
  name: "Lee",
  address: "Seoul",
  __proto__: { age: 20 },
};

console.log(Object.keys(person)); // ["name", "address"]
console.log(Object.values(person)); // ["Lee", "Seoul"]
console.log(Object.entries(person)); // [["name", "Lee"], ["address", "Seoul"]]
```
