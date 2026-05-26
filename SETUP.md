# 충북match 설치 및 실행 가이드

## 1단계: 의존성 설치

```bash
cd C:\Users\82109\Desktop\cbnumatch
npm install
```

---

## 2단계: Supabase 프로젝트 설정

1. [supabase.com](https://supabase.com) 접속 → 로그인 → **New Project** 생성
2. 프로젝트 이름: `cbnumatch`, 비밀번호 설정 후 생성 대기 (약 1분)

### DB 스키마 실행

3. 좌측 메뉴 → **SQL Editor** → **New Query**
4. `supabase/schema.sql` 파일 내용 전체 복사 → 붙여넣기 → **RUN** 클릭

### Realtime 활성화

5. 좌측 메뉴 → **Database** → **Replication**
6. 다음 테이블의 **INSERT / UPDATE** 토글 활성화:
   - `matches`
   - `notifications`
   - `messages`
   - `match_applications`

### 이메일 확인 비활성화

7. 좌측 메뉴 → **Authentication** → **Providers** → **Email**
8. **Confirm email** 토글 **OFF** 설정 (즉시 로그인 가능하게)

### API 키 복사

9. 좌측 메뉴 → **Settings** → **API**
10. `Project URL`, `anon public`, `service_role secret` 복사

---

## 3단계: 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

## 4단계: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

---

## 5단계: Vercel 배포

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel

# 환경 변수는 Vercel Dashboard → Settings → Environment Variables 에서 설정
```

---

## 폴더 구조

```
cbnumatch/
├── app/                    Next.js App Router
│   ├── (auth)/             로그인/회원가입 페이지
│   ├── (main)/             인증 필요 페이지들
│   └── api/                API 라우트
├── components/             UI 컴포넌트
├── hooks/                  React 커스텀 훅
├── lib/supabase/           Supabase 클라이언트
├── types/                  TypeScript 타입
└── supabase/schema.sql     DB 스키마
```

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 회원가입 | 8자리 학번, 아이디/닉네임 중복 검사 |
| 로그인 | 아이디 + 비밀번호 |
| 매치 목록 | 종목/수준 필터, 실시간 업데이트 |
| 매치 신청 | 신청 → 실시간 알림 → 수락/거절 |
| 매치 메시지 | 수락 후 1:1 실시간 채팅 |
| 팀 후기 | 별점 1~5, 1회만 평가 가능 |
| 내 정보 | 닉네임/실력수준 수정, 평가 내역 |
