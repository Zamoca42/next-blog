---
title: "가민 핏봇(GarminFitBot) 개발 후기"
tag:
  - GarminFitBot
  - Project
star: true
date: "2025-04-02"
---

<div style="display: flex; gap: 1rem; justify-content: center;">
  <img src="https://raw.githubusercontent.com/zamoca42/GarminFitBot/main/frontend/src/lib/images/screenshots/chatbot-collect-fit-data.png" alt="데이터 수집 데모" width="45%"/>
  <img src="https://raw.githubusercontent.com/zamoca42/GarminFitBot/main/frontend/src/lib/images/screenshots/result-collect-fit-data.png" alt="데이터 수집 결과" width="45%"/>
</div>

최근 '가민 핏봇(Garmin FitBot)' 프로젝트를 진행하면서 겪었던 고민과 문제들, 그리고 그 과정에서의 경험을 공유하고자 합니다.

## 프로젝트의 시작

Garmin 스마트워치를 사용하며 다양한 건강 데이터를 수집할 수 있었지만, 아쉬움이 있었습니다.

![Garmin Connect에서 보여주는 수면 요약](https://github.com/user-attachments/assets/965e5577-fcb6-4515-b8a2-db3e34bb21ea)

"내 건강 데이터를 AI가 종합 분석해서 알려준다면 얼마나 좋을까?"

이런 생각에서 시작된 이 프로젝트는 Garmin 데이터를 AI로 분석하여 카카오톡 챗봇으로 제공하는 서비스로 발전했습니다.
2월 중순부터 계획을 세우고, 3월 말까지 약 5주간의 집중 개발 기간을 거쳐 서비스를 완성했습니다.

기술 스택 선정에 있어서도 실용적인 접근이 필요했습니다.  
GarminDB나 Garmin API를 지원하는 대부분의 레퍼런스와 라이브러리가 Python으로 작성되어 있었기 때문에, Python을 기반으로 프로젝트를 시작하게 되었습니다.  
백엔드는 FastAPI를, 프론트엔드는 SvelteKit을 선택했습니다.

## 챗봇 서비스 연결과 인증

카카오톡 챗봇과 Garmin API를 어떻게 연결할 것인가가 큰 과제였습니다.
특히 사용자가 카카오톡 챗봇에서 Garmin 계정을 연결하는 과정을 어떻게 설계할지 고민이 많았습니다.

처음에는 JWT 토큰 방식을 고려했으나 챗봇 환경에서는 맞지 않았습니다. 카카오톡 사용자는 웹 브라우저로 이동했다가 다시 챗봇으로 돌아와야 했기 때문입니다.

![다음과 같은 방식으로 설계했습니다](https://mermaid.ink/svg/pako:eNp9lG1v0lAUx7_KzX21JWzDAhv0xRIn0RhjNJm-MSTkht5BM2ixD-pclgytGPegWyKGISwszm0mGJExZck-Eff2O3h6C4wFkBC4bX_n9Jz_eVjHKV2hWMYmfW5TLUXjKkkbJJfQEHxIytIN9NSkBiIm4m8avPKDH-75D_PEsNSUmieahR6QVaIL5rLtfcvHbvEIsfb7UfT24_seeJeYlnfkTpW1nDGYbWWEw1qHn9QEdunwreNR8om-SjUPdYt1t9D8Hxpf8ji22-S1tus0WasOh7HkPWLkVOG1d4JYfcr_9TSZWVwUecvIrezwr3vd5iY_fId45TNv_fQx8Rw4sJbRHIGc5la9W3OmmtbsPHLLHf6n6rPAeCQwMsoQTcnSpGCTPjs13cMAAC6-JCN-6PDtKnILbVa78jL50nG3OgMd3ta483vIqB9HKqtSzUqqCmLNsntQvn79hIzYacEtNBCvO2y7MZwY8J4QE3FePBojmgjihoX7seyFf7oJRvu8uDsqyAtqqCtrST_0qUEGkzXxNei2NqF7fCi-NDNw15eoWncrZ6AScg9K0GmTgoUw2a8rxI6q3b8d4CDMEjtvw191bPl6FaM5omYD0Fem-VI3lACaELfoYKiLQYlFk2nRcP1Ue6RAAPW7UUaPxHz00xjqOB-YufZ6g2TNarfzYdjliCRDRR6WtT_716lD5b6jqZ6Z-6nhls6mx3QbqNs9v4A53mfbFzdazW-d_tQcOOzbDuKlHXZyhQM4Rw1QT4HNtO4ZJbCVoTmawDIcNWpbBskmcELbABTGSl9e01JYtgybBrCh2-kMlldI1oQrO6-Aqr211kdgxp_p-uCSKiosuof-JhQLUSBYXsevsCwFpdlobCEaC0cisWhQCi4E8BqW50OzoYgUkkLhYGQ-FA6FNwL4tXAanI1K0YgUDt8KLkjh-VAsFsBpw0umFyDVFGrc0W3NAu-RyMY_on1GJA)

1. 사용자가 챗봇에서 회원가입 요청
2. 카카오톡 사용자 고유 ID(client_id)를 포함한 임시 회원가입 URL 생성
3. 사용자가 URL을 통해 웹으로 이동해 Garmin 계정 정보 입력
4. 서버에서 client_id를 검증하고 임시 토큰 생성
5. Garmin OAuth 인증 후 사용자 정보와 토큰 저장
6. 사용자가 다시 챗봇으로 돌아와 서비스 이용

이런 방식을 통해 사용자는 한 번의 인증으로 챗봇에서 지속적으로 서비스를 이용할 수 있게 만들었습니다.

## 데이터 처리 전략

Garmin 기기는 다양한 건강 지표를 꾸준히 기록합니다.  
심박수(2분 간격), 스트레스(3분 간격), 수면 중 움직임(1분 간격), 걸음 수(15분 간격), 수면 HRV(5분 간격) 등의 데이터가 수집되어 하루 약 1,800개 정도의 데이터 포인트가 생성됩니다.  
개별 사용자의 데이터는 많지 않지만, 사용자가 늘어나고 데이터가 누적될수록 효율적인 저장과 검색 방법이 필요했습니다.

특히 고민했던 부분들은

- 시계열 데이터를 어떻게 효율적으로 관리할 것인가?
- 사용자가 늘어날수록 데이터는 증가하는데, 이를 어떻게 처리할 것인가?
- 과거 데이터와 최근 데이터의 접근 빈도가 다른데, 이를 어떻게 최적화할 것인가?

날짜 기반 파티셔닝 전략을 도입하면서 또 다른 문제가 발생했습니다. 시간대(timezone)를 UTC로 할지, 로컬 시간으로 할지의 문제였죠.

UTC 기준으로 파티셔닝하면 하루의 데이터가 두 파티션에 걸치는 문제가 발생합니다. 한국 시간(UTC+9) 기준으로 2025-03-05의 데이터는 UTC로는 2025-03-04 15:00부터 2025-03-05 14:59까지죠. 이로 인해 **오늘 하루 데이터**를 조회할 때 UTC로 조회하면 데이터가 누락되는 문제가 발생합니다.

**결국은 전략을 변경해서 수집일(created_at)을 기준으로 한달 단위로 파티셔닝하고, 로컬 시간을 인덱싱하는 방법을 시도했습니다.**
하나의 예시로 수면 중 움직임 모델을 sqlalchemy로 작성하면 다음과 같이 작성할 수 있습니다.

```python
class SleepMovement(Base, TimeStampMixin):
    __tablename__ = "sleep_movement"
    __table_args__ = (
        PrimaryKeyConstraint("sleep_session_id", "created_at", "start_time_local"),
        {"postgresql_partition_by": "RANGE (created_at)"},
    )

    sleep_session_id = Column(
        BigInteger, ForeignKey("sleep_sessions.id", ondelete="CASCADE"), nullable=False
    )
    start_time_gmt = Column(DateTime(timezone=True), nullable=False)
    start_time_local = Column(DateTime(timezone=False), nullable=False)
    interval = Column(Integer)
    activity_level = Column(Integer)  # 0: 깊은수면, 1: 얕은수면, 2: REM, 3: 깨어있음

    session = relationship("SleepSession", back_populates="movements", uselist=False)
```

데이터 수집일을 기준으로 파티셔닝을 관리하면 수집 후 1년이 지난 시점은 정리하도록 계획하면서 사용자가 관심있는 날짜를 기준으로 분석할 수 있습니다.
마지막으로 각 시계열 데이터 모델에서 복합키가 아닌 로컬 타임용 단일 인덱스를 추가해서 로컬 타임으로 쿼리할 수 있게 추가했습니다.

## 서비스 방향 설정

처음 계획은 '정해진 시간에 건강 리포트를 보내주는 알림 서비스'였습니다.
사용자가 관심 분야(운동, 수면, 스트레스 등)를 설정하면 매일 아침/저녁에 해당 데이터 분석 결과를 보내주는 방식이었죠.

그러나 개발을 진행하면서 몇 가지 의문이 생겼습니다.

- 어떤 시점에 데이터를 수집해야할까?
- 사용자가 정말 원하는 건 정해진 시간의 알림일까?
- 실제 궁금한 건 내가 지금 알고 싶은 특정 건강 정보 아닐까?
- 한 가지 관심사만 설정해야 한다면, 다른 분야의 데이터는 어떻게 활용할까?

이런 고민 끝에 서비스 방향을 알림 서비스에서 챗봇으로 정해진 알림이 아닌, 사용자가 대화를 통해 원하는 시점에 질문하고 AI가 맞춤형 건강 인사이트를 제공하는 방식으로 전환했습니다.  

## AI의 데이터 처리 한계

Garmin Connect 데이터를 AI로 분석하면서 생긴 가장 큰 문제는 시계열 데이터의 처리였습니다.  
심박수, 스트레스, 걸음 수와 같은 시계열 데이터는 각각 수백 개의 row를 가지고 있고, 이 모든 데이터를 한꺼번에 AI에 입력하면 문제가 발생했습니다.  
데이터와 프롬프트가 길어질수록 AI는 모든 데이터를 제대로 반영하지 못하는 현상이 나타났습니다.  
예를 들어, 일주일치 심박수 데이터를 제공하고 "가장 스트레스 받은 날은?"이라고 물으면 AI는 데이터의 일부만 참고하여 불완전한 답변을 제공하곤 했습니다.  

처음에는 LangGraph와 함께 ReAct(Reasoning + Acting) 패턴을 도입했습니다. AI가 스스로 추론하고 행동하는 방식이 적절하다고 생각했죠.  
하지만 곧 새로운 문제들이 발생했습니다.

![ReAct 패턴](https://github.com/user-attachments/assets/31c4bb26-a1bc-48a4-adfc-ac5ae0e4099e)

- AI가 무한 루프에 빠지는 경우가 있었습니다
- 적절한 도구를 찾지 못하고 엉뚱한 분석을 시도하는 경우가 있었습니다
- 이전 분석 결과를 망각하고 같은 작업을 반복하는 현상도 있었습니다

![Langsmith 로그에서 무한루프가 발생](https://github.com/user-attachments/assets/6644e76c-f842-469c-bfff-c984e52a2a95)

이러한 문제들을 해결하기 위해 ReAct 방식에서 벗어나 AI 시스템을 명확한 단계로 나누어 설계했습니다.

<div>
  <img src="https://raw.githubusercontent.com/zamoca42/GarminFitBot/main/backend/agent_graph.png" alt="Plan + 실행 + 분석 + 보고서로 나눈 패턴" height="25%"/>
<div/>

- 사용자 질문 분석 계획 단계 (어떤 데이터가 필요한지 판단)
- 필요한 데이터만 선택적으로 조회하는 단계
- 선택된 데이터에 집중하여 분석 + 추가 데이터 필요성을 판단하는 단계
- 최종 보고서 생성 단계

각 단계마다 특화된 프롬프트와 역할을 부여하고, 단계 간 전환을 조건으로 제어했습니다.  
이러한 방식으로 AI가 한 번에 처리해야 하는 데이터 양을 줄이고, 필요한 데이터에만 집중할 수 있게 했습니다.  
결과적으로 사용자에게 더 관련성 높은 답변을 제공할 수 있었습니다.  

## 서버 안정성과 확장성

개발을 진행하던 중 갑자기 서버 접속이 끊기는 문제가 발생했습니다. 로그를 확인해보니 CPU 사용량이 갑자기 41%까지 치솟은 후 연결이 끊겼더군요.

![EC2 인스턴스 연결성 검사 오류](https://github.com/user-attachments/assets/3b9f8306-2f5e-4baf-a24b-6b330873fd8f)

원인을 파악해보니 여러 도커 컨테이너를 한 인스턴스에서 운영하면서 메모리 부족 현상이 발생한 것이었습니다.

더 큰 문제는 데이터 분석 요청도 늘어날 때, 이를 어떻게 처리할 것인가였습니다. 서버를 증설하는 것도 방법이지만, 사용자 요청이 적을 때는 불필요한 비용이 발생합니다.

고민 끝에 다음과 같은 접근 방식으로 시스템을 분산하려고 했습니다.

- 로컬 Redis를 외부 서비스(Upstash)로 분리하여 서버 부하 감소
- 모니터링 시스템을 도입하여 문제 조기 발견
- 스왑 파일 설정으로 메모리 부족 문제 완화
- Celery beat으로 시도했던 파티셔닝 관리 시스템을 DB에서 관리
- ECS를 통한 자동 스케일링 컨테이너 도입 (작업량에 따라 워커 증감)

이렇게 함으로써 서버 안정성을 확보하고, 인스턴스에 오류가 발생했을 때 빠르게 대응할 수 있게 되었습니다.
자세한 내용은 다음 후기에서 다뤄보도록 하겠습니다.

## 마무리

가민 핏봇 프로젝트는 사용자의 건강 데이터를 의미 있는 인사이트로 변환하여 더 나은 건강 습관을 형성하는 데 도움을 주고자 하는 목표에서 시작되었습니다.

이 프로젝트는 2월 중순부터 3월 말까지 약 5주라는 기간 동안 혼자서 진행했습니다. 저는 이 프로젝트를 통해 평소 익숙하지 않았던 다양한 역할을 경험해볼 수 있었습니다.

- **백엔드**: FastAPI 서버 구축, 데이터베이스 설계, API 개발
- **데브옵스**: AWS 인프라 구축, 도커 컨테이너화, CI/CD 파이프라인 설정
- **프론트엔드**: Svelte를 활용한 회원가입 및 로그인, 상태 페이지 구현
- **AI**: LangGraph를 활용한 대화형 AI 에이전트 설계
- **UX**: 카카오톡 챗봇 시나리오 설계
- **프로젝트 관리**: 주별 목표 설정 및 개발 일정 관리

전체 시스템을 설계하고 구현하는 과정은 쉽지 않았지만, 이를 통해 서비스의 모든 측면을 넓은 관점에서 보게되었을 때 빠르게 문제를 해결할 수 있었습니다. 
앞으로도 사용자 피드백을 수렴하며 더 발전시켜 나갈 계획입니다.  

이 프로젝트를 통해 배운 가장 큰 교훈은, 기술 자체보다 그 기술이 사용자에게 어떤 가치를 제공할 수 있는지를 항상 고민해야 한다는 것입니다.
데이터는 그저 숫자가 아니라, 사용자의 삶을 개선할 수 있는 가능성을 담고 있으니까요.

---

서비스 링크:

- [웹사이트](https://garmin-fit-bot.vercel.app/)
- [카카오톡 채널](https://pf.kakao.com/_GVxmnn)
