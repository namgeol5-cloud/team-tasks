---
name: docs
description: >
  코드 변경 후 docs/ 문서를 자동으로 최신 상태로 맞춰주는 스킬.
  "문서 만들어줘", "README 업데이트", "API 문서화", "docs 업데이트" 등
  문서 생성·갱신 요청이나 코드 변경 후 관련 문서가 오래됐을 때 자동 호출한다.
  새 API 엔드포인트·DB 테이블·RLS 정책이 추가됐을 때도 proactively 호출할 것.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

## 사용 시점

아래 상황에서 자동으로 호출한다.

- 사용자가 "문서 만들어줘 / 업데이트해줘", "README 갱신", "API 문서화" 등을 말할 때
- 새 API 엔드포인트(`src/app/api/`)가 추가됐을 때 — `docs/api.md` 업데이트
- DB 마이그레이션(`supabase/migrations/`)이 추가됐을 때 — `docs/db.md` 업데이트
- 인수(`$ARGUMENTS`)에 특정 문서 파일명이 언급될 때 그 파일만 갱신

---

## 진행 순서

### 1. 대상 파악

먼저 무엇을 업데이트할지 결정한다.

- 인수가 있으면 그 파일만 (`docs/api.md`, `docs/db.md` 등)
- 없으면 최근 변경된 코드를 파악해 관련 문서 전체를 갱신

```
Glob: src/app/api/**/*.ts      → API 엔드포인트 목록
Glob: supabase/migrations/*.sql → DB 스키마 변경 이력
Read: src/lib/database.types.ts → 현재 테이블·컬럼 구조
Read: docs/ 아래 기존 문서들   → 현재 상태 확인
```

### 2. 소스에서 사실 추출

**API 엔드포인트** (`docs/api.md` 갱신 시):
- `src/app/api/**/route.ts` 파일을 모두 읽는다
- 각 파일에서 export된 HTTP 메서드(`GET`, `POST`, `PATCH`, `DELETE`)를 추출
- 파일 경로 → URL 경로로 변환 (`src/app/api/tasks/[id]/route.ts` → `/api/tasks/[id]`)
- 인증 여부: `supabase.auth.getUser()` 호출이 있으면 "필요", 없으면 "불필요"
- 각 핸들러의 역할을 한 줄로 요약

**DB 스키마** (`docs/db.md` 갱신 시):
- `src/lib/database.types.ts`의 `Tables` 타입에서 테이블·컬럼·타입 추출
- `supabase/migrations/*.sql`에서 RLS 정책 추출

### 3. 문서 갱신

기존 파일이 있으면 **Edit**으로 수정, 없으면 **Write**로 새로 생성.

형식은 기존 `docs/` 파일의 스타일과 언어(한국어)를 그대로 유지한다.

---

## 컨벤션

| 항목 | 규칙 |
|---|---|
| 문서 위치 | `docs/` 루트 (하위 폴더 새로 만들지 않음) |
| 언어 | 한국어 (기존 문서와 동일) |
| API 표 헤더 | `METHOD \| PATH \| 설명 \| 인증` (기존 `docs/api.md` 형식 유지) |
| 코드 블록 | SQL은 \`\`\`sql, TS 타입은 \`\`\`ts |
| 제목 수준 | `# 제목`, `## 섹션` — 기존 파일 구조 따름 |

### docs/api.md 포맷 예시

```markdown
# API Endpoints — Team Tasks

| METHOD | PATH | 설명 | 인증 |
|--------|------|------|------|
| GET    | /api/tasks | 전체 일감 목록 조회 | 필요 |
| POST   | /api/tasks | 새 일감 생성 | 필요 |
| GET    | /api/tasks/[id] | 단건 조회 | 필요 |
| PATCH  | /api/tasks/[id] | 제목·담당자·상태 수정 | 필요 |
| DELETE | /api/tasks/[id] | 일감 삭제 | 필요 |
```

### docs/db.md 포맷 예시

```markdown
# DB Schema — Team Tasks

## tasks
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid | PK, gen_random_uuid() |
| title | text | 일감 제목 |
| ...  | ...  | ... |

### RLS 정책
- tasks_select: created_by = auth.uid() OR assignee_id = auth.uid()
- tasks_insert: created_by = auth.uid()
```

---

## 주의사항

- **추측 금지** — 소스 코드에서 직접 읽은 사실만 기록한다. 엔드포인트가 실제로 존재하는지 route 파일을 확인한 후 작성.
- **기존 섹션 보존** — 문서에 수동으로 작성된 설명이나 배경 섹션이 있으면 삭제하지 않고 유지한다.
- **미들웨어 매처 반영** — `src/middleware.ts`의 `config.matcher`에 없는 경로는 "인증 불필요"로 표시한다.
- **db.md와 database.types.ts 동기화** — `database.types.ts`가 실제 DB와 다를 수 있으므로, 최신 마이그레이션 파일도 함께 확인해 불일치를 표시한다.
