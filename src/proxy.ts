import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request)

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    // 만료·무효 refresh token 등 인증 오류 시 세션 쿠키를 지우고 로그인으로 이동
    const loginUrl = new URL('/login', request.url)
    const redirectResponse = NextResponse.redirect(loginUrl)
    request.cookies.getAll().forEach(({ name }) => {
      if (name.startsWith('sb-')) redirectResponse.cookies.delete(name)
    })
    return redirectResponse
  }

  return response
}

export const config = {
  matcher: ['/', '/comments', '/api/tasks/:path*', '/api/comments/:path*'],
}
