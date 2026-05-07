---
name: scaffold-crud
description: 단일 테이블 CRUD 요청 시 자동 호출 — Next.js Route Handler + Supabase RLS 패턴으로 DB 마이그레이션·API Routes·UI 페이지를 한 번에 생성한다
allowed-tools:
  - Read
  - Write
  - Edit
  - mcp__plugin_supabase_supabase__apply_migration
  - mcp__plugin_supabase_supabase__generate_typescript_types
---

## 사용 시점

다음 표현이 포함된 요청에서 자동 호출한다.

- "CRUD 만들어 주십시오 / 추가해 주십시오"
- "단일 테이블 추가해 주십시오"
- "[리소스명] 목록·생성·수정·삭제 기능 만들어 주십시오"
- "테이블과 API를 함께 만들어 주십시오"

인수(`$ARGUMENTS`)에서 리소스 이름을 추출한다. 인수가 없으면 먼저 리소스 이름을 물어본다.

---

## 진행 순서

### 1. 기존 코드 파악
- `src/lib/database.types.ts` 읽기 — 기존 테이블 구조 파악
- `src/app/api/tasks/route.ts`, `src/app/api/tasks/[id]/route.ts` 읽기 — Route Handler 패턴 확인
- `supabase/migrations/` 목록 확인 — 다음 마이그레이션 번호 결정

### 2. DB 마이그레이션
`mcp__plugin_supabase_supabase__apply_migration`으로 적용:

```sql
-- 테이블 생성
create table if not exists {plural} (
  id          uuid primary key default gen_random_uuid(),
  -- 비즈니스 컬럼 추가
  created_by  uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- RLS 활성화
alter table {plural} enable row level security;

-- RLS 정책 4종
create policy {plural}_select on {plural}
  for select using (auth.uid() = created_by);

create policy {plural}_insert on {plural}
  for insert with check (auth.uid() = created_by);

create policy {plural}_update on {plural}
  for update using (auth.uid() = created_by);

create policy {plural}_delete on {plural}
  for delete using (auth.uid() = created_by);
```

### 3. TypeScript 타입 재생성
`mcp__plugin_supabase_supabase__generate_typescript_types`로 `src/lib/database.types.ts` 갱신.

### 4. API Routes 생성

**`src/app/api/{plural}/route.ts`** — GET (목록), POST (생성)
**`src/app/api/{plural}/[id]/route.ts`** — GET (단건), PATCH (수정), DELETE (삭제)

`src/app/api/tasks/route.ts` 패턴 그대로 복사해서 테이블명·컬럼명만 교체한다.
모든 핸들러 첫 줄에 `supabase.auth.getUser()` 인증 검증 포함.

### 5. UI 페이지 생성

**`src/app/{plural}/page.tsx`** — 목록 + 인라인 생성 폼 + 수정·삭제 버튼

- `'use client'` 최상단
- `useEffect`에서 `supabase.auth.getUser()` 확인 → 미인증 시 `router.push('/login')`
- fetch는 `/api/{plural}` 사용 (직접 Supabase 클라이언트 호출 금지)
- shadcn/ui `Button`, `Input` 사용 (경로: `@/components/ui/button`, `@/components/ui/input`)

### 6. 미들웨어 매처 추가
`src/middleware.ts`의 `config.matcher` 배열에 아래 경로 추가:

```ts
'/{plural}',
'/api/{plural}/:path*',
```

---

## 컨벤션

| 항목 | 규칙 |
|---|---|
| 테이블·경로명 | 복수형 소문자 스네이크 케이스 (`team_members`, `time_entries`) |
| API 파일 경로 | `src/app/api/{plural}/route.ts`, `src/app/api/{plural}/[id]/route.ts` |
| UI 파일 경로 | `src/app/{plural}/page.tsx` |
| 마이그레이션 파일 | `supabase/migrations/{NNNN}_{plural}.sql` (기존 최대 번호 + 1) |
| 인증 | 서버 클라이언트는 `@/lib/supabase/server`의 `createClient()` |
| HTTP 상태 | POST → 201, DELETE → 204, 인증 실패 → 401, 필드 누락 → 400 |
| 에러 응답 | `NextResponse.json({ error: error.message }, { status: N })` |
| UI 컴포넌트 | shadcn/ui 수동 작성 패턴 — `npx shadcn@latest add` 사용 금지 |

---

## 주의사항

- **RLS 빠뜨리지 않기** — `enable row level security` 없이 정책만 추가하면 익명 접근이 열린 채로 남는다. 반드시 `alter table ... enable row level security`를 먼저 실행.
- **복수형 일관성** — 테이블명(`comments`), API 경로(`/api/comments`), UI 경로(`/comments`), 마이그레이션 파일명 모두 동일한 복수형을 써야 한다.
- **`created_by` NOT NULL** — 마이그레이션에서 `not null` 제약 필수. 누락 시 RLS `insert` 정책이 `auth.uid()` 비교를 할 수 없어 빈 `created_by`로 삽입된다.
- **UI에서 직접 Supabase 호출 금지** — 클라이언트 컴포넌트에서 `supabase.from(...)` 직접 호출 대신 fetch → Route Handler를 경유한다. RLS가 적용되어 있더라도 인증 흐름이 미들웨어와 일관되게 유지된다.
- **미들웨어 매처 누락** — 매처에 추가하지 않으면 미인증 사용자가 UI·API에 직접 접근 가능하다.
- **타입 재생성 필수** — 마이그레이션 후 `generate_typescript_types`를 반드시 실행해 `database.types.ts`를 최신 상태로 유지한다. 타입이 오래되면 PATCH 핸들러의 `TablesUpdate<'...'>` 타입 오류가 발생한다.
