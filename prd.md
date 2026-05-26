# 충북match — Product Requirements Document (PRD)

> **버전**: v1.0  
> **작성일**: 2026-05-26  
> **작성자**: 충북match 개발팀  
> **상태**: 초안 (Draft)

---

## 목차

1. [제품 개요](#1-제품-개요)
2. [목표 및 성공 지표](#2-목표-및-성공-지표)
3. [사용자 페르소나](#3-사용자-페르소나)
4. [정보 아키텍처](#4-정보-아키텍처)
5. [기능 요구사항 상세](#5-기능-요구사항-상세)
6. [데이터베이스 설계](#6-데이터베이스-설계)
7. [API 설계](#7-api-설계)
8. [UI/UX 가이드라인](#8-uiux-가이드라인)
9. [비기능 요구사항](#9-비기능-요구사항)
10. [개발 로드맵](#10-개발-로드맵)
11. [리스크 및 제약사항](#11-리스크-및-제약사항)

---

## 1. 제품 개요

### 1.1 제품 비전

충북대학교 학생들이 스포츠 매치 상대를 손쉽게 찾고, 경기를 신청하며, 매치 후 매너를 평가할 수 있는 **교내 전용 스포츠 매칭 플랫폼**을 제공한다.

### 1.2 핵심 가치 제안

| 가치 | 설명 |
|------|------|
| 간편한 매치 탐색 | 종목·수준별 필터로 원하는 상대를 빠르게 발견 |
| 실시간 커뮤니케이션 | 신청·수락·채팅 전 과정이 지연 없이 진행 |
| 신뢰 기반 생태계 | 매너 평가 시스템으로 매너 있는 경기 문화 형성 |
| 충북대 전용 | 학번 인증으로 재학생만 이용 가능한 신뢰도 높은 커뮤니티 |

### 1.3 기술 스택 요약

| 구분 | 기술 | 선택 이유 |
|------|------|-----------|
| Frontend | Next.js 14 (App Router) | SSR/SSG 지원, Vercel 최적화 |
| Styling | Tailwind CSS | 빠른 UI 구현, 일관된 디자인 |
| Database | Supabase (PostgreSQL) | 무료 플랜, Row Level Security, Realtime 내장 |
| 인증 | Supabase Auth | 세션 관리, JWT 내장 |
| 실시간 | Supabase Realtime | WebSocket 기반 실시간 구독 |
| 배포 | Vercel | Next.js 공식 배포 플랫폼, Edge Network |

---

## 2. 목표 및 성공 지표

### 2.1 제품 목표

- 충북대 재학생 간 스포츠 매치 성사율 극대화
- 매치 신청부터 수락까지 평균 1시간 이내 처리
- 매너 평가 참여율 70% 이상

### 2.2 핵심 성과 지표 (KPI)

| 지표 | 목표치 |
|------|--------|
| 회원가입 수 | 서비스 오픈 1개월 내 100명 |
| 매치 게시글 수 | 주간 20건 이상 |
| 매치 성사율 | 신청 대비 50% 이상 수락 |
| 매너 평가 참여율 | 매치 확정 건 대비 70% 이상 |
| 실시간 응답 지연 | 알림·채팅 메시지 2초 이내 전달 |

---

## 3. 사용자 페르소나

### 페르소나 A — 매치 주최자 (매치글 작성자)

> 충북대 체육학과 3학년 **김민준** (22세)
>
> - 주 2~3회 풋살을 즐기지만 상대팀 구하기가 어려움
> - 카카오톡 오픈채팅방으로 상대 찾는 번거로움을 느낌
> - **니즈**: 종목·수준에 맞는 상대를 빠르게 구하고 싶다

### 페르소나 B — 매치 신청자

> 충북대 컴퓨터공학과 2학년 **이서연** (20세)
>
> - e스포츠 동호회 활동 중, 다른 팀과 스크림(연습 경기)를 원함
> - 실력 수준이 맞는 상대를 찾고 싶음
> - **니즈**: 내 실력 수준에 맞는 상대 팀을 필터로 찾고 바로 신청하고 싶다

### 페르소나 C — 일반 사용자 (관전·평가 중심)

> 충북대 경영학과 1학년 **박지호** (19세)
>
> - 가끔 농구를 즐기며 매너 있는 상대를 원함
> - 상대팀의 매너 점수를 보고 신청 여부를 결정하고 싶음
> - **니즈**: 매너 평가 이력을 보고 신뢰할 수 있는 상대와 경기하고 싶다

---

## 4. 정보 아키텍처

```
충북match
├── 공개 영역 (비로그인)
│   ├── /                  ← 랜딩 페이지 (서비스 소개)
│   ├── /login             ← 로그인
│   └── /signup            ← 회원가입
│
└── 인증 영역 (로그인 필수)
    ├── /match             ← 매치 목록 (메인)
    ├── /match/write       ← 매치글 작성
    ├── /match/[id]        ← 매치 상세
    ├── /review            ← 팀 후기 목록 / 작성
    ├── /messages          ← 매치 메시지 채팅 목록
    ├── /messages/[id]     ← 개별 채팅방
    ├── /profile           ← 내 정보
    └── /notifications     ← 알림 센터
```

---

## 5. 기능 요구사항 상세

### 5.1 회원가입

#### 유저 스토리
> "충북대 재학생으로서, 내 학번으로 가입하여 신뢰할 수 있는 스포츠 커뮤니티에 참여하고 싶다."

#### 입력 필드 명세

| 필드 | 타입 | 제약 조건 | 오류 메시지 |
|------|------|-----------|-------------|
| 아이디 | text | 영문 소문자+숫자, 4~20자, 중복 불가 | "이미 사용 중인 아이디입니다." |
| 비밀번호 | password | 최소 8자, 영문+숫자 포함 | "비밀번호는 8자 이상이어야 합니다." |
| 비밀번호 확인 | password | 비밀번호와 일치 | "비밀번호가 일치하지 않습니다." |
| 이름(실명) | text | 한글 2~5자 | "올바른 이름을 입력해 주세요." |
| 닉네임 | text | 2~10자, 중복 불가 | "이미 사용 중인 닉네임입니다." |
| 학번 | text | 숫자 8자리 정확히, maxLength=8 | "학번은 8자리 숫자여야 합니다." |

#### 학번 유효성 검증 규칙

```
형식: YYYY0000 (앞 4자리: 입학연도, 뒤 4자리: 학번)
- 입학연도: 1990 ~ 현재연도 범위
- 숫자 외 문자 입력 불가 (input type="number" 또는 pattern="[0-9]{8}")
- maxLength 속성으로 8자리 초과 입력 차단
```

#### 인증 플로우

```
1. 사용자 폼 입력
2. 클라이언트 유효성 검사 (실시간)
3. 아이디/닉네임 중복 확인 버튼 → Supabase profiles 테이블 조회
4. [가입하기] 클릭
5. Supabase Auth → auth.users 에 이메일(아이디@cbnu.match) + 비밀번호 등록
6. profiles 테이블에 부가 정보 INSERT
7. 가입 완료 → 로그인 페이지로 리다이렉트
```

---

### 5.2 로그인

#### 유저 스토리
> "등록한 아이디와 비밀번호로 빠르게 로그인하고 싶다."

#### 플로우

```
1. 아이디 + 비밀번호 입력
2. Supabase Auth signInWithPassword() 호출
3. 성공 → JWT 세션 저장 → /match 리다이렉트
4. 실패 → "아이디 또는 비밀번호가 올바르지 않습니다." 표시
```

#### 세션 관리

- Supabase 클라이언트가 localStorage에 세션 자동 저장
- 페이지 새로고침 시 세션 자동 복구
- 로그아웃 시 세션 삭제 + `/login` 리다이렉트

---

### 5.3 매치 목록 (/match)

#### 유저 스토리
> "원하는 종목과 수준의 매치를 빠르게 찾아 신청하고 싶다."

#### 화면 구성

```
┌─────────────────────────────────────┐
│  [전체] [⚽축구] [🥅풋살] [🏀농구] [🎮e스포츠]  ← 종목 필터
│  [전체] [초급] [중급] [고수]                    ← 수준 필터
├─────────────────────────────────────┤
│  매치 카드 목록 (최신순)                         │
│  ┌────────────────────────────────┐  │
│  │ ⚽ 축구 | 5vs5 | 중급           │  │
│  │ 팀명: FC충북 | 모집 중 🟢       │  │
│  │ "같이 즐겁게 뛸 팀 구해요"      │  │
│  │              [매치 신청] 버튼   │  │
│  └────────────────────────────────┘  │
└─────────────────────────────────────┘
```

#### 매치 신청 상세 플로우

```
[매치 신청] 클릭
    │
    ├─ 본인 게시글인가? → "본인 게시글에는 신청할 수 없습니다." 표시
    │
    ├─ 이미 신청했는가? → "이미 신청한 매치입니다." 표시
    │
    └─ 정상 신청
        ↓
        match_applications 테이블 INSERT (status: 'pending')
        ↓
        notifications 테이블 INSERT (매치글 작성자 수신)
        ↓
        Supabase Realtime → 작성자 브라우저에 알림 Push
        ↓
        알림 내용: "[닉네임] 님이 매치를 신청했습니다. 실력: [수준]"
        ↓
        작성자 알림 UI에서 [매치 수락] / [매치 거절] 선택
            ├─ 수락: status → 'accepted', 매치 상태 '매치 확정', 채팅방 생성
            └─ 거절: status → 'rejected', 신청자에게 "거절되었습니다." 알림 발송
                     매치글 상태는 '모집 중' 유지
```

---

### 5.4 매치글 작성 (/match/write)

#### 유저 스토리
> "우리 팀 정보와 원하는 상대 조건을 작성하여 매치 상대를 모집하고 싶다."

#### 폼 필드 명세

| 필드 | UI 컴포넌트 | 필수 여부 | 제약 |
|------|-------------|-----------|------|
| 팀명 | text input | ✅ | 2~20자 |
| 종목 | radio / card select | ✅ | 4가지 중 1개 선택 |
| 매치 인원 | radio / button group | ✅ | 1vs1 / 3vs3 / 5vs5 / 11vs11 |
| 소개글 | textarea | ✅ | 10~500자 |
| 원하는 수준 | radio / button group | ✅ | 초급 / 중급 / 고수 |

#### 인원 ↔ 종목 연관 규칙

| 종목 | 허용 인원 |
|------|-----------|
| ⚽ 축구 | 5vs5, 11vs11 |
| 🥅 풋살 | 3vs3, 5vs5 |
| 🏀 농구 | 3vs3, 5vs5 |
| 🎮 e스포츠 | 1vs1, 3vs3, 5vs5 |

> 종목 선택 시 해당 종목에서 불가능한 인원 옵션은 비활성화(disabled) 처리

---

### 5.5 팀 후기 (/review)

#### 유저 스토리
> "매치가 끝난 후 상대팀의 매너를 별점으로 평가하고, 내가 받은 평가를 확인하고 싶다."

#### 평가 조건 체크

```
평가 버튼 활성화 조건:
  1. match_applications.status = 'accepted' (매치 확정 상태)
  2. 해당 매치의 참여자 (작성자 또는 신청자)
  3. 해당 매치에 대해 아직 평가를 작성하지 않은 상태
     (reviews 테이블에 reviewer_id + match_id 조합이 없음)
```

#### 평가 저장 로직

```
별점 선택 (1~5) + [평가 제출] 클릭
    ↓
reviews 테이블 INSERT
    ├─ reviewer_id: 현재 로그인 유저
    ├─ reviewee_id: 상대방
    ├─ match_id: 해당 매치
    └─ rating: 1~5
    ↓
이미 평가한 경우 → INSERT 차단 (UNIQUE 제약)
    ↓
상대방 프로필의 평균 점수 실시간 업데이트
```

---

### 5.6 매치 메시지 (/messages)

#### 유저 스토리
> "매치 수락 후 상대방과 경기 장소, 시간 등을 직접 채팅으로 조율하고 싶다."

#### 채팅방 생성 조건

```
match_applications.status = 'accepted' 로 업데이트되는 순간
→ message_rooms 테이블에 자동 row INSERT
→ 양 참여자 모두 /messages 에서 해당 채팅방 접근 가능
```

#### 실시간 채팅 구현

```
Supabase Realtime SUBSCRIBE
    채널: messages:room_id=eq.[room_id]
    이벤트: INSERT

신규 메시지 수신 시:
    → 채팅창 자동 스크롤 다운
    → 상대방 탭에 미읽음 배지 증가
    → 알림 시스템에 새 메시지 알림 발송
```

---

### 5.7 내 정보 (/profile)

#### 유저 스토리
> "내 프로필을 확인하고 닉네임·실력 수준을 언제든지 수정하고 싶다. 또한 내가 받은 매너 평가 이력을 확인하고 싶다."

#### 섹션 구성

```
┌─────────────────────────────┐
│  👤 프로필                    │
│  닉네임: [수정 가능]           │
│  아이디: cbnu_user            │
│  학번:   202*****             │ ← 마스킹
│  실력:   [중급 ▼] 드롭다운     │ ← 즉시 저장
├─────────────────────────────┤
│  ⭐ 매너 평가                  │
│  평균 점수: ★★★★☆ (4.2)       │
│  ─────────────────          │
│  축구 vs FC충북  ★★★★★        │
│  농구 vs 농구왕  ★★★☆☆        │
└─────────────────────────────┘
```

#### 정보 수정 실시간 반영 요구사항

- 닉네임 수정: 저장 즉시 `profiles` 테이블 UPDATE → 모든 매치글·채팅에서 변경된 닉네임 표시
- 실력 수준 변경: 드롭다운 선택 즉시 DB UPDATE → 이후 작성되는 매치 신청에 반영

---

### 5.8 알림 시스템

#### 알림 유형 명세

| ID | 이벤트 | 수신자 | 메시지 | 액션 버튼 |
|----|--------|--------|--------|-----------|
| N1 | 매치 신청 수신 | 매치글 작성자 | "[닉네임] 님이 매치를 신청했습니다. 실력: [수준]" | [수락] [거절] |
| N2 | 매치 수락 | 신청자 | "매치가 수락되었습니다! [팀명]과의 매치가 확정됐어요." | [채팅 시작] |
| N3 | 매치 거절 | 신청자 | "거절되었습니다." | - |
| N4 | 새 메시지 | 채팅 상대방 | "[닉네임]: [메시지 미리보기]" | [채팅 열기] |

#### 알림 처리 방식

```
Supabase Realtime 구독
  채널: notifications:user_id=eq.[현재 유저 ID]
  이벤트: INSERT

수신 시:
  1. 헤더 알림 벨 아이콘에 배지 숫자 +1
  2. 토스트(Toast) 메시지 우측 하단 팝업 (3초 자동 소멸)
  3. /notifications 페이지에 내역 누적
  4. 읽음 처리 시 배지 감소
```

---

## 6. 데이터베이스 설계

### 6.1 ERD (Entity Relationship Diagram)

```
auth.users (Supabase 내장)
    │ 1
    │
    ▼ N
profiles
    ├─ id (UUID, FK → auth.users.id)
    ├─ username (TEXT, UNIQUE)          ← 아이디
    ├─ nickname (TEXT, UNIQUE)
    ├─ full_name (TEXT)                 ← 실명
    ├─ student_id (CHAR(8))
    ├─ skill_level (ENUM: 초급/중급/고수)
    ├─ created_at (TIMESTAMPTZ)
    └─ updated_at (TIMESTAMPTZ)

profiles ──1──< matches
    ├─ id (UUID, PK)
    ├─ author_id (UUID, FK → profiles.id)
    ├─ team_name (TEXT)
    ├─ sport (ENUM: 축구/풋살/농구/e스포츠)
    ├─ match_size (ENUM: 1vs1/3vs3/5vs5/11vs11)
    ├─ description (TEXT)
    ├─ required_level (ENUM: 초급/중급/고수)
    ├─ status (ENUM: 모집중/매치확정)
    ├─ created_at (TIMESTAMPTZ)
    └─ updated_at (TIMESTAMPTZ)

matches ──1──< match_applications
    ├─ id (UUID, PK)
    ├─ match_id (UUID, FK → matches.id)
    ├─ applicant_id (UUID, FK → profiles.id)
    ├─ status (ENUM: pending/accepted/rejected)
    ├─ created_at (TIMESTAMPTZ)
    └─ updated_at (TIMESTAMPTZ)
    UNIQUE(match_id, applicant_id)

match_applications ──1──< message_rooms
    ├─ id (UUID, PK)
    ├─ application_id (UUID, FK → match_applications.id)
    ├─ participant_1 (UUID, FK → profiles.id)  ← 작성자
    ├─ participant_2 (UUID, FK → profiles.id)  ← 신청자
    └─ created_at (TIMESTAMPTZ)

message_rooms ──1──< messages
    ├─ id (UUID, PK)
    ├─ room_id (UUID, FK → message_rooms.id)
    ├─ sender_id (UUID, FK → profiles.id)
    ├─ content (TEXT)
    ├─ is_read (BOOLEAN, DEFAULT false)
    └─ created_at (TIMESTAMPTZ)

match_applications ──1──< reviews
    ├─ id (UUID, PK)
    ├─ match_id (UUID, FK → matches.id)
    ├─ reviewer_id (UUID, FK → profiles.id)
    ├─ reviewee_id (UUID, FK → profiles.id)
    ├─ rating (SMALLINT, CHECK 1~5)
    └─ created_at (TIMESTAMPTZ)
    UNIQUE(match_id, reviewer_id)        ← 중복 평가 방지

profiles ──1──< notifications
    ├─ id (UUID, PK)
    ├─ user_id (UUID, FK → profiles.id)
    ├─ type (ENUM: match_apply/match_accept/match_reject/new_message)
    ├─ message (TEXT)
    ├─ related_id (UUID)                 ← 관련 리소스 ID
    ├─ is_read (BOOLEAN, DEFAULT false)
    └─ created_at (TIMESTAMPTZ)
```

### 6.2 Row Level Security (RLS) 정책

| 테이블 | 정책 |
|--------|------|
| `profiles` | 본인만 UPDATE 가능, 전체 SELECT 허용 |
| `matches` | 로그인 유저만 INSERT, 본인만 UPDATE/DELETE |
| `match_applications` | 로그인 유저만 INSERT, 관련 당사자만 UPDATE |
| `reviews` | 매치 참여자만 INSERT, 수정/삭제 불가 |
| `messages` | 해당 채팅방 참여자만 SELECT/INSERT |
| `notifications` | 본인 알림만 SELECT/UPDATE |

---

## 7. API 설계

> Next.js API Routes (`/app/api/`) 기반 서버리스 함수

### 7.1 인증 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/logout` | 로그아웃 |
| GET | `/api/auth/check-username` | 아이디 중복 확인 |
| GET | `/api/auth/check-nickname` | 닉네임 중복 확인 |

### 7.2 매치 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/matches` | 매치 목록 조회 (필터 포함) |
| POST | `/api/matches` | 매치글 작성 |
| GET | `/api/matches/[id]` | 매치 상세 조회 |
| PATCH | `/api/matches/[id]` | 매치 상태 변경 |
| DELETE | `/api/matches/[id]` | 매치글 삭제 |

### 7.3 매치 신청 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/matches/[id]/apply` | 매치 신청 |
| PATCH | `/api/applications/[id]/accept` | 매치 수락 |
| PATCH | `/api/applications/[id]/reject` | 매치 거절 |

### 7.4 후기 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/reviews` | 내가 받은 후기 목록 |
| POST | `/api/reviews` | 후기 작성 |

### 7.5 메시지 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/messages` | 채팅방 목록 조회 |
| GET | `/api/messages/[roomId]` | 특정 채팅방 메시지 조회 |
| POST | `/api/messages/[roomId]` | 메시지 전송 |

### 7.6 알림 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/notifications` | 알림 목록 조회 |
| PATCH | `/api/notifications/[id]/read` | 알림 읽음 처리 |
| PATCH | `/api/notifications/read-all` | 전체 읽음 처리 |

---

## 8. UI/UX 가이드라인

### 8.1 컬러 팔레트

| 용도 | 색상 | HEX |
|------|------|-----|
| Primary (메인) | 충북대 청색 계열 | `#1E3A5F` |
| Accent (강조) | 활동적인 주황색 | `#FF6B35` |
| Success (수락) | 초록색 | `#22C55E` |
| Danger (거절) | 빨간색 | `#EF4444` |
| Background | 연한 회색 | `#F8FAFC` |
| Card | 흰색 | `#FFFFFF` |

### 8.2 종목별 색상 배지

| 종목 | 이모티콘 | 배지 색상 |
|------|----------|-----------|
| 축구 | ⚽ | `#16A34A` (초록) |
| 풋살 | 🥅 | `#2563EB` (파랑) |
| 농구 | 🏀 | `#EA580C` (주황) |
| e스포츠 | 🎮 | `#7C3AED` (보라) |

### 8.3 수준별 배지

| 수준 | 색상 |
|------|------|
| 초급 | `#86EFAC` (연초록) |
| 중급 | `#FCD34D` (노랑) |
| 고수 | `#F87171` (빨강) |

### 8.4 핵심 컴포넌트 목록

- `MatchCard` — 매치 목록 카드 (종목 배지, 팀명, 수준, 신청 버튼)
- `NotificationBell` — 헤더 알림 아이콘 + 배지
- `NotificationDropdown` — 알림 목록 드롭다운 (수락/거절 버튼 포함)
- `StarRating` — 별점 입력/표시 컴포넌트
- `ChatBubble` — 채팅 메시지 말풍선
- `FilterBar` — 종목/수준 필터 버튼 그룹
- `ProfileCard` — 내 정보 카드
- `Toast` — 실시간 알림 팝업

---

## 9. 비기능 요구사항

### 9.1 성능

| 항목 | 목표 |
|------|------|
| 페이지 첫 로드 (LCP) | 2.5초 이내 |
| 실시간 알림 지연 | 2초 이내 |
| 채팅 메시지 전달 | 1초 이내 |
| API 응답 시간 | 500ms 이내 |

### 9.2 보안

- Supabase RLS로 인증된 사용자만 데이터 접근
- JWT 토큰 만료 시 자동 갱신
- 학번 데이터는 마스킹 후 표시 (`202*****`)
- 비밀번호는 Supabase Auth에서 bcrypt 해시 처리

### 9.3 접근성 및 호환성

| 항목 | 지원 범위 |
|------|-----------|
| 브라우저 | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| 기기 | PC, 태블릿, 모바일 (반응형) |
| 최소 해상도 | 375px (모바일 기준) |

### 9.4 확장성

- Supabase 무료 플랜 기준 설계, 트래픽 증가 시 Pro 플랜으로 전환
- Next.js App Router 구조로 기능 단위 분리 및 확장 용이
- 향후 학과별 커뮤니티, 경기 일정 캘린더 기능 추가 예정

---

## 10. 개발 로드맵

### Phase 1 — 핵심 기능 (MVP)
```
Week 1-2:
  ✅ 프로젝트 세팅 (Next.js + Supabase + Vercel)
  ✅ DB 스키마 및 RLS 설정
  ✅ 회원가입 / 로그인

Week 3-4:
  ✅ 매치글 작성
  ✅ 매치 목록 + 필터
  ✅ 매치 신청 + 알림 시스템 (Realtime)
```

### Phase 2 — 커뮤니케이션
```
Week 5-6:
  ✅ 매치 수락/거절 처리
  ✅ 매치 메시지 채팅 (Realtime)
  ✅ 내 정보 페이지 + 수정
```

### Phase 3 — 평가 및 완성도
```
Week 7-8:
  ✅ 팀 후기 / 별점 평가
  ✅ 알림 센터 페이지
  ✅ 전체 UI 다듬기
  ✅ Vercel 배포 + 도메인 연결
```

---

## 11. 리스크 및 제약사항

| 리스크 | 영향도 | 대응 방안 |
|--------|--------|-----------|
| 학번 검증 불완전 | 중 | 8자리 형식 + 입학연도 범위 검사로 최소 필터링 |
| Supabase Realtime 연결 불안정 | 중 | 재연결 로직 구현, Polling 폴백 |
| 동시 다중 매치 신청 충돌 | 중 | DB 트랜잭션 및 UNIQUE 제약으로 방지 |
| Supabase 무료 플랜 한계 | 낮 | 초기 소규모 서비스에 충분, 초과 시 유료 전환 |
| 모바일 실시간 채팅 배터리 소모 | 낮 | 탭 비활성 시 구독 일시 해제 |

---

## 부록

### A. 환경 변수 목록

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Next.js
NEXTAUTH_URL=
NEXTAUTH_SECRET=
```

### B. 폴더 구조

```
cbnumatch/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/
│   │   ├── match/
│   │   │   ├── page.tsx          ← 매치 목록
│   │   │   ├── write/page.tsx    ← 매치글 작성
│   │   │   └── [id]/page.tsx     ← 매치 상세
│   │   ├── review/page.tsx
│   │   ├── messages/
│   │   │   ├── page.tsx
│   │   │   └── [roomId]/page.tsx
│   │   ├── profile/page.tsx
│   │   └── notifications/page.tsx
│   └── api/
│       ├── auth/
│       ├── matches/
│       ├── applications/
│       ├── reviews/
│       ├── messages/
│       └── notifications/
├── components/
│   ├── ui/                       ← 공통 UI 컴포넌트
│   ├── match/                    ← 매치 관련 컴포넌트
│   ├── chat/                     ← 채팅 컴포넌트
│   └── layout/                   ← 레이아웃 컴포넌트
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils/
├── types/
│   └── database.ts               ← Supabase 타입 정의
└── public/
```

---

*버전: v1.0 | 작성일: 2026-05-26*
