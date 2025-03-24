# 데이터 구조(예상안)

## 1. 회원가입/로그인
- 목적 : 사용자 인증 및 커플 단위 정보 관리
- 주요 화면 : 회원가입, 로그인, 이메일 인증
- 핵심 요소 :
    - 이메일/비밀번호 기반 로그인
    - OAuth 소셜 로그인


## 2. 커플 연결 기능
- 목적 : 서로 다른 사용자를 하나로 묶기
- 주요 화면 : 초대 코드 입력 화면 
- 핵심 요소 :
    - 사용자 A가 초대코드 생성
    - 사용자 B가 해당코드 입력 -> 연결

## 3. 일정 공유 캘린더
- 목적 : 커플이 함께 일정을 확인하고 조율
- 주요 화면 : 월간/주간 캘린더, 일정 등록/수정 팝업
- 핵심 요소 :
    - 커플 공용 일정 + 개인 일정 구분
    - 반복 일정, 색상 태그 지정

## 4. 공동 할 일/미션 리스트
- 목적 : 둘이 함꼐 할 일을 정하고 완료 시 XP 획득
- 주요 화면 : 할 일 목록, 미션 완료 체크
- 핵심 요소 :
    - 완료 시 XP, 골드 보상
    - 미션 마감일, 우선순위, 카테고리 설정
    - 보상 상한선 존재

## 5. 경험치
- 목적 : 습관 형성을 재미있게 만드는 게이미피케이션 요소
- 주요 화면 : 프로필
- 핵심 요소 :
    - 미션 완료 -> 경험치 상승 -> 레벨업
    - 레벨 보상 : 재화

## 6. 공동 다이어리/일기장
- 목적 : 함꼐한 순간을 기억하고 되돌아 보기
- 주요 화면 : 일기 목록, 작성/수정 페이지
- 핵심 요소 :
    - 리치 텍스트 에디터
    - 이미지 업로드, 날씨/기분 태그

## 7. 알림/리마인드 시스템
- 목적 : 일정, 할 일 마감 전 사용자에게 알림
- 주요 화면 : 알림 목록, 설정 화면
- 핵심 요소 :
    - 브라우저 푸시 알림
    - 특정 시간 전 알림 설정

--------------------------

# 전체 데이터 구조

### 1. User(사용자)
```
{
  _id: ObjectId,
  email: String,
  passwordHash: String,
  nickname: String,
  profileImage: String,
  coupleId: ObjectId,   // Couple에 대한 참조
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Couple(커플)
```
{
  _id: ObjectId,
  users: [ObjectId],              // 두 사람의 userId
  startedDating: Date,
  sharedGoals: [String],          // 선택적
  activeQuestIds: [ObjectId],     // 진행 중인 커플 퀘스트 ID 목록
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Schedule(일정)
```
{
  _id: ObjectId,
  coupleId: ObjectId,
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  repeat: String,                 // 'none', 'daily', ...
  isCompleted: Boolean,
  createdBy: ObjectId,
  participants: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### 4. ExchangeJournal(교환 일기)
```
{
  _id: ObjectId,
  coupleId: ObjectId,
  senderId: ObjectId,             // 작성자
  content: String,
  images: [String],               // optional
  mood: String,                   // optional
  turnNumber: Number,             // 1부터 증가
  isRead: Boolean,                // 상대가 읽었는지
  createdAt: Date
}
```

### 5. UserQuest(개인 퀘스트)
```
{
  _id: ObjectId,
  userId: ObjectId,              // 퀘스트를 수행하는 사람
  assignedBy: ObjectId,          // 본인 or 파트너
  title: String,
  description: String,
  goalType: String,
  targetValue: Number,
  currentValue: Number,
  isCompleted: Boolean,
  reward: {
    exp: Number
  },
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date
}
```

### 6. CoupleQuest(커플 퀘스트)
```
{
  _id: ObjectId,
  coupleId: ObjectId,
  title: String,
  description: String,
  goalType: String,
  targetValue: Number,
  currentValue: Number,
  isCompleted: Boolean,
  reward: {
    exp: Number,                  // 캐릭터 EXP 보상
    gold: Number
  },
  createdBy: ObjectId,           // 제안자
  agreed: Boolean,               // 상대가 수락했는지 여부
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date
}
```

### 7. Character(캐릭터)
```
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  type: String,                   // ex: bunny, bear
  level: Number,
  exp: Number,
  gold: Number,                  // 보유 재화량
  createdAt: Date,
  updatedAt: Date
}
```

### 8. CharacterCustmization(캐릭터 외형)
```
// 추가 될 가능성 있음
{
  _id: ObjectId,
  characterId: ObjectId,
  clothes: String,           // ex: 'hoodie', 'suit'
  accessories: [String],     // ex: ['hat', 'glasses']
  updatedAt: Date
}
```

### 9. Notification(알림)
```
{
  _id: ObjectId,
  userId: ObjectId,              // 알림 대상자
  type: String,                  // 'schedule', 'exchange_journal', 'quest'
  content: String,
  isRead: Boolean,
  createdAt: Date
}
```
---

# 🔄 주요 흐름 요약

| 활동 | 효과 |
| --- | ---|
| 일정 완료 | 캐릭터 EXP 증가|
| 교환 일기 작성 | 알림 전송(ExchangeJournal + Notification) |
| 개인 퀘스트 완료 | 캐릭터 EXP 증가(UserQuest.reward.exp) |
| 커플 퀘스트 완료 | 양쪽 캐릭터 EXP 증가(CoupleQuest.reward.exp) |
| 커스터마이징 변경 | 외형 상태만 변경, 성장 수치 영향 X |
<br>


# 추가해볼 요소
- 아이템 스토어
- 구매 내역 기록
