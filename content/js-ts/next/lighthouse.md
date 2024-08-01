---
title: "Next.js 14 - Lighthouse로 웹페이지 성능 개선하기"
tag:
  - Next.js
  - Lighthouse
star: false
---

Next.js 14 정적 블로그에서 성능 개선을 시도한 경험을 이번 포스트에서 정리하려고 한다.
처음에는 웹 성능 측정 도구에 대해 잘 몰라 어떤 지표로 성능을 평가해야 할지 막막했다.

## Lighthouse 도구 발견

![초기 성능 진단 결과](https://github.com/user-attachments/assets/dbea020e-29f7-4ff0-9ccb-d1b175dd4716)

웹 성능 최적화에 대해 검색하던 중 Google에서 제공하는 Lighthouse라는 도구를 알게 되었다.
Lighthouse는 웹페이지의 성능, 접근성, SEO 등 다양한 측면을 분석해주는 강력한 도구였다.

![초기 진단 항목들 중 LCP와 FCP에 영향을 주는 항목이 눈에 띈다.](https://github.com/user-attachments/assets/2bdd2c27-9fe1-448b-a16f-346680ecf0a7)

프로덕션 환경에서 실행 결과, Largest Contentful Paint(LCP)이 눈에 띄는데  
진단 항목을 살펴보면 이미지가 주된 원인이였다.

<!-- end -->

## Next.js Image 컴포넌트 활용

Next.js에서 제공하는 `next/image` 컴포넌트를 사용하여 이미지 최적화를 진행했다.

이 컴포넌트는 다음과 같은 장점을 제공한다.

1. 자동 이미지 최적화: 브라우저가 지원하는 경우 webp와 같은 최신 포맷으로 이미지를 자동 변환
2. Lazy Loading: 뷰포트에 들어올 때만 이미지를 로드하여 초기 페이지 로드 시간 단축
3. placeholder 제공: 이미지 로딩 중 레이아웃 시프트 방지

특히 `priority` prop을 사용하여 LCP(Largest Contentful Paint)에 해당하는 중요 이미지의 로딩 우선순위를 높였다.

```jsx
<Image
  alt={paredAlt}
  src={parsedSrc}
  width={0}
  height={0}
  sizes="100vw"
  className="w-full h-auto rounded-xl cursor-pointer hover:shadow-xl"
  priority
/>
```

`priority` prop은 해당 이미지를 미리 로드(preload)하도록 지시하여, 페이지의 이미지가 먼저 표시되도록 한다.
이는 LCP 시간을 개선하는 데 도움이 되었다.

## srcset 최적화

Next.js의 설정 파일(`next.config.js`)에서 `imageSizes`와 `deviceSizes`를 커스터마이징하여 세밀한 srcset을 구성했다.

```javascript
const nextConfig = {
  images: {
    imageSizes: [32, 48, 64, 96],
    deviceSizes: [750, 828, 1080, 1200],
    // ...
  },
};
```

이 설정은 다음과 같은 이점을 제공한다.

1. 다양한 디바이스 크기에 최적화된 이미지 제공
2. 네트워크 대역폭 절약
3. 더 빠른 이미지 로딩 시간

![빌드 시 srcset을 생성하여, 각 디바이스에 가장 적합한 크기의 이미지를 제공한다.](ttps://github.com/user-attachments/assets/70b65dea-3da1-4eb0-9ecb-91d3817971fb)

또한, `sizes="100vw"`를 설정하여 이미지가 뷰포트의 전체 너비를 차지하도록 했다.

## 결과 및 학습

이번 최적화 과정을 통해 웹 성능 개선, 특히 이미지 최적화가 페이지 로딩 속도에 미치는 영향이 상당하다는 것을 직접 경험할 수 있었다.

![이미지 최적화 시도 후 실행 결과](https://github.com/user-attachments/assets/fee92ce2-fa18-4ba3-83dd-eba1408a5082)

Lighthouse 성능 점수가 향상된 것을 확인할 수 있었지만, 여기서 중요한 점은 절대적인 점수보다는 최적화 과정에서 얻은 인사이트다.
Lighthouse를 실행하는 환경, 네트워크 상태, 그리고 측정 시점에 따라 성능 점수가 최대 30점까지 차이날 수 있다는 것을 알게 되었다.
이는 Lighthouse 점수를 절대적인 지표로 삼기보다는, 성능 개선의 방향성을 제시하는 가이드라인으로 활용해야 한다는 교훈을 얻었다.
