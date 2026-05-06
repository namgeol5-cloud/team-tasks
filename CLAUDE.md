# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # 개발 서버 (Turbopack)
npm run build    # 프로덕션 빌드 + 타입 체크 + ESLint
npm run lint     # ESLint 단독 실행
npm start        # 프로덕션 서버 (build 후)
```

빌드(`npm run build`)가 타입 검사와 린트를 모두 수행하므로, 코드 변경 후 반드시 통과 여부를 확인한다.

## 아키텍처

### 상태 관리

모든 앱 상태는 `src/lib/store.tsx`의 Zustand 스토어 하나에 집중된다. `persist` 미들웨어로 `localStorage('team-tasks-store')`에 자동 저장된다. 서버 컴포넌트에서는 스토어를 참조하지 않는다.

스토어가 관리하는 데이터:
- `tasks: Task[]` — 일감 목록
- `members: Member[]` — 팀원 목록
- `filters: Filters` — 검색어·우선순위·담당자 필터 (UI 상태)

### 컴포넌트 계층

`page.tsx`(서버) → `TaskBoard`(클라이언트) 가 진입점이다. `TaskBoard`가 헤더·필터·칸반 열을 직접 렌더링하고, 다이얼로그 열림 상태(`taskDialogOpen`, `memberDialogOpen`, `editingTask`)를 로컬 `useState`로 관리한다.

```
TaskBoard          ← 보드 레이아웃, 다이얼로그 열림 상태
├── FilterBar      ← 필터 상태는 스토어에 위임
├── TaskCard       ← 카드별 편집 다이얼로그 상태를 자체 보유
│   └── TaskDialog (편집 모드)
├── TaskDialog     ← 생성 모드 (TaskBoard에서 제어)
└── MemberDialog
```

### 타입 · 유틸

- `src/lib/types.ts` — `Task`, `Member`, `Priority`, `Status` 타입 정의.
- `src/lib/utils.ts` — `PRIORITY_CONFIG`, `STATUS_CONFIG` 상수로 우선순위·상태별 Tailwind 클래스를 중앙 관리한다. 새 스타일 변형을 추가할 때는 이 파일만 수정하면 된다. Tailwind purge 대상이므로 클래스명을 문자열 템플릿으로 조합하지 않고 전체 클래스명을 그대로 기입한다.

### UI 컴포넌트

`src/components/ui/`는 Radix UI 위에 shadcn/ui 패턴으로 작성된 래퍼들이다. `TooltipProvider`는 `src/app/providers.tsx`에서 루트에 한 번만 마운트된다. shadcn 컴포넌트를 추가할 때 CLI(`npx shadcn@latest add`) 대신 기존 파일 패턴을 참고해 수동 작성한다.

## 주요 제약

- **백엔드 없음**: 현재 MVP는 순수 클라이언트 앱이다. API Routes 미사용.
- **단일 브라우저**: localStorage 특성상 다른 기기·탭과 데이터가 동기화되지 않는다.
- **인증 없음**: 모든 사용자가 모든 일감을 수정·삭제할 수 있다.

향후 Supabase(Postgres + Auth) + Google OAuth + Vercel 스택으로 전환하는 계획은 `docs/architecture.md` 참조.
