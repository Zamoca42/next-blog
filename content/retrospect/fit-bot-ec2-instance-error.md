---
title: "예상치 못한 서버 다운, 그리고 메모리 부족 장애 대응기"
tag:
  - GarminFitBot
  - Project
star: true
date: "2025-04-09"
---

카카오톡 챗봇 서비스 **GarminFitBot**을 운영하면서, 어느 날 사용자로부터 "서버 오류" 메시지를 받았습니다. 확인해보니 서비스는 실제로 멈춰 있었고, AWS 콘솔에 "인스턴스 연결성 검사 실패" 경고가 떠 있었습니다.

![EC2 인스턴스의 연결성 검사 실패 메세지](/images/ec2-instance-error.png)

이번 글에서는 그때 겪었던 **메모리 부족 장애의 원인과 대응 과정**, 그리고 이후 **시스템을 개선하기 위해 시도한 내용들**을 정리해보았습니다.

<!-- end -->

## 🧨 장애 원인

로그를 확인하던 중 다음과 같은 메시지를 발견했습니다:

```
zram_generator::config[1936]: zram0: system has too much memory (949MB), limit is 800MB, ignoring.
```

이는 시스템 메모리가 `zram-generator`의 제한(800MB)을 초과해, zram 스왑 디바이스가 생성되지 않았다는 의미였습니다.  
개별 컨테이너는 많은 리소스를 쓰지 않았지만, 로컬 Redis, Celery worker, beat, flower, FastAPI 등 여러 컨테이너가 동시에 동작하면서 **전체 시스템 메모리가 부족**해진 상태였습니다.

## 🔧 대응 과정

### 1. 스왑 파일 생성 (즉각 대응)

장애 상황에서 가장 먼저 고민한 건, "어떻게든 서비스를 빨리 다시 띄우는 것"이었습니다. 메모리 부족이 명확했기 때문에 스왑 공간을 확보해 일단 정상 부팅과 프로세스 기동이 가능한 상태로 만드는 것이 급선무였습니다.

사실 처음에는 zram 설정 오류를 직접 고쳐볼까 했지만, 시스템 메모리 구조를 건드리는 건 리스크가 있다고 판단해 가장 빠르고 안전한 방법인 스왑 파일 생성을 선택했습니다.

파일시스템이 ext4였기 때문에 `fallocate` 명령어를 사용할 수 있었고, 빠르게 적용할 수 있었습니다.

우선 스왑 파일을 생성해 시스템을 임시로 안정화시켰습니다. ext4 파일시스템이었기 때문에 `fallocate` 명령어를 사용할 수 있었습니다.

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 2. Celery Worker ECS Fargate 분리

장애 당시, 가장 리소스를 많이 사용하는 Celery Worker가 원인일 수 있다고 판단했습니다.  
로컬에서 Worker를 실행해하면 fastapi와 같은 메모리를 차지하는 것을 확인했습니다.

![`docker stats`로 현재 실행중인 컨테이너 메모리를 확인](/images/docker-local-stats.png)

FastAPI와 워커가 같은 인스턴스에서 동작하다 보니 워커 작업이 몰릴 경우 API까지 영향을 주는 구조였고, 이를 분리해야 안정성이 확보될 것 같았습니다.

처음엔 EC2를 하나 더 두는 방안도 고려했지만, 유휴 상태가 많은 워커 특성상 **Fargate로 필요할 때만 실행되는 구조**가 더 적합하다고 판단했고,  
메시지 브로커도 로컬 Redis에서 Upstash Redis로 교체해 통신 구조를 단순화했습니다.

ECS Task Definition 일부:

```json
{
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "celery-worker",
      "image": "<ECR_URL>",
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/celery-worker"
        }
      }
    }
  ]
}
```

### 3. 실시간 스케일 아웃/인 전략 적용

처음에는 CloudWatch 메트릭 기반의 자동 스케일링을 설정했습니다. 하지만 CloudWatch는 5분 주기로 메트릭을 수집하고 반영하기 때문에,  
작업 처리 시간이 10초 남짓한 Celery 워커 구조에서는 너무 느리다는 문제가 있었습니다.

실제로는 컨테이너가 실행되기 전에 작업이 끝나버리는 상황도 있었고, 반대로 워커가 너무 오래 켜져 있는 일도 많았습니다.  

그래서 **즉각적으로 워커를 실행할 수 있는 EventBridge 트리거 방식으로 전환**했습니다. FastAPI 서버에서 Eventbridge용 함수를 작성해서 필요할 때 EventBridge를 통해 ECS 워커를 바로 실행하도록 했습니다.

그리고 반대로, 워커가 유휴 상태일 경우 자동으로 종료되도록 하기 위해 Step Function과 5분 간격의 스케줄러를 이용해 ECS 상태를 주기적으로 점검하고, 작업이 없으면 워커를 종료하는 방식으로 스케일 인을 구현했습니다.

#### ✅ 구조 요약

| 방향        | 방식                     | 설명                             |
| ----------- | ------------------------ | -------------------------------- |
| 스케일 아웃 | FastAPI → EventBridge    | 큐 길이 증가 시 즉시 Worker 실행 |
| 스케일 인   | Step Function (5분 주기) | 유휴 상태면 Worker 중단          |

#### 주요 코드

**EventBridge 트리거**

```python
# FastAPI → EventBridge
import json, boto3

eventbridge.put_events(
  Entries=[{
    "Source": "custom.celery.monitor",
    "DetailType": "celery.task.queue_full",
    "Detail": json.dumps({"scale_to": 1}),
    "EventBusName": "default"
  }]
)
```

**스케일 아웃 lambda**

```python
import boto3, json

def lambda_handler(event, context):
    ecs = boto3.client("ecs", region_name="ap-northeast-2")

    response = ecs.update_service(
        cluster="celery-worker-cluster",
        service="celery-worker-service",
        desiredCount=1
    )
    
    return {
        "status": "scaled out",
        "service": response["service"]["serviceName"],
        "desiredCount": response["service"]["desiredCount"]
    }

```

**스케일 인 lambda**

```python

# scaleInLambda

import boto3

def lambda_handler(event, context):
    ecs = boto3.client("ecs", region_name="ap-northeast-2")

    response = ecs.update_service(
        cluster="celery-worker-cluster",
        service="celery-worker-service",
        desiredCount=0
    )

    return {
        "status": "scaled in",
        "service": response["service"]["serviceName"],
        "desiredCount": response["service"]["desiredCount"]
    }

# checkQueueAndWorker

import redis
import boto3

def lambda_handler(event, context):
    ecs = boto3.client("ecs", region_name="ap-northeast-2")

    response = ecs.describe_services(
        cluster="celery-worker-cluster",
        services=["celery-worker-service"]
    )

    if not response["services"]:
        raise Exception("ECS service not found")

    service = response["services"][0]
    desired_count = service["desiredCount"]

    if desired_count == 0:
        return {
            "should_scale_in": False,
            "desired_count": 0
        }

    try:
        r = redis.Redis.from_url("rediss://default:default.upstash.io:6379?ssl_cert_reqs=required")
        queue_len = r.llen("celery")
        active_tasks = int(r.get("celery:active_tasks") or 0)
    except Exception as e:
        return {
            "should_scale_in": False,
            "error": str(e)
        }

    should_scale_in = queue_len == 0 and active_tasks == 0

    return {
        "should_scale_in": should_scale_in,
        "queue_len": queue_len,
        "active_tasks": active_tasks,
        "desired_count": desired_count
    }

```

![step function으로 5분마다 워커가 실행중인 것을 확인하고 워커를 종료](/images/worker-step-function.png)

### 4. 모니터링 체계 구축

이번 장애를 겪으면서 가장 뼈아팠던 건, 서비스가 멈췄는데도 **내가 가장 마지막에 알았다는 점**이었습니다. 사용자 제보가 아니었다면 문제가 더 오래 지속됐을 수도 있었고, 이는 운영자로서 가장 피하고 싶은 상황이었습니다.

그래서 가장 먼저 떠오른 개선 방향이 '모니터링'이었습니다. 처음에는 어떤 도구를 써야 할지, 시스템 상태를 어느 수준까지 모니터링해야 할지 막막했지만,  
기본적인 지표인 메모리 사용률부터 시작하기로 했고 Prometheus + Grafana 조합을 도입했습니다.

![Grafana는 Prometheus만으로 Cloud를 통해 대시보드를 구성할 수 있습니다](/images/grafana-cloud-dashboard.png)

그리고 메모리 사용률이 80%를 초과하면 알림이 오도록 설정해, 최소한 다음 장애는 내가 먼저 감지할 수 있게 만들었습니다.

```yaml
- alert: HighMemoryUsage
  expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 80
  for: 5m
  annotations:
    summary: "High memory usage on instance"
```

---

### 5. Celery Beat/Flower 제거 & DB 기반 자동화 전환

기존에는 Celery Beat을 사용해 파티셔닝 테이블을 관리하고 있었는데, 이를 위해 컨테이너를 하나 더 띄워야 한다는 점이 부담이었습니다. 특히 단순한 스케줄링 작업을 위해 메모리 자원이 추가로 필요하다는 것이 비효율적으로 느껴졌습니다.

이 문제를 해결하기 위해 **pg_partman + pg_cron 조합으로 데이터베이스 내부에서 직접 작업을 관리하는 구조**로 변경했습니다. 처음에는 `pg_cron`이 정상 작동하지 않아 꽤 헤맸는데, 나중에 AWS RDS에서는 파라미터 그룹을 통해 `shared_preload_libraries`에 `pg_cron`을 추가해줘야 한다는 사실을 알게 되었고, 이를 통해 정상적으로 동작시킬 수 있었습니다.

pg_cron을 통해 매달 20일 새벽 2시에 파티셔닝을 관리를 실행하도록 설정했습니다.

```sql
SELECT cron.schedule(
  'run_pg_partman_maintenance_monthly',
  '0 2 20 * *',
  $$CALL partman.run_maintenance_proc();$$
);
```

또한 다음과 같은 방식으로 premake/retention 설정도 적용했습니다:

```sql
UPDATE partman.part_config
SET premake = 3,
    retention = '1 year'
WHERE parent_table = 'public.heart_rate_readings';
```

![이렇게 파티셔닝 테이블이 생성된 것을 볼 수 있습니다](/images/pg-partman-partioning-table.png)

## 📊 대응 결과

- Grafana 기준 368MiB의 여유 메모리가 확보됨
- ECS 기반으로 Celery 분리 및 자동 스케일링 구조 정착
- Beat/Flower 제거 → 컨테이너 수 감소

## ✍️ 느낀 점

장애보다 더 아쉬웠던 건, **문제가 생겼을 때 내가 가장 늦게 알았다는 점**이었습니다. 그제서야 운영이란 단순히 서비스가 '잘 돌아가고 있는지' 보는 게 아니라, **문제가 생기면 가장 먼저 알아채는 감각**이 필요하다는 걸 알게 됐습니다.

지금은 메모리/CPU 사용량 이상 징후를 빠르게 감지할 수 있는 체계를 갖췄고, 작은 문제도 조기에 대응할 수 있게 되었습니다. 실제 사용자가 있는 서비스에서는 이런 감각이 반드시 필요하다는 걸 이번에 제대로 느꼈습니다.

비슷한 상황을 겪고 있는 분들에게 조금이나마 도움이 되기를 바랍니다.
