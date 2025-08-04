# CoupleQuest 관련 API

## 완료 조건 분기

| goalType | 의미 | 완료 조건 |
| --- | --- | --- |
| shared-count | 두 사람의 진행 합산 | sum(progress) >= targetValue |
| both-complete | 둘 다 각각 수행 | progress[유저1] >= targetalue && progress[유저2] >= targetValue |

## API
| 메서드 | 경로 | 설명|
| --- | --- | --- |
| POST | /api/coupleQuest | 커플 퀘스트 생성 |
| PATCH | /api/coupleQuest/:id/progress | 진행도 증가 |
| GET | /api/coupleQuest | 현재 커플 퀘스트 목록 |