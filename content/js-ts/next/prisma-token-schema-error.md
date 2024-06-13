---
title: "Auth.js v4 - Unknown arg `access_token`... 에러"
tag:
  - Next.js
  - Auth.js
  - Prisma
---

Auth.js는 NextJS 친화적으로 설계된 오픈소스 인증 라이브러리다.

NextJS에서 간단한 설정만으로 OAuth나 이메일 인증 로직을 적용할 수 있어 편리하다.

다만 커스터마이징을 하기에는 사용자가 내부로직을 알기 모호하고 문서가 복잡하고 불친절하다는 느낌을 받았다.

그 예로 NextJS에서 Prisma를 이용해 구글 이메일 로그인을 구현하면서 겪은 에러에 대해 정리하려고 한다.

해당 내용은 Auth.js v4에서 겪은 에러로 내용은 다음과 같다.

```txt:에러내용
Unknown arg `access_token` in data.access_token for type AccountUncheckedCreateInput. Did you mean `accessToken`?
```

<!-- end -->

## 스키마 설정 확인

문제의 원인이 되는 Prisma 스키마를 확인해 보면 `@map()` 어노테이션을 사용하여 데이터베이스의 컬럼명을 지정하고 있다.

```prisma:schema.prisma {8-9}
//...
model Account {
  id                String  @id @default(cuid())
  userId            String  @unique @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String? @db.Text @map("refresh_token")
  access_token      String? @db.Text @map("access_token")
  expires_at        Int? @map("expires_at")
  token_type        String? @map("token_type")
  scope             String?
  id_token          String? @db.Text @map("id_token")
  session_state     String? @map("session_state")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
  @@map("account")
}
```

Auth.js 공식 문서에서는 Prisma의 Naming Convention이 Auth.js에는 영향을 주지 않는다고 설명하고 있다.  
하지만 실제로 구글 로그인을 시도해보면 `accessToken`을 요구하는 단계에서 에러가 발생한다.

> 공식문서 : https://authjs.dev/getting-started/adapters/prisma#naming-conventions

## 해결 방안 모색

깃헙 이슈에서 같은 에러를 발생한 내용을 찾을 수 있었고, Naming Convention에서 문제가 발생한 것으로 확인되었다.

> https://github.com/nextauthjs/next-auth/issues/3818

해결 방법으로 `@map()` 어노테이션을 일부 제거하니 정상적으로 작동하는 것을 확인할 수 있었다.

```prisma:schema.prisma {8-9}
//...
model Account {
  id                String  @id @default(cuid())
  userId            String  @unique @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
  @@map("account")
}
```

![에러 로그](https://github.com/Zamoca42/blog/assets/96982072/babe8874-7bea-46aa-ad55-ca960f8b522f)

에러 로그를 살펴보니 `PrismaAdapter`에서 발생한 에러라고 나와있다. 따라서 이 문제는 Next.js 카테고리에서 다루는 것이 적절해 보였다.

## 더 나은 대안 고민

> :pushpin: [Do you prefer NextAuth or LuciaAuth?](https://www.reddit.com/r/nextjs/comments/1bjamiu/why_everyone_recommends_lucia_auth/)

Auth.js는 편리한 라이브러리지만 복잡한 문서로 인해 불만을 가진 사용자들도 있다는 것을 알게 되었다.
다른 대안으로는 Lucia나 Clerk 등의 인증 라이브러리도 고려해 볼 만하다.
