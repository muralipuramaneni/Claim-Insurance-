'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/AuthContext'
import Link from 'next/link'

// Sample data for demonstration
const sampleClaims = [
  {
    id: 'CLM-2024-001',
    type: 'Auto Insurance',
    status: 'Processing',
    amount: 200000,
    date: '2024-01-15',
    description: 'Rear-end collision on Highway 101'
  },
  {
    id: 'CLM-2024-002',
    type: 'Home Insurance',
    status: 'Approved',
    amount: 1200000,
    date: '2024-01-10',
    description: 'Water damage from burst pipe'
  },
  {
    id: 'CLM-2024-003',
    type: 'Health Insurance',
    status: 'Under Review',
    amount: 65000,
    date: '2024-01-08',
    description: 'Emergency room visit'
  }
]

const samplePolicies = [
  {
    id: 'POL-AUTO-001',
    type: 'Auto Insurance',
    premium: 9500,
    status: 'Active',
    nextPayment: '2024-02-15',
    coverage: '₹80,00,000'
  },
  {
    id: 'POL-HOME-001',
    type: 'Home Insurance',
    premium: 6800,
    status: 'Active',
    nextPayment: '2024-02-20',
    coverage: '₹2,00,00,000'
  },
  {
    id: 'POL-HEALTH-001',
    type: 'Health Insurance',
    premium: 16000,
    status: 'Active',
    nextPayment: '2024-02-01',
    coverage: '₹40,00,000'
  }
]

export default function CustomerDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  // Redirect non-customers to their respective dashboards
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.push('/dashboard/admin')
        return
      }
      if (user.role === 'agent') {
        router.push('/dashboard/agent')
        return
      }
    }
  }, [user, loading, router])

  const [stats, setStats] = useState({
    totalClaims: 3,
    pendingClaims: 2,
    approvedClaims: 1,
    totalClaimAmount: 1465000
  })
  const [recentClaims, setRecentClaims] = useState(sampleClaims)
  const [activePolicies, setActivePolicies] = useState(samplePolicies)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  // Only show this page for customers
  if (user.role !== 'customer') {
    return null // Will redirect above
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'under review':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-green-100">Here's an overview of your insurance portfolio and recent activities.</p>
          </div>
          <div className="hidden md:block">
            <Link
              href="/dashboard/claims/new"
              className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors duration-200 border border-white/30"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Submit New Claim
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Claims</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalClaims}</p>
              <p className="text-sm text-blue-600 mt-1">Active claims</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Claims</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingClaims}</p>
              <p className="text-sm text-yellow-600 mt-1">Under review</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved Claims</p>
              <p className="text-3xl font-bold text-gray-900">{stats.approvedClaims}</p>
              <p className="text-sm text-green-600 mt-1">Completed</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900">₹{(stats.totalClaimAmount / 100000).toFixed(1)}L</p>
              <p className="text-sm text-purple-600 mt-1">Claimed</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/claims/new"
            className="flex items-center p-4 border-2 border-dashed border-green-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-200 group"
          >
            <div className="p-3 bg-green-100 rounded-full mr-4 group-hover:bg-green-200 transition-colors">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Submit New Claim</h4>
              <p className="text-sm text-gray-600">File a new insurance claim</p>
            </div>
          </Link>

          <Link
            href="/dashboard/policies"
            className="flex items-center p-4 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
          >
            <div className="p-3 bg-blue-100 rounded-full mr-4 group-hover:bg-blue-200 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">View Policies</h4>
              <p className="text-sm text-gray-600">Manage your insurance policies</p>
            </div>
          </Link>

          <Link
            href="/dashboard/support"
            className="flex items-center p-4 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group"
          >
            <div className="p-3 bg-purple-100 rounded-full mr-4 group-hover:bg-purple-200 transition-colors">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Get Support</h4>
              <p className="text-sm text-gray-600">Contact customer support</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Claims */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Claims</h3>
              <Link href="/dashboard/claims" className="text-sm text-green-600 hover:text-green-700 font-medium">
                View all →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentClaims.map((claim) => (
              <div key={claim.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{claim.id}</h4>
                      <p className="text-xs text-gray-500">{claim.type}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(claim.status)}`}>
                    {claim.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{claim.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{claim.date}</span>
                  <span className="font-medium text-gray-900">₹{claim.amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Policies */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Active Policies</h3>
              <Link href="/dashboard/policies" className="text-sm text-green-600 hover:text-green-700 font-medium">
                View all →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {activePolicies.map((policy) => (
              <div key={policy.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{policy.id}</h4>
                      <p className="text-xs text-gray-500">{policy.type}</p>
                    </div>
                  </div>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {policy.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Coverage:</span>
                    <span className="font-medium text-gray-900">{policy.coverage}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Premium:</span>
                    <span className="font-medium text-gray-900">₹{policy.premium.toLocaleString()}/year</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Next Payment:</span>
                    <span className="font-medium text-gray-900">{policy.nextPayment}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}