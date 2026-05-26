# 충북match — 구현 태스크 목록 (task.md)

> **기준 문서**: prd.md v1.0  
> **작성일**: 2026-05-26  
> **진행 방식**: Phase 1 → 2 → 3 순서로 진행, 각 태스크 완료 시 `[x]` 체크

---

## 진행 상태 범례

| 기호 | 의미 |
|------|------|
| `[ ]` | 미시작 |
| `[~]` | 진행 중 |
| `[x]` | 완료 |
| `[!]` | 블로커 / 이슈 있음 |

---

## Phase 0 — 프로젝트 초기 세팅

### T-001. 개발 환경 구성
- [ ] Node.js 20 LTS 설치 확인
- [ ] Next.js 14 프로젝트 생성
  ```bash
  npx create-next-app@latest cbnumatch --typescript --tailwind --eslint --app --src-dir=false
  ```
- [ ] 의존성 패키지 설치
  ```bash
  npm install @supabase/supabase-js @supabase/ssr
  npm install lucide-react
  npm install clsx tailwind-merge
  npm install react-hot-toast
  ```
- [ ] `.env.local` 파일 생성 및 환경 변수 설정
  ```env
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  ```
- [ ] `lib/supabase/client.ts` 생성 (브라우저용 클라이언트)
- [ ] `lib/supabase/server.ts` 생성 (서버용 클라이언트)
- [ ] `lib/utils.ts` 생성 (`cn()` 유틸 함수)
- [ ] `types/database.ts` 생성 (Supabase 타입 정의)

### T-002. Supabase 프로젝트 세팅
- [ ] Supabase 프로젝트 생성 (supabase.com)
- [ ] Project URL / Anon Key 복사 → `.env.local` 에 입력
- [ ] Supabase CLI 설치 (선택사항, 로컬 마이그레이션용)
  ```bash
  npm install -g supabase
  ```

### T-003. Vercel 배포 세팅
- [ ] GitHub 레포지토리 생성 (`cbnumatch`)
- [ ] 로컬 프로젝트 Git 초기화 및 첫 커밋
- [ ] Vercel 프로젝트 생성 + GitHub 레포 연결
- [ ] Vercel 환경 변수 등록 (`.env.local` 항목 동일하게)
- [ ] 첫 배포 확인

---

## Phase 1 — DB 스키마 & 인증

### T-004. Supabase 데이터베이스 스키마 생성

#### 4-1. `profiles` 테이블
- [ ] Supabase SQL Editor에서 테이블 생성
  ```sql
  CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    nickname TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    student_id CHAR(8) NOT NULL,
    skill_level TEXT CHECK (skill_level IN ('초급','중급','고수')) DEFAULT '초급',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );
  ```
- [ ] `updated_at` 자동 갱신 트리거 설정

#### 4-2. `matches` 테이블
- [ ] 테이블 생성
  ```sql
  CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    team_name TEXT NOT NULL,
    sport TEXT CHECK (sport IN ('축구','풋살','농구','e스포츠')) NOT NULL,
    match_size TEXT CHECK (match_size IN ('1vs1','3vs3','5vs5','11vs11')) NOT NULL,
    description TEXT NOT NULL,
    required_level TEXT CHECK (required_level IN ('초급','중급','고수')) NOT NULL,
    status TEXT CHECK (status IN ('모집중','매치확정')) DEFAULT '모집중',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
  );
  ```
- [ ] `updated_at` 자동 갱신 트리거 설정

#### 4-3. `match_applications` 테이블
- [ ] 테이블 생성
  ```sql
  CREATE TABLE match_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending','accepted','rejected')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(match_id, applicant_id)
  );
  ```

#### 4-4. `message_rooms` 테이블
- [ ] 테이블 생성
  ```sql
  CREATE TABLE message_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES match_applications(id) ON DELETE CASCADE,
    participant_1 UUID NOT NULL REFERENCES profiles(id),
    participant_2 UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```

#### 4-5. `messages` 테이블
- [ ] 테이블 생성
  ```sql
  CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES message_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```

#### 4-6. `reviews` 테이블
- [ ] 테이블 생성
  ```sql
  CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id),
    reviewee_id UUID NOT NULL REFERENCES profiles(id),
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(match_id, reviewer_id)
  );
  ```

#### 4-7. `notifications` 테이블
- [ ] 테이블 생성
  ```sql
  CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('match_apply','match_accept','match_reject','new_message')) NOT NULL,
    message TEXT NOT NULL,
    related_id UUID,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```

### T-005. Row Level Security (RLS) 설정

#### 5-1. profiles RLS
- [ ] RLS 활성화
- [ ] `SELECT`: 모든 인증 유저 허용
- [ ] `UPDATE`: `auth.uid() = id` 인 경우만 허용
- [ ] `INSERT`: `auth.uid() = id` 인 경우만 허용

#### 5-2. matches RLS
- [ ] RLS 활성화
- [ ] `SELECT`: 모든 인증 유저 허용
- [ ] `INSERT`: 인증 유저 허용
- [ ] `UPDATE/DELETE`: `auth.uid() = author_id` 인 경우만 허용

#### 5-3. match_applications RLS
- [ ] RLS 활성화
- [ ] `SELECT`: 관련 당사자(신청자 또는 매치글 작성자)만 허용
- [ ] `INSERT`: 인증 유저 허용 (본인 신청 불가 로직은 앱에서 처리)
- [ ] `UPDATE`: 매치글 작성자(`match.author_id = auth.uid()`)만 허용

#### 5-4. message_rooms RLS
- [ ] RLS 활성화
- [ ] `SELECT`: `participant_1 = auth.uid() OR participant_2 = auth.uid()`

#### 5-5. messages RLS
- [ ] RLS 활성화
- [ ] `SELECT/INSERT`: 해당 채팅방 참여자만 허용

#### 5-6. reviews RLS
- [ ] RLS 활성화
- [ ] `SELECT`: 모든 인증 유저 허용
- [ ] `INSERT`: 매치 참여자만 허용, 수정/삭제 불가

#### 5-7. notifications RLS
- [ ] RLS 활성화
- [ ] `SELECT/UPDATE`: `user_id = auth.uid()` 인 경우만 허용

### T-006. Supabase Realtime 설정
- [ ] `matches` 테이블 Realtime 구독 활성화
- [ ] `notifications` 테이블 Realtime 구독 활성화
- [ ] `messages` 테이블 Realtime 구독 활성화
- [ ] `match_applications` 테이블 Realtime 구독 활성화

---

## Phase 1 — 레이아웃 & 인증

### T-007. 공통 레이아웃 구성

#### 7-1. 루트 레이아웃
- [ ] `app/layout.tsx` — 전역 폰트, Tailwind 적용
- [ ] `app/globals.css` — 커스텀 CSS 변수 (컬러 팔레트) 정의
  ```css
  --primary: #1E3A5F;
  --accent: #FF6B35;
  --success: #22C55E;
  --danger: #EF4444;
  ```

#### 7-2. 인증 레이아웃
- [ ] `app/(auth)/layout.tsx` — 중앙 정렬 카드 레이아웃

#### 7-3. 메인 레이아웃 (로그인 후)
- [ ] `app/(main)/layout.tsx` — 사이드바 또는 하단 네비게이션 포함
- [ ] `components/layout/Header.tsx` — 로고 + 알림 벨 + 사용자 메뉴
- [ ] `components/layout/Navbar.tsx` — 매치 / 매치글작성 / 팀후기 / 내정보 / 메시지 링크
- [ ] `components/layout/Toast.tsx` — react-hot-toast 프로바이더 설정

#### 7-4. 인증 미들웨어
- [ ] `middleware.ts` 생성
  - 비로그인 유저가 `/match`, `/review`, `/messages`, `/profile` 접근 시 → `/login` 리다이렉트
  - 로그인 유저가 `/login`, `/signup` 접근 시 → `/match` 리다이렉트

### T-008. 회원가입 페이지 (`/signup`)

#### 8-1. UI 구현
- [ ] `app/(auth)/signup/page.tsx` 생성
- [ ] 폼 레이아웃: 카드 형태, 충북match 로고 상단 배치
- [ ] 입력 필드 구현
  - [ ] 아이디 input (+ 중복확인 버튼)
  - [ ] 비밀번호 input (눈 아이콘으로 표시/숨김 토글)
  - [ ] 비밀번호 확인 input (실시간 일치 여부 표시)
  - [ ] 이름(실명) input
  - [ ] 닉네임 input (+ 중복확인 버튼)
  - [ ] 학번 input (`maxLength=8`, `inputMode="numeric"`, 숫자만 허용)
- [ ] 가입하기 버튼 (모든 필드 유효 + 중복확인 완료 시 활성화)

#### 8-2. 유효성 검사 로직
- [ ] 아이디: 영문 소문자 + 숫자, 4~20자 정규식 검사
- [ ] 비밀번호: 8자 이상, 영문+숫자 포함 검사
- [ ] 비밀번호 확인: 실시간 일치 여부 확인
- [ ] 이름: 한글 2~5자 정규식 `/^[가-힣]{2,5}$/`
- [ ] 닉네임: 2~10자 검사
- [ ] 학번: 정확히 8자리 숫자, 앞 4자리 1990~현재연도 범위 검사
- [ ] 각 필드 오류 메시지 인라인 표시

#### 8-3. 중복 확인 API 연동
- [ ] `app/api/auth/check-username/route.ts` 구현
  - `profiles` 테이블에서 `username` 조회
- [ ] `app/api/auth/check-nickname/route.ts` 구현
  - `profiles` 테이블에서 `nickname` 조회
- [ ] 중복 확인 성공 시 녹색 체크 표시, 실패 시 빨간 오류 표시

#### 8-4. 가입 처리 로직
- [ ] `app/api/auth/signup/route.ts` 구현
  1. Supabase Auth `signUp()` 호출 (이메일: `{username}@cbnu.match`)
  2. `profiles` 테이블 INSERT
  3. 성공 시 200 반환
- [ ] 가입 완료 후 `/login` 페이지로 리다이렉트
- [ ] 로딩 스피너 표시 (제출 중)

### T-009. 로그인 페이지 (`/login`)

#### 9-1. UI 구현
- [ ] `app/(auth)/login/page.tsx` 생성
- [ ] 아이디 input
- [ ] 비밀번호 input (표시/숨김 토글)
- [ ] 로그인 버튼
- [ ] 회원가입 링크 (`/signup` 이동)

#### 9-2. 로그인 로직
- [ ] `app/api/auth/login/route.ts` 구현
  - `username`으로 `auth.users` 이메일 변환 후 `signInWithPassword()` 호출
- [ ] 성공 → 세션 저장 → `/match` 리다이렉트
- [ ] 실패 → "아이디 또는 비밀번호가 올바르지 않습니다." 오류 메시지
- [ ] 로딩 상태 처리

#### 9-3. 로그아웃
- [ ] `app/api/auth/logout/route.ts` 구현
- [ ] Header 컴포넌트에 로그아웃 버튼 추가
- [ ] 로그아웃 후 `/login` 리다이렉트

---

## Phase 1 — 매치 목록 & 매치글 작성

### T-010. 매치 목록 페이지 (`/match`)

#### 10-1. UI 구현
- [ ] `app/(main)/match/page.tsx` 생성
- [ ] `components/match/FilterBar.tsx` 구현
  - 종목 필터 버튼 (전체 / ⚽축구 / 🥅풋살 / 🏀농구 / 🎮e스포츠)
  - 수준 필터 버튼 (전체 / 초급 / 중급 / 고수)
  - 선택된 필터 하이라이트 스타일
- [ ] `components/match/MatchCard.tsx` 구현
  - 종목 이모티콘 + 배지 (색상 코드 prd.md 8.2 참조)
  - 팀명, 매치 인원, 수준 배지
  - 소개글 (2줄 말줄임)
  - 매치 상태 (모집중 🟢 / 매치확정 🔴)
  - [매치 신청] 버튼 (본인 글이면 비활성화)
- [ ] 매치 목록 그리드 레이아웃 (PC: 3열, 태블릿: 2열, 모바일: 1열)
- [ ] 빈 목록 상태 (Empty State) UI

#### 10-2. 데이터 조회
- [ ] `app/api/matches/route.ts` (GET) 구현
  - `sport`, `required_level` 쿼리 파라미터 필터링
  - 최신순 정렬
- [ ] 클라이언트에서 필터 변경 시 API 재호출 또는 클라이언트 필터링

#### 10-3. Supabase Realtime 연동
- [ ] `matches` 테이블 INSERT 이벤트 구독
- [ ] 새 매치 등록 시 목록 자동 갱신 (페이지 새로고침 없이)

### T-011. 매치글 작성 페이지 (`/match/write`)

#### 11-1. UI 구현
- [ ] `app/(main)/match/write/page.tsx` 생성
- [ ] 팀명 input
- [ ] 종목 선택 카드 그리드 (이모티콘 + 텍스트)
- [ ] 매치 인원 버튼 그룹 (종목에 따라 disabled 처리)
  - 축구: 5vs5, 11vs11만 활성화
  - 풋살: 3vs3, 5vs5만 활성화
  - 농구: 3vs3, 5vs5만 활성화
  - e스포츠: 1vs1, 3vs3, 5vs5 활성화
- [ ] 소개글 textarea (최대 500자, 글자 수 카운터)
- [ ] 원하는 수준 버튼 그룹
- [ ] [작성하기] 버튼

#### 11-2. 제출 로직
- [ ] `app/api/matches/route.ts` (POST) 구현
  - 현재 유저의 `author_id` 자동 설정
  - 유효성 검사 후 `matches` 테이블 INSERT
- [ ] 작성 완료 후 `/match` 리다이렉트
- [ ] 로딩 상태 처리

---

## Phase 1 — 매치 신청 & 알림

### T-012. 매치 신청 기능

#### 12-1. 신청 API
- [ ] `app/api/matches/[id]/apply/route.ts` (POST) 구현
  1. 본인 게시글 신청 방지 (401 반환)
  2. 중복 신청 방지 (409 반환)
  3. `match_applications` INSERT (status: 'pending')
  4. `notifications` INSERT (매치글 작성자 수신)
  5. 성공 200 반환

#### 12-2. 신청 버튼 상태 관리
- [ ] 이미 신청한 매치 → "신청 완료" 버튼 (비활성화)
- [ ] 신청 중 → 로딩 스피너
- [ ] 신청 성공 → "신청 완료" 상태로 변경 + 토스트 메시지

### T-013. 알림 시스템

#### 13-1. 알림 컴포넌트
- [ ] `components/layout/NotificationBell.tsx` 구현
  - 벨 아이콘 (lucide-react)
  - 미읽음 배지 숫자 표시
- [ ] `components/layout/NotificationDropdown.tsx` 구현
  - 알림 목록 (최신순)
  - N1 알림: [수락] / [거절] 버튼 인라인 표시
  - N2 알림: [채팅 시작] 버튼
  - N4 알림: [채팅 열기] 버튼
  - 전체 읽음 처리 버튼

#### 13-2. 알림 Realtime 구독
- [ ] `hooks/useNotifications.ts` 훅 생성
  - `notifications:user_id=eq.{userId}` 채널 구독
  - 새 알림 수신 시 목록 갱신 + 배지 +1
  - 토스트 팝업 표시 (react-hot-toast)

#### 13-3. 알림 API
- [ ] `app/api/notifications/route.ts` (GET) 구현
- [ ] `app/api/notifications/[id]/read/route.ts` (PATCH) 구현
- [ ] `app/api/notifications/read-all/route.ts` (PATCH) 구현

### T-014. 매치 수락 / 거절 기능

#### 14-1. 수락 API
- [ ] `app/api/applications/[id]/accept/route.ts` (PATCH) 구현
  1. 권한 확인 (매치글 작성자만 가능)
  2. `match_applications.status` → `'accepted'`
  3. `matches.status` → `'매치확정'`
  4. `message_rooms` INSERT (채팅방 자동 생성)
  5. 신청자에게 N2 알림 발송

#### 14-2. 거절 API
- [ ] `app/api/applications/[id]/reject/route.ts` (PATCH) 구현
  1. 권한 확인 (매치글 작성자만 가능)
  2. `match_applications.status` → `'rejected'`
  3. `matches.status` 유지 (모집중)
  4. 신청자에게 N3 알림 발송

---

## Phase 2 — 매치 메시지 채팅

### T-015. 채팅방 목록 페이지 (`/messages`)

#### 15-1. UI 구현
- [ ] `app/(main)/messages/page.tsx` 생성
- [ ] 채팅방 목록 카드
  - 상대방 닉네임
  - 마지막 메시지 미리보기
  - 미읽음 메시지 배지
  - 매치 종목 이모티콘
- [ ] 빈 목록 상태 UI ("아직 매치 메시지가 없어요")

#### 15-2. 데이터 조회
- [ ] `app/api/messages/route.ts` (GET) 구현
  - `participant_1 = userId OR participant_2 = userId` 조건

### T-016. 개별 채팅방 페이지 (`/messages/[roomId]`)

#### 16-1. UI 구현
- [ ] `app/(main)/messages/[roomId]/page.tsx` 생성
- [ ] `components/chat/ChatBubble.tsx` — 내 메시지 (우측) / 상대 메시지 (좌측) 구분
- [ ] 메시지 입력창 + 전송 버튼
- [ ] 메시지 시간 표시
- [ ] 채팅창 자동 스크롤 다운
- [ ] 상단 매치 정보 헤더 (종목, 팀명)

#### 16-2. 메시지 전송
- [ ] `app/api/messages/[roomId]/route.ts` (POST) 구현
  - `messages` 테이블 INSERT
  - 상대방에게 N4 알림 발송
- [ ] Enter키 전송 지원

#### 16-3. Realtime 채팅 구독
- [ ] `hooks/useChat.ts` 훅 생성
  - `messages:room_id=eq.{roomId}` 채널 구독
  - 새 메시지 수신 시 자동 스크롤 + 목록 갱신
- [ ] 메시지 읽음 처리 (채팅방 진입 시 is_read = true 일괄 업데이트)

---

## Phase 2 — 내 정보 페이지

### T-017. 내 정보 페이지 (`/profile`)

#### 17-1. UI 구현
- [ ] `app/(main)/profile/page.tsx` 생성
- [ ] `components/profile/ProfileCard.tsx` 구현
  - 닉네임 인라인 수정 (연필 아이콘 클릭 → input 전환)
  - 아이디 표시 (읽기 전용)
  - 학번 마스킹 표시 (`202*****`)
  - 실력 수준 드롭다운 (즉시 저장)
- [ ] `components/profile/ReviewSection.tsx` 구현
  - 평균 별점 (★ 시각화)
  - 매치별 평가 내역 리스트

#### 17-2. 정보 수정 API
- [ ] `app/api/profile/route.ts` (PATCH) 구현
  - 닉네임 변경 (중복 검사 포함)
  - 실력 수준 변경
  - 변경 즉시 `profiles` 테이블 UPDATE

#### 17-3. 평가 내역 조회
- [ ] `app/api/reviews/route.ts` (GET) 구현
  - `reviewee_id = userId` 조건으로 본인 수신 평가 조회
  - 평균 점수 계산 후 반환

---

## Phase 3 — 팀 후기 & 별점 평가

### T-018. 팀 후기 페이지 (`/review`)

#### 18-1. UI 구현
- [ ] `app/(main)/review/page.tsx` 생성
- [ ] 평가 가능한 매치 목록 표시
  - 매치 확정 + 본인 참여 + 미평가 조건 필터링
- [ ] `components/review/StarRating.tsx` 구현
  - 별점 1~5점 클릭 선택 (hover 효과 포함)
  - 선택된 별점 하이라이트
- [ ] [평가 제출] 버튼

#### 18-2. 평가 제출 API
- [ ] `app/api/reviews/route.ts` (POST) 구현
  1. 매치 참여자 확인
  2. 중복 평가 방지 (UNIQUE 제약 + 앱 레벨 체크)
  3. `reviews` 테이블 INSERT
  4. 성공 후 해당 매치 평가 버튼 비활성화

#### 18-3. 평가 완료 상태 관리
- [ ] 이미 평가한 매치는 별점 표시 (수정 불가) + "평가 완료" 배지
- [ ] 상대방 프로필 평균 점수 실시간 업데이트 반영

---

## Phase 3 — 알림 센터 & UI 완성도

### T-019. 알림 센터 페이지 (`/notifications`)

- [ ] `app/(main)/notifications/page.tsx` 생성
- [ ] 전체 알림 내역 목록 (날짜별 그룹)
- [ ] 읽음/미읽음 구분 스타일 (미읽음: 배경 강조)
- [ ] 알림 클릭 시 관련 페이지 이동 + 읽음 처리
- [ ] "전체 읽음 처리" 버튼

### T-020. 랜딩 페이지 (`/`)

- [ ] `app/page.tsx` 생성 (비로그인 시 표시)
- [ ] 서비스 소개 (충북match 로고, 슬로건)
- [ ] 지원 종목 소개 (이모티콘 + 설명)
- [ ] 로그인 / 회원가입 CTA 버튼
- [ ] 로그인 상태면 `/match` 자동 리다이렉트

### T-021. 전체 UI 다듬기

#### 21-1. 공통 UI 컴포넌트 (`components/ui/`)
- [ ] `Button.tsx` — primary / secondary / danger / ghost 변형
- [ ] `Input.tsx` — 레이블, 오류 메시지 포함
- [ ] `Badge.tsx` — 종목 / 수준 / 상태 배지
- [ ] `Card.tsx` — 기본 카드 컨테이너
- [ ] `Modal.tsx` — 확인 다이얼로그
- [ ] `Spinner.tsx` — 로딩 인디케이터
- [ ] `EmptyState.tsx` — 빈 목록 UI

#### 21-2. 반응형 완성도 검증
- [ ] 모바일 (375px) 레이아웃 점검
- [ ] 태블릿 (768px) 레이아웃 점검
- [ ] 데스크톱 (1280px) 레이아웃 점검
- [ ] 터치 디바이스 인터랙션 점검

#### 21-3. 접근성
- [ ] 모든 버튼/링크에 `aria-label` 추가
- [ ] 이미지/이모티콘에 `alt` 또는 `aria-hidden` 설정
- [ ] 키보드 네비게이션 확인 (Tab 순서)
- [ ] 색상 대비 비율 확인 (WCAG AA 기준)

---

## Phase 3 — 최종 배포

### T-022. 성능 최적화

- [ ] Next.js Image 최적화 적용 (이미지 사용 시)
- [ ] 불필요한 클라이언트 번들 줄이기 (`'use server'` 적절히 분리)
- [ ] Supabase 쿼리 인덱스 추가
  ```sql
  CREATE INDEX idx_matches_sport ON matches(sport);
  CREATE INDEX idx_matches_status ON matches(status);
  CREATE INDEX idx_notifications_user_id ON notifications(user_id);
  CREATE INDEX idx_messages_room_id ON messages(room_id);
  ```
- [ ] API 응답 캐싱 전략 수립

### T-023. 보안 최종 점검

- [ ] 모든 API Route에 세션 인증 확인 로직 추가
- [ ] RLS 정책 테스트 (다른 유저로 로그인하여 타인 데이터 접근 시도)
- [ ] 입력 데이터 서버 사이드 유효성 검사 확인
- [ ] 환경 변수 노출 여부 확인 (`SUPABASE_SERVICE_ROLE_KEY` 클라이언트 번들 미포함)

### T-024. 테스트

- [ ] 회원가입 전체 플로우 E2E 테스트
- [ ] 로그인 / 로그아웃 테스트
- [ ] 매치 신청 → 수락 → 채팅 생성 플로우 테스트
- [ ] 매치 신청 → 거절 → 매치글 유지 테스트
- [ ] 팀 후기 작성 + 중복 방지 테스트
- [ ] 실시간 알림 수신 테스트 (두 브라우저 탭으로)
- [ ] 실시간 채팅 테스트 (두 브라우저 탭으로)
- [ ] 내 정보 수정 실시간 반영 테스트

### T-025. Vercel 프로덕션 배포

- [ ] `main` 브랜치에 최종 코드 병합
- [ ] Vercel 환경 변수 최종 확인
- [ ] 프로덕션 빌드 성공 확인 (`npm run build` 오류 없음)
- [ ] 배포 URL 동작 확인
- [ ] 커스텀 도메인 연결 (선택사항)

---

## 태스크 진행 현황 요약

| Phase | 태스크 | 완료 | 진행 중 | 미시작 |
|-------|--------|------|---------|--------|
| Phase 0 | T-001 ~ T-003 | 0 | 0 | 3 |
| Phase 1 | T-004 ~ T-014 | 0 | 0 | 11 |
| Phase 2 | T-015 ~ T-017 | 0 | 0 | 3 |
| Phase 3 | T-018 ~ T-025 | 0 | 0 | 8 |
| **합계** | **25개** | **0** | **0** | **25** |

---

*최종 업데이트: 2026-05-26*
