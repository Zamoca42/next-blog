---
title: "오픈소스 기여: node-cron 비동기 처리 개선 후기"
star: true
tag:
  - node-cron
  - Node.js
  - Open-Source
date: "2024-12-20"
---

## 들어가며

최근 주간 230만 다운로드를 기록하는 Node.js 패키지인 node-cron에 비동기 처리 기능을 추가하는 PR을 진행했습니다.  
처음에는 단순히 기술적인 문제 해결에 집중했지만, 과정을 거치면서 많은 사용자가 의존하는 패키지를 수정할 때의 고려사항과 책임에 대해 생각하게 되었습니다.  
이 글에서는 비동기 작업을 제대로 처리하기 위한 기능을 추가하면서 겪었던 고민과 시행착오, 그리고 기존 사용자에게 영향을 주지 않으면서 새로운 기능을 통합하는 과정에 대한 경험을 공유하고자 합니다.

<!-- end -->

## node-cron 소개

[node-cron](https://github.com/kelektiv/node-cron)은 Node.js 환경에서 cron 표현식을 사용해 작업을 예약할 수 있는 라이브러리입니다.  
Linux의 crontab과 유사한 문법으로 반복 작업을 쉽게 스케줄링할 수 있어, 백엔드 서비스에서 주기적인 작업을 관리하는 데 널리 사용됩니다.

## 문제 인식

node-cron을 실제 프로젝트에서 사용하면서 두 가지 주요 제한사항을 발견했습니다:

1. **비동기 콜백 처리의 한계**: 예약된 작업이 비동기 함수(Promise를 반환하는 함수)일 때, node-cron은 이를 제대로 처리하지 못했습니다.  
   작업이 완료되기를 기다리지 않고 즉시 반환되어, 작업 중 발생한 오류를 놓치거나 작업 완료 여부를 확인하기 어려웠습니다.

2. **작업 상태 추적 불가**: 실행 중인 작업의 상태를 확인할 방법이 없어, 특히 서버 종료 시 진행 중인 작업을 안전하게 완료할 수 없었습니다.

GitHub에서 관련 이슈(#713, #556)를 찾아보니 여러 사용자가 비슷한 문제를 겪고 있었고, 일부는 직접 패치를 작성하기도 했지만 공식적으로 병합되지는 않은 상태였습니다.

## 해결 방안 설계

이 문제를 해결하기 위해 다음과 같은 기능을 추가하기로 계획했습니다:

1. **비동기 콜백 처리 개선**:

   - `fireOnTick()` 메서드가 Promise를 반환하도록 수정
   - 비동기 작업의 성공/실패를 적절히 처리

2. **작업 상태 추적**:

   - 콜백 실행 중 상태를 확인할 수 있는 isCallbackRunning 플래그 추가
   - 실행 중인 작업이 완료될 때까지 기다리는 기능 구현

3. **중복 실행 방지**:
   - 콜백이 이미 실행 중일 때 새로운 실행을 방지하는 옵션 제공

처음에는 단순히 기존 코드를 비동기 처리에 맞게 수정하려 했으나, 이는 기존 사용자에게 영향을 줄 수 있다는 점을 고려해야 했습니다.

## 첫 번째 접근과 피드백

먼저 `fireOnTick()` 메서드를 비동기 함수로 변경하고, 테스트 코드도 async/await 패턴을 사용하도록 수정했습니다.  
약 40개의 테스트 케이스를 변경했고, 새로운 기능을 테스트하기 위한 5개의 테스트를 추가했습니다.

```typescript
// 원래 코드
private fireOnTick() {
  this.onTick.call(null, ...this.cronArgs);
  this.lastExecution = new Date();
}

// 변경한 코드
private async fireOnTick(): Promise<void> {
  try {
    this._isCallbackRunning = true;
    await this.onTick.call(null, ...this.cronArgs);
    this.lastExecution = new Date();
  } catch (error) {
    this.onError?.call(null, error);
  } finally {
    this._isCallbackRunning = false;
  }
}
```

하지만 PR 리뷰 과정에서 중요한 피드백을 받았습니다.

> "done 콜백을 제거하고 비동기 함수로 바꾼 것은 모든 테스트 케이스에서 되돌려야 합니다. 우리는 기존 동작을 깨트리는 변경이 아닌 새로운 기능만 추가해야 합니다(opt-in 방식)."

이 피드백은 오픈소스 프로젝트에서 기존 사용자 경험의 중요성을 일깨워주는 계기가 되었습니다.  
이전에는 비동기 처리를 지원하지 않았기 때문에, 기존 기능에서 새로운 기능으로 바꾸는 것이 기존 사용자에게 좋은 방향이 아닐 수도 있다는 점을 깨달았습니다.

## 접근 방식 수정: 사용자 선택권 보장

피드백을 반영하여 접근 방식을 수정했습니다. 핵심은 '기존 사용자에게 영향을 주지 않으면서, 새로운 기능이 필요한 사용자에게는 선택적으로 제공하는 것'이었습니다.

1. **옵트인(Opt-in) 방식 도입**
   - 새로운 옵션 `waitForCompletion`을 추가하고 기본값은 `false`로 설정
   - 기존 사용자는 변경 없이 계속 사용 가능
   - 비동기 지원이 필요한 사용자만 옵션을 활성화하여 사용

```typescript
constructor(cronTime: CronTime, onTick: OnTickCallback, options?: CronJobParameters) {
  // ...
  this.waitForCompletion = options?.waitForCompletion || false;
  // ...
}
```

2. **선택적 비동기 처리**
   - waitForCompletion이 true일 때만 비동기 처리 로직 실행
   - false일 경우 기존과 동일하게 동작

```typescript
private async fireOnTick(): Promise<void> {
  // 이미 실행 중이고, 완료 대기 옵션이 켜져 있다면 중복 실행 방지
  if (this.waitForCompletion && this._isCallbackRunning) return;

  try {
    this._isCallbackRunning = true;
    // 콜백이 Promise를 반환하는지 확인하고 적절히 처리
    const result = this.onTick.call(null, ...this.cronArgs);

    if (this.waitForCompletion && result instanceof Promise) {
      await result;
    }

    this.lastExecution = new Date();
  } catch (error) {
    this.onError?.call(null, error);
  } finally {
    this._isCallbackRunning = false;
  }
}
```

3. **테스트 접근법 변경**
   - 기존 테스트는 그대로 유지
   - 새로운 기능만을 위한 테스트 케이스 별도 추가

이런 방식으로 기존 사용자 경험을 해치지 않으면서도 비동기 처리가 필요한 사용자에게 새로운 기능을 제공할 수 있었습니다.

## 새로운 기능 검증을 위한 테스트

새로운 기능을 검증하기 위해 다음과 같은 테스트 케이스를 추가했습니다.

```typescript
it("should handle async callbacks with waitForCompletion", async () => {
  const clock = sinon.useFakeTimers();
  const executionOrder: number[] = [];

  // 실행에 1.5초가 걸리는 비동기 작업
  const asyncCallback = async () => {
    executionOrder.push(1);
    await new Promise((resolve) => setTimeout(resolve, 1500));
  };

  // waitForCompletion: true 설정
  const job = new CronJob(
    "* * * * * *",
    asyncCallback,
    null,
    true,
    null,
    null,
    null,
    null,
    null,
    {
      waitForCompletion: true,
    }
  );

  // 시간을 1초 진행 (첫 번째 작업 시작)
  await clock.tickAsync(1000);

  // 시간을 1초 더 진행 (두 번째 작업 예정 시간이지만, 첫 번째 작업이 아직 실행 중이므로 무시됨)
  await clock.tickAsync(1000);

  // 첫 번째 작업 완료를 위해 0.6초 더 진행
  await clock.tickAsync(600);

  // 다음 작업 시작을 위해 0.5초 더 진행
  await clock.tickAsync(500);

  clock.restore();
  job.stop();

  // 중복 실행 방지로 인해 작업은 한 번만 실행되어야 함
  expect(executionOrder).toEqual([1]);
});
```

이 테스트는 waitForCompletion 옵션이 활성화되었을 때, 콜백이 아직 실행 중이면 새로운 콜백 실행이 방지되는지 확인합니다.  
또한 기존 옵션을 사용하는 경우에는 여전히 기존 동작이 유지되는지도 검증했습니다.

## 리뷰 과정에서의 논의

PR을 제출한 후 리뷰 과정에서 몇 가지 흥미로운 피드백을 받았습니다.

1. **테스트 스타일 일관성**:
   기존 테스트는 done 콜백 패턴을 사용했는데, 저는 async/await 패턴을 사용해 작성했습니다. 리뷰어로부터 "done 콜백을 제거하고 비동기 함수로 바꾼 것은 모든 테스트 케이스에서 되돌려야 합니다"라는 피드백을 받았습니다. 처음에는 왜 더 현대적인 방식으로 업데이트하면 안 되는지 의아했지만, 기존 사용자들이 익숙한 패턴을 유지하는 것의 중요성을 이해하게 되었습니다.
2. **테스트 정리 방식**:
   저는 각 테스트에서 clock.restore()를 직접 호출하는 대신 afterEach 훅에서 sinon.restore()를 호출하도록 변경했는데, 이 또한 기존 패턴과 일치시키도록 요청받았습니다. 처음에는 코드 중복을 줄이는 방향이 더 좋다고 생각했지만, 프로젝트의 일관성이 더 중요할 수 있다는 점을 배웠습니다.
3. **실행 로직에 대한 질문**: waitForCompletion 옵션이 활성화됐을 때 중복 실행 방지 로직의 동작 방식에 대한 질문들이 있었습니다. 한 리뷰어는 "새 작업이 이전 작업 완료 전에 시작될 예정이라면 완전히 건너뛰는 것이라면, 첫 번째 초에 시작하고 1.5초가 지나야 끝나는 작업이 있을 때, 2초에 시작할 예정이었던 두 번째 작업은 건너뛰어야 하지 않나요?"라고 물었고, 이 질문 덕분에 로직의 동작을 더 명확히 정의할 수 있었습니다.

이런 피드백을 통해 코드의 기능적 측면뿐만 아니라 프로젝트의 스타일을 존중하는 것의 중요성을 느꼈습니다.  
처음에는 일부 피드백이 불필요하게 느껴졌지만, 결과적으로 사용자 경험을 더 생각하게되는 코드를 작성하게 되었습니다.  

## 최종 결과

수정된 PR은 2024년 12월 10일에 병합되었고, node-cron v3.3.0 버전에 포함되었습니다.

1. **비동기 처리 지원**: Promise를 반환하는 콜백을 적절히 처리할 수 있게 되었습니다.
2. **작업 상태 추적**: `isCallbackRunning` 속성을 통해 콜백 실행 상태를 확인할 수 있습니다.
3. **중복 실행 방지**: `waitForCompletion` 옵션으로 작업 중복 실행을 방지할 수 있습니다.
4. **기존 코드와의 완벽한 호환성**: 기본 동작은 변경되지 않아 기존 사용자에게 영향이 없습니다.
5. **테스트 커버리지 유지**: 새로운 기능에 대한 테스트를 추가하면서도 100% 테스트 커버리지를 유지했습니다.

## 배운 점

이번 PR을 통해 많은 것을 배웠지만, 가장 인상 깊었던 점은 다음과 같습니다.

1. **사용자 경험에 대한 책임감**  
   처음에는 '기술적으로 더 나은 방식'이면 당연히 변경해도 된다고 생각했습니다. 하지만 리뷰 과정에서 230만 다운로드를 기록하는 패키지의 변경이 얼마나 많은 사용자에게 영향을 미칠 수 있는지 깨달았습니다. 비동기 처리 방식을 그냥 바꿔버릴 경우, 기존 사용자들의 코드가 예상치 못한 방식으로 작동할 수 있다는 점을 이해하게 되었습니다.
2. **프로젝트 스타일 존중하기**  
   제가 더 현대적이라고 생각한 방식(async/await 패턴)이 항상 더 좋은 것은 아니라는 점을 배웠습니다. 기존 테스트 스타일을 그대로 유지해달라는 요청이 처음에는 불필요해 보였지만, 일관성 있는 코드베이스의 중요성을 이해하게 되었습니다. 코드는 기능만큼이나 유지보수성이 중요하고, 이는 일관된 스타일에서 시작한다는 것을 깨달았습니다.
3. **피드백의 가치**
   처음 받은 피드백에 솔직히 약간 실망했습니다. 제가 열심히 작업한 코드 변경을 되돌려야 했기 때문입니다. 하지만 그 피드백 덕분에 더 유연하고 사용자 친화적인 솔루션을 생각하게 되었고, 결과적으로 더 나은 코드를 작성할 수 있었습니다.

## 마치며

node-cron 기여 과정은 저에게 오픈소스 기여 이상의 경험이었습니다. 처음에는 '어떻게 비동기 처리 기능을 추가할까'라는 기술적 관점에만 집중했지만, 과정을 거치면서 '어떻게 하면 기존 사용자에게 영향을 주지 않으면서 새로운 기능을 추가할 수 있을까'라는 더 큰 질문으로 시야가 넓어졌습니다.  
특히 PR 리뷰 과정에서 기존 코드를 변경하지 말고 옵트인 방식으로 기능을 추가하라는 피드백은 처음에는 불편하게 느껴졌지만, 이는 결국 더 범용적이고 안정적인 솔루션을 만드는 계기가 되었습니다.  
이 경험을 통해 오픈소스 기여가 단순히 코드를 제출하는 것이 아니라, 프로젝트의 방향성을 이해하고 사용자의 요구사항과 경험을 고려하는 총체적인 과정임을 실감했습니다.  
앞으로의 개발 과정에서도 '기술적으로 가능한 것'과 '사용자에게 실제로 도움이 되는 것' 사이의 균형을 항상 생각하게 될 것 같습니다.

---

**참고 자료**

- PR: [#894 feat: support async handling and add CronJob status tracking](https://github.com/kelektiv/node-cron/pull/894)
- 관련 이슈: [#713](https://github.com/kelektiv/node-cron/issues/713), [#556](https://github.com/kelektiv/node-cron/issues/556)
- node-cron 문서: [https://github.com/kelektiv/node-cron](https://github.com/kelektiv/node-cron)
