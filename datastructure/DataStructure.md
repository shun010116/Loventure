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
1. 아이템 스토어
2. 구매 내역 기록
