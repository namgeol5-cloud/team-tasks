# API Endpoints — Team Tasks

| METHOD | PATH | 설명 | 인증 |
|--------|------|------|------|
| POST | /api/auth/login | Google OAuth 로그인 세션 시작 | 불필요 |
| POST | /api/auth/logout | 세션 종료 및 쿠키 삭제 | 필요 |
| GET | /api/tasks | 전체 일감 목록 조회 | 필요 |
| POST | /api/tasks | 새 일감 생성 (created_by = 로그인 사용자) | 필요 |
| PATCH | /api/tasks/[id] | 특정 일감의 title·assignee_id·status 수정 | 필요 |
| DELETE | /api/tasks/[id] | 특정 일감 삭제 | 필요 |
