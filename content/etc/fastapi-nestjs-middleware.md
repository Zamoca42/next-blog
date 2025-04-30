---
title: "미들웨어와 인터셉터"
tag:
  - FastAPI
  - NestJS
  - Middleware
  - Interceptor
date: "2025-04-30"
---

![NestJS의 요청/응답 파이프라인](/images/middleware-interceptors.jpg)

현대적인 백엔드 개발에서 FastAPI와 NestJS는 높은 생산성과 확장성을 제공하는 프레임워크로 널리 사용되고 있습니다. 이 두 프레임워크에서 공통적으로 중요한 개념이 바로 **미들웨어(Middleware)**이며, NestJS에서는 추가로 **인터셉터(Interceptor)** 개념을 제공합니다. 이 글에서는 두 프레임워크의 미들웨어 구현 방식과 NestJS의 인터셉터와 미들웨어 간의 차이점을 살펴보겠습니다.

## 미들웨어란?

미들웨어는 **요청이 라우트 핸들러에 도달하기 전에 실행되는 함수**로, 애플리케이션의 요청-응답 주기에서 중간자 역할을 수행합니다. 이는 클라이언트의 요청(request)과 서버의 응답(response) 사이에서 특정 작업을 수행하는 소프트웨어 컴포넌트입니다.

### 미들웨어를 사용하는 이유

- **공통 기능 구현**: 여러 라우트에서 필요한 공통 기능(로깅, 인증 등)을 중복 없이 구현
- **요청 전처리 및 응답 후처리**: 데이터 검증, 변환, 헤더 추가 등의 작업
- **교차 관심사 분리**: 비즈니스 로직과 인프라 관련 코드(로깅, 보안, 캐싱 등) 분리

## FastAPI의 미들웨어

FastAPI에서는 다음과 같은 방식으로 미들웨어를 구현할 수 있습니다.

### 1. 데코레이터 방식

```python
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = time.perf_counter() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

이 방식은 간단한 미들웨어를 구현할 때 유용합니다.

### 2. add_middleware 메서드 사용

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

이 방식은 기존에 만들어진 미들웨어 클래스를 적용할 때 사용합니다.

### 3. 커스텀 미들웨어 클래스

```python
from starlette.middleware.base import BaseHTTPMiddleware

class CustomMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 요청 처리 전 로직
        response = await call_next(request)
        # 응답 처리 후 로직
        return response

app.add_middleware(CustomMiddleware)
```

복잡한 미들웨어 로직을 클래스로 캡슐화하고 싶을 때 유용한 방식입니다.

## FastAPI에서의 미들웨어 중첩 및 실행 순서

### 미들웨어 중첩 메커니즘

FastAPI에서 미들웨어를 추가할 때마다 현재 애플리케이션을 해당 미들웨어로 래핑하는 방식으로 작동합니다. 이는 다음과 같은 패턴으로 이해할 수 있습니다:

1. 앱 A가 있을 때 미들웨어 B를 추가하면 B(A)가 됩니다.
2. 여기에 미들웨어 C를 추가하면 C(B(A))가 됩니다.

이러한 중첩 구조는 "양파 레이어" 형태로 작동하며, 요청은 바깥쪽 레이어에서 안쪽으로, 응답은 안쪽에서 바깥쪽으로 이동합니다.

### 실행 순서

미들웨어의 실행 순서는 등록된 순서에 따라 결정됩니다:

- **요청 처리**: 마지막에 추가된 미들웨어가 가장 먼저 요청을 처리합니다.
- **응답 처리**: 첫 번째로 추가된 미들웨어가 가장 마지막에 응답을 처리합니다.

즉, `add_middleware()` 메소드로 추가한 미들웨어는 역순으로 실행됩니다. 이는 Starlette(FastAPI의 기반 프레임워크)에서 미들웨어가 위에서 아래로(top-to-bottom) 평가되는 방식을 따릅니다.

```python
app.add_middleware(FirstMiddleware)
app.add_middleware(SecondMiddleware)
app.add_middleware(ThirdMiddleware)
```

위 코드에서 요청 처리 순서는 ThirdMiddleware → SecondMiddleware → FirstMiddleware 순이며, 응답 처리 순서는 FirstMiddleware → SecondMiddleware → ThirdMiddleware 순입니다.

### 미들웨어 순서의 중요성 및 실제 동작 예시

미들웨어 순서는 애플리케이션의 동작에 중요한 영향을 미칩니다. 다음 예시를 통해 이해해 보겠습니다:

```python
import time
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def middleware1(request: Request, call_next):
    print("처리 전 - 미들웨어 1")
    response = await call_next(request)
    print("처리 후 - 미들웨어 1")
    return response

@app.middleware("http")
async def middleware2(request: Request, call_next):
    print("처리 전 - 미들웨어 2")
    response = await call_next(request)
    print("처리 후 - 미들웨어 2")
    return response

@app.get("/")
async def root():
    print("라우트 핸들러 실행")
    return {"message": "Hello World"}
```

위 코드의 실행 순서는 다음과 같습니다:
1. "처리 전 - 미들웨어 2"
2. "처리 전 - 미들웨어 1"
3. "라우트 핸들러 실행"
4. "처리 후 - 미들웨어 1"
5. "처리 후 - 미들웨어 2"

이 순서는 미들웨어가 정의된 순서의 역순으로 요청을 처리하고, 정의된 순서대로 응답을 처리하는 것을 보여줍니다.

### 주의사항 및 모범 사례

1. **의존성을 고려한 순서**: 인증 미들웨어는 일반적으로 로깅 미들웨어보다 먼저 실행되어야 합니다.

2. **미들웨어 등록 방식 일관성**: 데코레이터와 `add_middleware()` 메서드를 혼합하여 사용할 때는 실행 순서를 신중히 고려해야 합니다.

3. **성능 고려**: 미들웨어는 모든 요청에 적용되므로 가벼운 작업만 수행하는 것이 좋습니다.

4. **오류 처리**: 미들웨어에서의 예외 처리는 전체 애플리케이션에 영향을 미칠 수 있습니다.

```python
@app.middleware("http")
async def error_handling_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        # 오류 처리 로직
        return JSONResponse(
            status_code=500,
            content={"message": "내부 서버 오류가 발생했습니다"}
        )
```

## NestJS의 미들웨어

NestJS에서는 함수형 미들웨어와 클래스 기반 미들웨어 두 가지 방식을 제공합니다.

### 1. 클래스 기반 미들웨어

```typescript
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.originalUrl}`);
    next();
  }
}
```

### 2. 함수형 미들웨어

```typescript
export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`[${req.method}] ${req.url}`);
  next();
}
```

### 미들웨어 적용 방법

NestJS에서는 다양한 방식으로 미들웨어를 적용할 수 있습니다.

```typescript
@Module({
  imports: [],
  controllers: [CatsController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(CatsController);  // 특정 컨트롤러에 적용
      
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: 'users', method: RequestMethod.GET });  // 특정 경로와 메서드에 적용
  }
}
```

전역 미들웨어 적용도 가능합니다.

```typescript
const app = await NestFactory.create(AppModule);
app.use(logger);  // 모든 라우트에 적용
await app.listen(3000);
```

## NestJS의 인터셉터

NestJS에는 미들웨어와 유사하지만 차별화된 기능을 제공하는 인터셉터가 있습니다. 인터셉터는 `@Injectable()` 데코레이터를 사용하고 `NestInterceptor` 인터페이스를 구현합니다.

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');
    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() => console.log(`After... ${Date.now() - now}ms`)),
      );
  }
}
```

## 미들웨어 vs 인터셉터: 주요 차이점

### 1. 실행 시점과 라이프사이클

**미들웨어**는 요청이 컨트롤러에 도달하기 전에만 실행됩니다. 반면 **인터셉터**는 컨트롤러 실행 전과 후 모두에 로직을 추가할 수 있습니다.

NestJS의 요청 처리 순서는 다음과 같습니다:
```
HTTP 요청 → 미들웨어 → 가드 → 인터셉터(전) → 파이프 → 컨트롤러 
→ 인터셉터(후) → 예외 필터 → HTTP 응답
```

### 2. 기능적 범위

**미들웨어**:
- 요청 객체(req)와 응답 객체(res)에 직접 접근
- Express 미들웨어 생태계 활용 가능 (morgan, body-parser 등)
- 주로 인증, 로깅, 요청 검증 작업에 사용

**인터셉터**:
- 실행 컨텍스트(ExecutionContext)를 통한 추상화된 접근
- RxJS Observable을 활용한 응답 스트림 변형
- 메소드 실행 전/후 추가 로직 바인딩, 응답 변환, 예외 처리 등 고급 기능

```typescript
// 인터셉터를 활용한 응답 변형 예시
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => ({ success: true, data, timestamp: new Date().toISOString() }))
    );
  }
}
```

### 3. 적용 범위와 유연성

**미들웨어**는 주로 라우팅 수준에서 적용됩니다.
- 전체 애플리케이션
- 특정 경로 패턴
- 특정 HTTP 메서드

**인터셉터**는 더 세밀한 적용이 가능합니다.
- 전역 수준
- 컨트롤러 수준
- 특정 라우트 핸들러 수준

```typescript
// 컨트롤러 수준 인터셉터 적용
@UseInterceptors(LoggingInterceptor)
@Controller('users')
export class UsersController {}

// 메서드 수준 인터셉터 적용
@UseInterceptors(CacheInterceptor)
@Get(':id')
findOne(@Param('id') id: string) {}
```

### 4. 에러 처리 능력

**미들웨어**는 `next(err)`를 통해 에러를 다음 미들웨어나 에러 핸들러로 전달할 수 있지만, 구조화된 에러 처리가 제한적입니다.

**인터셉터**는 RxJS의 `catchError` 연산자를 통해 더 유연한 예외 처리가 가능합니다.

```typescript
@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        catchError(err => {
          return throwError(() => new CustomHttpException('알 수 없는 오류가 발생했습니다', err));
        }),
      );
  }
}
```

### 5. 요약 비교표

| 특성 | 미들웨어 | 인터셉터 |
|------|----------|----------|
| **실행 시점** | 컨트롤러 전 | 컨트롤러 전후 |
| **주요 사용처** | 인증, 로깅, 요청 검증 | 응답 변형, 성능 모니터링 |
| **데이터 접근** | req/res 객체 직접 조작 | 실행 컨텍스트 추상화 접근 |
| **비동기 처리** | 제한적 (콜백 기반) | RxJS Observable 활용 |
| **적용 범위** | 라우팅 수준 | 컨트롤러/메서드 수준 |
| **외부 라이브러리** | Express 미들웨어 호환 | NestJS 전용 |
| **응답 변형 가능성** | 제한적 | 높음 (Observable 파이프라인) |
| **예외 처리** | 기본적인 에러 전파 | 구조화된 에러 변형 |

## 언제 무엇을 사용해야 할까?

### 미들웨어에 적합한 상황

- **요청 전처리**: 인증 토큰 검증, IP 필터링, 요청 로깅
- **Express 생태계 활용**: 기존 Express 미들웨어 재사용
- **요청 변형**: 요청 본문이나 헤더 수정, 압축, 암호화

```typescript
// JWT 인증 미들웨어 예시
@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '인증 토큰이 없습니다' });
    }
    
    try {
      const payload = this.jwtService.verify(token);
      req.user = payload;
      next();
    } catch (error) {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다' });
    }
  }
}
```

### 인터셉터에 적합한 상황

- **응답 변형**: 응답 데이터 포맷팅, 캐싱, 직렬화
- **성능 모니터링**: 요청 처리 시간 측정, 로깅
- **예외 변환**: 일관된 오류 응답 형식 제공

```typescript
// 응답 포맷 표준화 인터셉터 예시
@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
        path: context.switchToHttp().getRequest().url
      }))
    );
  }
}
```

## 결론

미들웨어와 인터셉터는 각각 고유한 장점과 사용 사례가 있습니다. 미들웨어는 HTTP 요청의 초기 처리와 필터링에 적합하며, 인터셉터는 응답 데이터 처리와 컨트롤러 실행 전후에 더 세밀한 제어가 필요할 때 효과적입니다.

효율적인 백엔드 애플리케이션을 설계할 때는

1. **미들웨어**를 사용해 인증, 로깅, 요청 검증 등 공통 기능을 구현
2. **인터셉터**로 응답 데이터 포맷팅, 캐싱, 성능 모니터링 등 고급 기능 제공
3. 두 컴포넌트를 적절히 조합하여 관심사를 명확히 분리하고 유지보수하기 쉬운 코드베이스 구축

이러한 개념들을 이해하고 활용하면 FastAPI와 NestJS를 사용하여 더 유지보수하기 쉬운 백엔드 애플리케이션을 개발할 수 있습니다.