'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    if (error) {
      setMessage(error.message)
      return
    }
    setMessage('Check your email for confirmation!')
    router.push('/auth/callback')
  }

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center">
      <div className="w-full max-w-sm bg-neutral-300 p-6 rounded-lg shadow">
        <h1 className="text-xl font-semibold mb-4 text-gray-800">Sign Up</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-gray-700">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </form>

        {message && <p className="mt-3 text-center text-sm text-gray-800">{message}</p>}

        <div className="flex items-center my-4">
          <span className="flex-grow h-px bg-gray-500"></span>
          <span className="px-2 text-gray-700 text-sm">or</span>
          <span className="flex-grow h-px bg-gray-500"></span>
        </div>

        <p className="text-center text-sm text-gray-700">
          Have an account?{' '}
          <a href="/logIn" className="text-blue-600 hover:underline font-medium">
            Log In
          </a>
        </p>
      </div>
    </div>
  )
}
