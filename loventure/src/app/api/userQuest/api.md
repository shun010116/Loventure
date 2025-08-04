# API 목록

| 메서드 | 경로 | 설명 |
| :--- | --- | --- |
| POST | /api/userQuest | 유저퀘스트 생성 |
| PATCH | /api/userQuest/:id | 퀘스트 수정 |
| DELETE | /api/userQuest/:id | 퀘스트 삭제 |
| PATCH | /api/userQuest/:id/accept | 퀘스트 수락 |
| PATCH | /api/userQuest/:id/reject | 퀘스트 거절 |
| PATCH | /api/userQuest/:id/complete | 퀘스트 완료 요청 |
| PATCH | /api/userQuest/:id/approve | 퀘스트 완료 승인 (보상 지급 포함) |

# 프론트 상태 흐름

## 전체 흐름 요약:needsApproval 여부에 따른 상태 분기
| 상태(status) | 설명 | needsApproval:true | needsApproval:false |
| --- | ---| --- | --- |
| pending | 퀘스트가 도착했으나 수락 전 | ✅ 수락/거절 버튼 | ✅ 동일 |
| accepted | 유저가 수락한 상태 | ✅ 완료 버튼 → 완료 요청 | ✅ 완료 버튼 → 자동 보상 |
| completed | 완료 요청한 상태 | ✅ 파트너 승인 대기 | ❌ 불가능 (이 상태까지 가지 않음) |
| approved | 최종 완료 상태 | ✅ 파트너 승인 후 보상 지급 | ✅ 자동 승인 및 보상 지급 |
| rejected | 퀘스트 거절됨 | ✅ 거절 버튼 누름 | ✅ 동일 |