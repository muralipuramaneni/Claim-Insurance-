'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Breadcrumb, generateBreadcrumbs } from '@/components/ui/Breadcrumb'

interface Policy {
  id: string
  policyNumber: string
  type: string
  status: string
  premium: number
  coverage: string
  startDate: string
  endDate: string
  nextPayment: string
  description: string
}

const samplePolicies: Policy[] = [
  {
    id: '1',
    policyNumber: 'POL-AUTO-001',
    type: 'auto',
    status: 'active',
    premium: 9500,
    coverage: '₹80,00,000',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    nextPayment: '2024-02-15',
    description: 'Comprehensive auto insurance coverage'
  },
  {
    id: '2',
    policyNumber: 'POL-HOME-001',
    type: 'home',
    status: 'active',
    premium: 6800,
    coverage: '₹2,00,00,000',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    nextPayment: '2024-02-20',
    description: 'Homeowner\'s insurance with full replacement cost'
  },
  {
    id: '3',
    policyNumber: 'POL-HEALTH-001',
    type: 'health',
    status: 'active',
    premium: 16000,
    coverage: '₹40,00,000',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    nextPayment: '2024-02-01',
    description: 'Comprehensive health insurance plan'
  },
  {
    id: '4',
    policyNumber: 'POL-LIFE-001',
    type: 'life',
    status: 'pending',
    premium: 3600,
    coverage: '₹80,00,000',
    startDate: '2024-02-01',
    endDate: '2025-01-31',
    nextPayment: '2024-02-01',
    description: 'Term life insurance policy'
  }
]

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Simulate loading policies
    const loadPolicies = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPolicies(samplePolicies)
      setLoading(false)
    }

    loadPolicies()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'auto': return 'Auto Insurance'
      case 'home': return 'Home Insurance'
      case 'health': return 'Health Insurance'
      case 'life': return 'Life Insurance'
      case 'travel': return 'Travel Insurance'
      default: return type
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'auto':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )
      case 'home':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )
      case 'health':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )
      case 'life':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
    }
  }

  const filteredPolicies = filter === 'all' 
    ? policies 
    : policies.filter(policy => policy.status === filter)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Breadcrumb items={generateBreadcrumbs(pathname)} className="animate-fade-in-up" />
            </div>
            <div className="flex items-center">
              <Button onClick={() => router.push('/dashboard/policies/new')}>
                Request New Policy
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Policies</p>
                <p className="text-2xl font-bold text-gray-900">
                  {policies.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Premium</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{policies.reduce((sum, p) => sum + (p.status === 'active' ? p.premium : 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Coverage</p>
                <p className="text-2xl font-bold text-gray-900">₹2.28Cr</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-4">
            {['all', 'active', 'pending', 'expired'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {status === 'all' ? 'All Policies' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Policies Grid */}
        {filteredPolicies.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No policies found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by requesting your first policy.</p>
              <div className="mt-6">
                <Button onClick={() => router.push('/dashboard/policies/new')}>
                  Request New Policy
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolicies.map((policy) => (
              <div
                key={policy.id}
                className="bg-white rounded-lg border border-gray-200 hover:border-blue-200 transition-all cursor-pointer"
                onClick={() => router.push(`/dashboard/policies/${policy.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getTypeIcon(policy.type)}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {getTypeDisplay(policy.type)}
                        </h3>
                        <p className="text-sm text-gray-600">{policy.policyNumber}</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(policy.status)}`}>
                      {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Coverage</span>
                      <span className="text-sm font-medium text-gray-900">{policy.coverage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Premium</span>
                      <span className="text-sm font-medium text-gray-900">₹{policy.premium}/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Next Payment</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(policy.nextPayment).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Expires</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(policy.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                    {policy.description}
                  </p>

                  <div className="mt-4 flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" className="flex-1">
                      Make Payment
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}