'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/lib/AuthContext'

// Dummy user data for testing
const DUMMY_USERS = [
  { email: 'admin@insurance.com', password: 'admin123', role: 'admin', name: 'Admin User' },
  { email: 'agent@insurance.com', password: 'agent123', role: 'agent', name: 'Insurance Agent' },
  { email: 'customer@insurance.com', password: 'customer123', role: 'customer', name: 'John Customer' },
  { email: 'demo@test.com', password: 'demo123', role: 'customer', name: 'Demo User' }
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showDummyAccounts, setShowDummyAccounts] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Use the dummy auth login function
      const success = await login(email, password)
      
      if (success) {
        router.push('/dashboard/home')
      } else {
        setError('Invalid email or password. Try using one of the demo accounts.')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDummyLogin = (user: typeof DUMMY_USERS[0]) => {
    setEmail(user.email)
    setPassword(user.password)
    setError('')
    setShowDummyAccounts(false) // Auto-close demo accounts section
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Main Login Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Header Section with Gradient */}
          <div className="bg-gradient-to-r from-primary-600 to-blue-600 px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 animate-fade-in-up">InsureClaim</h1>
            <p className="text-white/80 text-sm font-medium animate-fade-in-up animation-delay-200">Insurance Claims Management</p>
          </div>

          {/* Content Section */}
          <div className="px-8 py-8 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 animate-fade-in-up">
                Welcome Back
              </h2>
              <p className="text-gray-600 text-sm">
                Sign in to access your dashboard
              </p>
            </div>

            {/* Demo Accounts Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-blue-900 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Demo Accounts
                </h3>
                <button
                  type="button"
                  onClick={() => setShowDummyAccounts(!showDummyAccounts)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200 flex items-center"
                >
                  {showDummyAccounts ? (
                    <>
                      <span>Hide</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Show</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
              
              {showDummyAccounts && (
                <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                  {DUMMY_USERS.map((user, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 transition-all duration-200 hover:border-blue-300">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-gray-600 text-xs">{user.email}</p>
                          <p className="text-gray-500 text-xs capitalize">Role: {user.role}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDummyLogin(user)}
                        className="px-3 py-1.5 text-xs bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-colors duration-200"
                      >
                        Use
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-in fade-in-50 duration-300">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-5">
                <Input
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200">
                    Forgot password?
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 transition-colors duration-200"
                loading={loading}
                disabled={!email || !password}
              >
                Sign in
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  href="/auth/register"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}