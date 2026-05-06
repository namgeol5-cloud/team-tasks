'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  async function handleGoogleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <button
        onClick={handleGoogleLogin}
        className="rounded-md bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-md ring-1 ring-gray-300 hover:bg-gray-50"
      >
        Google로 로그인
      </button>
    </div>
  )
}
