---
title: 1. http 기본정리
category:
  - Infra.
tag:
  - Http
timeline: false
article: false
---

전 세계의 웹브라우저, 서버, 웹 애플리케이션은 모두 HTTP(Hypertext Transfer Protocol)를 통해 대화한다.
이번 포스트에서는 HTTP에 대해 간결하게 정리한다. 그리고 HTTP 관련 포스트에서 다음을 중점으로 정리할 것이다.

- 얼마나 많은 클라이언트와 서버가 통신하는지
- 리소스가 어디서 오는지
- 웹 트랜잭션이 어떻게 동작하는지
- HTTP 통신을 위해 사용하는 메시지의 형식
- HTTP 기저의 TCP 네트워크 전송
- 여러 종류의 HTTP 프로토콜
- 인터넷 곳곳에 설치된 다양한 HTTP 구성요소

## 웹 클라이언트와 서버

웹 콘텐츠는 웹 서버에 존재한다.
웹 서버는 HTTP 프로토콜로 의사소통하기 때문에 보통 HTTP 서버라고 불린다.
이들 웹 서버는 인터넷의 데이터를 저장하고, HTTP 클라이언트가 요청한 데이터를 제공한다.
클라이언트는 서버에게 HTTP 요청을 보내고 서버는 요청된 데이터를 HTTP 응답으로 돌려준다.
클라이언트와 서버는 월드 와이드 웹의 기본 요소다.

![그림 1-1. 웹 클라이언트와 웹 서버](https://github.com/Zamoca42/blog/assets/96982072/0ebb1292-9888-41a6-89c5-2666ac867ae9)

가장 흔한 클라이언트는 마이크로소프트 인터넷 익스플로러나 구글 크롬 같은 웹브라우저다.
웹브라우저는 서버에게 HTTP 객체를 요청하고 사용자의 화면에 보여준다.

예를 들어 `https://zamoca.space/index.html` 페이지를 열어볼 때, 웹브라우저는 HTTP 요청을 서버로 보낸다.
서버는 요청 받은 객체를 찾고, 성공했다면 그것의 타입, 길이 등의 정보와 함께 HTTP 응답에 실어서 클라이언트에게 보낸다.

## 리소스

웹 서버는 웹 리소스를 관리하고 제공한다.
웹 리소스는 웹 콘텐츠의 원천이다.
가장 단순한 웹 리소스는 웹 서버 파일 시스템의 정적 파일이다.

정적 파일은 텍스트파일, HTML 파일, 마이크로소프트 워드 파일, 어도비 아크로뱃 파일,
JPEG 이미파일, AVI 동영상 파일, 그 외 모든 종류의 파일을 포함한다.

그러나 리소스는 반드시 정적 파일이어야 할 필요는 없다. 리소스는 요청에 따라 콘텐츠를 생산하는 프로그램이 될 수도 있다.

이들 동적 콘텐츠 리소스는 사용자가 누구인지, 어떤 정보를 요청했는지, 몇 시인지에 따라 다른 콘텐츠를 생성한다.

라이브 영상을 가져와 보여주거나, 주식 거래, 부동산 데이터베이스 검색, 온라인 쇼핑몰에서 선물 구입을 할 수 있게 해줄 수도 있다.

![그림 1-2. 웹 리소스란 웹에 콘텐츠를 제공하는 모든 것을 말한다.](https://github.com/Zamoca42/blog/assets/96982072/b796b010-1985-4d4a-b040-93004cdaf71a)

### 미디어 타입

인터넷은 수천 가지 데이터 타입을 다루기 때문에, HTTP는 웹에서 전송되는 객체 각각에 신중하게 MIME 타입이라는 데이터 포맷 라벨을 붙인다.

MIME(Multipurpose Internet Mail Extensions)은 원래
각기 다른 전자메일 시스템 사이에서 메시지가 오갈 때 겪는 문제점을 해결하기 위해 설계 되었다.

MIME는 이메일에서 워낙 잘 동작했기 때문에, HTTP에서도 멀티미디어 콘텐츠를 기술하고 라벨을 붙이기 위해 채택 되었다.

![그림 1-3. 웹 서버는 데이터 콘텐츠와 함께 MIME 타입을 보내준다.](https://github.com/Zamoca42/blog/assets/96982072/3f0e272f-8d12-42a0-a20f-52b52efdbc70)

MIME 타입은 사선(/)으로 구분된 주 타입과 부 타입으로 이루어진 문자열 라벨이다.

- HTML로 작성된 텍스트 문서는 text/html 라벨이 붙는다.

- plain ASCII 텍스트 문서는 text/plain 라벨이 붙는다.

- JPEG 이미지는 image/jpeg가 붙는다.

- GIF 이미지는 image/gif가 된다.

- 애플 퀵타임 동여상은 video/quicktime이 붙는다.

- 마이크로소프트 파워포인트 프레젠테이션은
  application/vnd.ms-powerpoint가 붙는다.

### URI

웹 서버 리소스는 각자 이름을 갖고 있기 때문에, 클라이언트는 관심있는 리소스를 지목할 수 있다.
서버 리소스 이름은 통합 자원 식별자(uniform resource identifier), 혹은 URI로 불린다.

URI는 인터넷의 우편물 주소 같은 것으로, 정보 리소스를 고유하게 식별하고 위치를 지정할 수 있다.

'죠의 컴퓨터 가게'의 웹 서버에 있는 이미지 리소스에 대한 URI라면

```txt
http://www.joes-hardware.com/speicals/saw-blade.gif
```

![그림 1-4 URL은 프로토콜, 서버, 리소스를 명시한다.](https://github.com/Zamoca42/blog/assets/96982072/2c25f6e5-9a29-4f97-bd97-1f038d365c2f)

서버에 있는 GIF 형식의 톱날 그림 리소스에 대한 URI가 HTTP 프로토콜에서 어떻게 해석되는지 보여준다.

URI에는 URL과 URN이 있는데 이 두 종류의 자원 식별자에 대해 살펴보자.

### URL

통합 자원 지시자(uniform resource locator, URL)은 특정 서버의 한 리소스에 대한 구체적인 위치를 서술한다.

| URL                               | 설명                         |
| --------------------------------- | ---------------------------- |
| http://www.oreilly.com/index.html | 오라일리 출판사 홈페이지 URL |
| https://zamoca.space              | 자모카 블로그 홈페이지 URL   |

대부분의 URL은 세 부분으로 이루어진 표준 포맷을 따른다.

- URL의 첫번째 부분은 스킴(scheme)이라고 불리는데, 리소스에 접근하기 위해 사용되는 프로토콜을 서술한다.(예: http://)
- 두 번째 부분은 서버의 인터넷 주소를 제공한다. (예: zamoca.space)
- 마지막은 웹 서버의 리소스를 가리킨다 (예: /index.html)

### URN

통합 리소스 이름(uniform resource name, URN)은 콘텐츠를 이루는 한 리소스에 대해,
그 리소스의 위치에 영향 받지 않는 유일무이한 이름 역할을 한다.
리소스가 그 이름을 변하지 않게 유지하는 한, 여러 종류의 네트워크 접속 프로토콜로 접근해도 문제 없다.

예를 들어, 다음의 URN은 인터넷 표준 문서 'RFC2141'가 어디에 있거나 상관없이 그것을 지칭하기 위해 사용할 수 있다.

```text
urn:ietf:rfc:2141
```

## 트랜잭션

HTTP 트랜잭션은 요청 명령과 응답 결과로 구성되어 있다.
이 상호작용은 그림 1-5에 묘사된 것과 같이 HTTP 메세지라고 불리는 정형화된 데이터 덩어리를 이용해 이루어진다.

![그림 1-5. HTTP 트랜잭션은 요청과 응답 메시지로 구성](https://github.com/Zamoca42/blog/assets/96982072/faba0457-3e4a-4f8c-81f0-1549a43c7bc9)

### 메서드

HTTP는 HTTP 메서드라고 불리는 여러 가지 종류의 요청 명령을 지원한다.
다음 표에서는 흔히 쓰이는 HTTP 메서드 다섯 개를 열거하고 있다.

| HTTP 메서드 | 설명                                                                |
| ----------- | ------------------------------------------------------------------- |
| GET         | 서버에서 클라이언트로 지정한 리소스를 보내라                        |
| PUT         | 클라이언트에서 서버로 보낸 데이터를 지정한 이름의 리소스로 저장하라 |
| DELETE      | 지정한 리소스를 서버에서 삭제하라                                   |
| POST        | 클라이언트 데이터를 서버 게이트웨이 어플리케이션으로 보내라         |
| HEAD        | 지정한 리소스에 대한 응답에서, HTTP 헤더 부분만 보내라              |

HTTP 메서드에 대해서는 3장에서 상세히 다룰 것이다.

### 상태 코드

모든 HTTP 응답 메시지는 상태 코드와 함께 반환된다.
상태 코드는 클라이언트에게 요청이 성공했는지 아니면 추가 조치가 필요한지 알려주는 세 자리 숫자다.

| HTTP 상태 코드 | 설명                                        |
| -------------- | ------------------------------------------- |
| 200            | OK. 문서가 바르게 반환.                     |
| 302            | Redirect. 다른 곳에 가서 리소스를 가져가라. |
| 404            | Not Found. 리소스를 찾을 수 없다.           |

### 웹페이지는 여러 객체로 이루어질 수 있다

애플리케이션은 보통 하나의 작업을 수행하기 위해 여러 HTTP 트랜잭션을 수행한다.
예를 들어, 웹브라우저는 시각적으로 풍부한 웹페이지를 가져올 때 페이지 레이아웃을 서술하는 HTML 뼈대를 한 번의 트랜잭션으로 가져온 뒤,
첨부된 이미지, 그래픽 등을 가져오기 위해 추가로 트랜잭션을 수행한다.

웹페이지는 하나의 리소스가 아닌 리소스의 모음이다.

## 메시지

HTTP 메시지는 단순한 줄 단위의 문자열이다.
웹 클라이언트에서 웹 서버로 보낸 HTTP 메시지를 요청 메시지라고 부른다.
서버에서 클라이언트로 가는 메시지는 응답 메시지라고 부른다.

HTTP 메시지는 시작줄, 헤더, 본문으로 이루어진다.

![그림 1-7. HTTP 메시지는 단순한 줄 단위 텍스트 구조를 갖고 있다.](https://github.com/Zamoca42/blog/assets/96982072/d0856c90-c80d-4009-bb72-bf95d34afc1a)

### 간단한 메시지의 예

![그림 1-8. GET 트랜잭션의 예](https://github.com/Zamoca42/blog/assets/96982072/f0c87578-0b72-4a38-80aa-4817c3f6ab87)

## TCP/IP

HTTP 메시지가 TCP(Transmission Control Protocol, 전송 제어 프로토콜) 커넥션을 통해 다른 곳으로 옮겨가는지 살펴보자.

HTTP는 애플리케이션 계층 프로토콜이다. HTTP는 네트워크 통신의 세부사항에 신경쓰지 않고 TCP/IP에게 다음을 맡긴다.

- 오류 없는 데이터 전송
- 순서에 맞는 전달
- 조각나지 않는 데이터 스트림

TCP/IP는 TCP와 IP가 층을 이루는, 패킷 교환 네트워크 프로토콜의 집합이다.
TCP/IP는 각 네트워크와 하드웨어의 특성을 숨기고, 어떤 종류의 컴퓨터나 네트워크든 서로 신뢰성 있는 의소소통을 하게 해 준다.

![그림 1-9. HTTP 네트워크 프로토콜 스택](https://github.com/Zamoca42/blog/assets/96982072/19276d13-e4f9-4c54-ace4-1fb20d4a39ca)

### 접속, IP 주소 그리고 포트번호

HTTP 클라이언트가 서버에 메시지를 전송할 수 있게 되기 전에,
인터넷 프로토콜 주소와 포트번호를 사용해 클라이언트와 서버 사이에 TCP/IP 커텍션을 맺어야 한다.

TCP 커넥션을 맺는 것은 다른 회사 사무실에 있는 누군가에게 전화를 거는 것과 비슷하다.
TCP에서는 서버 컴퓨터에 대한 IP 주소와 그 서버에서 실행 중인 프로그램이 사용 중인 포트번호가 필요하다.

```text
http://207.200.83.29:80/index.html
http://www.netscape.com:80/index.html
http://www.netscape.com/index.html
```

첫 번째 URL은 IP 주소와 포트번호를 갖고 있다.

두 번째 URL에는 숫자로 된 IP주소가 없다. 대신 글자로 된 도메인 이름 혹은 호스트명을 갖고 있다.
호스트 명은 도메인 이름 서비스(Domain Name Service, DNS)라 불리는 장치를 통해 쉽게 IP로 변환될 수 있다.

마지막 URL은 포트번호가 없다. HTTP URL에 포트번호가 빠진 경우에는 기본값 80을 사용한다.