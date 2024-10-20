---
title: "Auth.js로 알아보는 세션과 JWT 인증 방식의 차이"
tag:
  - JWT
  - Session
  - Next.js
  - Auth.js
star: true
date: "2024-08-01"
---

Auth.js를 활용하여 개발하면서 세션(Session)과 JWT(JSON Web Token) 인증 방식에 대해 실제로 경험해 볼 수 있었다.
두 방식 모두 쿠키를 사용하기에 각 방식의 특징과 사용 경험을 중심으로 정리해 보았다.

## Auth.js 소개

> 🌐 https://authjs.dev/getting-started

Auth.js는 인증을 쉽게 구현할 수 있게 해주는 강력한 라이브러리다.  
Google 로그인과 같은 OAuth나 이메일 인증 로그인을 지원하며, 세션 및 JWT 기반의 인증을 모두 구현할 수 있다.

<!-- end -->

### Auth.js 기본 설정 예시

```typescript
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt", // 또는 "database"
  },
  // 추가 설정...
});
```

이 설정에서 `strategy: "jwt"`는 JWT 기반 인증을, `"database"`는 세션 기반 인증을 사용한다.

## 세션과 JWT 인증 방식 소개

### 세션 방식

![세션 방식의 시퀀스 다이어그램](https://github.com/user-attachments/assets/9fac2a99-3cf4-45e0-b1be-087a187f948b)

### JWT 방식

![JWT에서 DB를 사용하지 않고 OAuth를 적용했을 때의 시퀀스 다이어그램](https://github.com/user-attachments/assets/2e6e2c46-86ab-4ab0-a454-bb6d5f0a228a)

![JWT에서 DB를 설정했을 때의 시퀀스 다이어그램](https://github.com/user-attachments/assets/62ee9eef-f378-4312-b884-9b826d43e367)

## 세션과 JWT 비교

| 특징           | 세션                   | JWT                                                 |
| -------------- | ---------------------- | --------------------------------------------------- |
| 초기 인증      | 데이터베이스 조회      | 데이터베이스 조회 (DB 설정 시) 또는 토큰 검증 |
| 후속 요청 검증 | 데이터베이스 조회 필요 | 토큰 자체 검증 (DB 조회 불필요)                     |
| 확장성         | 서버 부하 증가         | 좋음 (후속 요청 시)                                 |
| 데이터 양      | 세션 ID만 전송         | 모든 정보 포함                                      |
| 보안           | 서버에서 관리          | 서명으로 검증                                       |
| 만료 처리      | 서버에서 즉시 가능     | 만료 시간 이후                                      |
| DB 의존성      | 높음                   | DB 설정에 따라 다름, 일반적으로 낮음                |

:::info
Auth.js에서 JWT를 사용할 때, DB를 설정하지 않으면 초기 인증 과정에서도 데이터베이스 조회가 필요 없다.  
이 경우, 토큰 자체의 검증만으로 인증이 이루어진다.
DB를 설정한 경우에만 초기 인증 시 데이터베이스 조회가 발생한다.
:::

## 실제 사용 경험

Auth.js에서 JWT를 사용하면서 프로필 이미지 업데이트와 관련된 어려움을 겪었다.
JWT에 프로필 이미지 링크를 포함시켰는데, 이미지 업데이트 시 토큰을 갱신해야 했다.

```typescript
export const authOptions: NextAuthOptions = {
  // ... 다른 설정들
  callbacks: {
    jwt({ token, trigger, session }) {
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
  },
  // ... 추가 설정
};
```

JWT에 자주 변경되는 데이터를 포함시키면 JWT의 장점인 서버 상태 비의존성이 상쇄될 수 있다.

## 선택적 사용의 필요성

JWT와 세션 중 선택은 애플리케이션의 요구사항과 데이터 특성에 따라 결정해야 한다.

1. **고정적 데이터**: JWT 적합 (사용자 ID, 권한 등)
2. **실시간성 요구 데이터**: 세션 방식 고려
3. **확장성**: 대규모 분산 시스템에서는 JWT 유리 (초기 인증 후)
4. **보안 요구사항**: 민감 정보나 빈번한 로그아웃 필요 시 세션 방식 고려

## 결론

Auth.js 사용 경험을 통해, 인증 방식 선택은 프로젝트 특성과 요구사항에 따라 유연하게 결정해야 함을 알 수 있었다.
JWT는 DB 사용 여부에 따라 초기 인증 과정에서의 데이터베이스 의존성을 크게 줄일 수 있는 장점이 있다.
하지만 자주 변경되는 데이터 처리나 실시간 사용자 정보 관리가 필요한 경우에는 추가적인 고려가 필요하다.
