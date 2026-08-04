'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    setUserEmail(data.session?.user.email ?? null)
  })

  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    setUserEmail(session?.user.email ?? null)
  })

  return () => {
    listener.subscription.unsubscribe()
  }
}, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/wardrobe`,
      },
    })

    if (error) {
      console.error(error)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }
  if (userEmail) {
  return (
    <p className="text-sm text-gray-600">
      Signed in as <strong>{userEmail}</strong>.{' '}
      <button
        onClick={() => supabase.auth.signOut()}
        className="underline"
      >
        Sign out
      </button>
    </p>
  )
}
  if (status === 'sent') {
    return (
      <p className="text-sm text-gray-600">
        Check your inbox — we sent a login link to <strong>{email}</strong>.
      </p>
    )
  }

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-3 max-w-sm">
      <label htmlFor="email" className="text-sm font-medium">
        Sign in to sync your wardrobe
      </label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="border rounded-md px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="bg-black text-white rounded-md px-3 py-2 text-sm disabled:opacity-50"
      >
        {status === 'sending' ? 'Sending link...' : 'Send magic link'}
      </button>
      {status === 'error' && (
        <p className="text-sm text-red-600">Something went wrong. Try again.</p>
      )}
    </form>
  )
}