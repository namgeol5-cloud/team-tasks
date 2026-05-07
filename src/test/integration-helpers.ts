import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

/**
 * 통합 테스트 전에 개발 서버가 떠 있는지 확인한다.
 * 3초 안에 응답 없으면 안내 메시지와 함께 throw.
 */
export async function waitForDevServer(baseUrl = 'http://localhost:3000'): Promise<void> {
  try {
    await fetch(baseUrl, { signal: AbortSignal.timeout(3000) })
  } catch {
    throw new Error(
      `개발 서버(${baseUrl})에 연결할 수 없습니다.\n` +
        `별도 터미널에서 npm run dev 먼저 띄우세요.`,
    )
  }
}

/**
 * TEST_USER_EMAIL / TEST_USER_PASSWORD 로 로그인 후
 * @supabase/ssr 서버 클라이언트가 읽는 Cookie 헤더 문자열과 userId 를 반환한다.
 *
 * createServerClient 의 커스텀 쿠키 어댑터로 세션 저장 과정을 가로채서
 * 프로덕션 서버 클라이언트와 동일한 포맷의 쿠키를 조립한다.
 */
export async function signInTestUser(): Promise<{
  cookieHeader: string
  userId: string
}> {
  const cookieStore: Record<string, string> = {}

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Object.entries(cookieStore).map(([name, value]) => ({ name, value }))
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            cookieStore[name] = value
          }
        },
      },
    },
  )

  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.TEST_USER_EMAIL!,
    password: process.env.TEST_USER_PASSWORD!,
  })

  if (error || !data.session) {
    throw error ?? new Error('signInWithPassword: 세션을 받지 못했습니다.')
  }

  // Cookie 요청 헤더 형식: "name=value; name2=value2"
  // JSON 값에 포함된 특수문자를 URL 인코딩해 RFC 6265 준수
  const cookieHeader = Object.entries(cookieStore)
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join('; ')

  return { cookieHeader, userId: data.session.user.id }
}

/**
 * SERVICE_ROLE_KEY 로 RLS 를 우회하는 어드민 Supabase 클라이언트를 반환한다.
 * 통합 테스트의 데이터 cleanup 에서 사용한다.
 */
export function getAdminSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
