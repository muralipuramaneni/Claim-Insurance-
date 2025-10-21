'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabaseClient'

export default function ConfirmPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the token and type from URL parameters
        const token = searchParams.get('token')
        const type = searchParams.get('type')

        if (!token || type !== 'signup') {
          setStatus('error')
          setMessage('Invalid confirmation link')
          return
        }

        // Verify the email confirmation token
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        })

        if (error) {
          setStatus('error')
          setMessage(error.message)
          return
        }

        if (data.user) {
          // Create user profile if it doesn't exist
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert([
              {
                id: data.user.id,
                full_name: data.user.user_metadata?.full_name || '',
                role: data.user.user_metadata?.role || 'customer'
              }
            ])

          if (profileError) {
            console.error('Profile creation error:', profileError)
          }

          setStatus('success')
          setMessage('Email confirmed successfully! You can now sign in.')
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/auth/login')
          }, 3000)
        }
      } catch (err) {
        setStatus('error')
        setMessage('An unexpected error occurred')
      }
    }

    handleEmailConfirmation()
  }, [searchParams, router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Confirmation
          </h2>
          
          {status === 'loading' && (
            <div className="mt-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Confirming your email...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="mt-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex justify-center">
                  <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="mt-2 text-green-600">{message}</p>
                <p className="mt-2 text-sm text-green-500">Redirecting to login page...</p>
              </div>
              <div className="mt-6">
                <Link
                  href="/auth/login"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Go to login page now
                </Link>
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="mt-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex justify-center">
                  <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="mt-2 text-red-600">{message}</p>
              </div>
              <div className="mt-6 space-y-2">
                <Link
                  href="/auth/register"
                  className="block font-medium text-primary-600 hover:text-primary-500"
                >
                  Try registering again
                </Link>
                <Link
                  href="/auth/login"
                  className="block font-medium text-primary-600 hover:text-primary-500"
                >
                  Go to login page
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}