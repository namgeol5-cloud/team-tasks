'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleGoogleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  async function handleEmailLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setPending(false)
      return
    }

    router.replace('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            data-testid="email-input"
            placeholder="이메일"
            required
            className="rounded-md border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            data-testid="password-input"
            placeholder="비밀번호"
            required
            className="rounded-md border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            data-testid="email-login-submit"
            disabled={pending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Email로 로그인
          </button>
        </form>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex-1 border-t border-gray-200" />
          또는
          <span className="flex-1 border-t border-gray-200" />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="rounded-md bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-md ring-1 ring-gray-300 hover:bg-gray-50"
        >
          Google로 로그인
        </button>
      </div>
    </div>
  )
}
