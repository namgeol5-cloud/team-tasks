# Team Tasks

로그인 없이 바로 쓰는 팀 일감 관리 앱. Next.js 15 App Router + Tailwind CSS + shadcn/ui로 구현된 Kanban 보드입니다.

## 스크린샷

> 보드를 열면 Todo / In Progress / Review / Done 4열이 바로 표시됩니다.

## 기능

| ID | 기능 | 설명 |
|----|------|------|
| F-01 | Kanban 보드 | 4열 시각화, 열별 일감 수 표시, 마감 초과 시 빨간색 강조 |
| F-02 | 일감 CRUD | 제목·설명·상태·우선순위·담당자·마감일 관리, 변경 즉시 반영 |
| F-03 | 상태 이동 | 카드 메뉴에서 원클릭으로 임의 열 이동 |
| F-04 | 팀원 관리 | 팀원 추가·삭제, 삭제 시 해당 일감 자동 미배정 |
| F-05 | 필터링 | 텍스트 검색 + 우선순위·담당자 드롭다운 조합 필터 |

## 기술 스택

- **프레임워크**: Next.js 15 (App Router, Turbopack)
- **언어**: TypeScript
- **스타일**: Tailwind CSS v3
- **컴포넌트**: shadcn/ui (Radix UI 기반)
- **상태 관리**: Zustand v5 + localStorage 영속성
- **아이콘**: lucide-react

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

```bash
# 프로덕션 빌드
npm run build
npm start
```

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx        # 루트 레이아웃
│   ├── page.tsx          # 진입점
│   └── providers.tsx     # TooltipProvider 등 클라이언트 래퍼
├── components/
│   ├── TaskBoard.tsx     # 보드 전체 레이아웃 + 헤더
│   ├── TaskCard.tsx      # 개별 일감 카드
│   ├── TaskDialog.tsx    # 일감 생성·수정 다이얼로그
│   ├── MemberDialog.tsx  # 팀원 관리 다이얼로그
│   ├── FilterBar.tsx     # 검색·필터 바
│   └── ui/               # shadcn/ui 컴포넌트
└── lib/
    ├── types.ts          # Task, Member 타입 정의
    ├── utils.ts          # cn, 우선순위·상태 설정값
    └── store.tsx         # Zustand 스토어
```

## 데이터 저장

별도 백엔드 없이 **브라우저 localStorage** 에 저장됩니다. 탭을 닫아도 데이터가 유지되며, 네트워크 없이 오프라인으로 동작합니다.

> 여러 기기·브라우저 간 공유가 필요하면 백엔드 연동이 필요합니다 (현재 MVP 범위 밖).

## 문서

| 문서 | 내용 |
|------|------|
| [docs/personas.md](docs/personas.md) | 팀장·개발자·기획자 페르소나 + MVP 헌장 |
| [docs/user-stories.md](docs/user-stories.md) | 하루 일과 시나리오 + 결정 사항 5개 |
| [docs/requirements.md](docs/requirements.md) | 기능·비기능 요건 (성능·보안·가용성·접근성) |
