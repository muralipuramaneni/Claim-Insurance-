'use client'

import { useAuth } from '@/lib/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import AdminLayout from './AdminLayout'
import AgentLayout from './AgentLayout'
import CustomerLayout from './CustomerLayout'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Route to appropriate layout based on user role
  switch (user.role) {
    case 'admin':
      return <AdminLayout pathname={pathname}>{children}</AdminLayout>
    case 'agent':
      return <AgentLayout pathname={pathname}>{children}</AgentLayout>
    case 'customer':
      return <CustomerLayout pathname={pathname}>{children}</CustomerLayout>
    default:
      return <CustomerLayout pathname={pathname}>{children}</CustomerLayout>
  }
}