'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Breadcrumb, generateBreadcrumbs } from '@/components/ui/Breadcrumb'

interface Claim {
  id: string
  claim_number: string
  type: string
  status: string
  amount: number
  description: string
  incident_date: string
  submitted_date: string
}

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Simulate loading claims
    const loadClaims = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock claims data
      const mockClaims = [
        {
          id: '1',
          claim_number: 'CLM-20241015-ABC12345',
          type: 'auto',
          status: 'under_review',
          amount: 200000.00,
          description: 'Vehicle damage from rear-end collision',
          incident_date: '2024-10-10',
          submitted_date: '2024-10-12'
        },
        {
          id: '2',
          claim_number: 'CLM-20241014-DEF67890',
          type: 'property',
          status: 'approved',
          amount: 1200000.00,
          description: 'Water damage from burst pipe',
          incident_date: '2024-10-08',
          submitted_date: '2024-10-09'
        }
      ]
      
      setClaims(mockClaims)
      setLoading(false)
    }

    loadClaims()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'under_review': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'settled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'auto': return 'Auto Insurance'
      case 'health': return 'Health Insurance'
      case 'property': return 'Property Insurance'
      case 'life': return 'Life Insurance'
      default: return type
    }
  }

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
              <Button onClick={() => router.push('/dashboard/claims/new')}>
                Submit New Claim
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Filters */}
          <div className="mb-6">
            <div className="flex space-x-4">
              {['all', 'submitted', 'under_review', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  {status === 'all' ? 'All Claims' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          {/* Claims List */}
          {claims.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No claims found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by submitting your first claim.</p>
                <div className="mt-6">
                  <Button onClick={() => router.push('/dashboard/claims/new')}>
                    Submit New Claim
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 overflow-hidden rounded-lg">
              <ul className="divide-y divide-gray-200">
                {claims.map((claim: any) => (
                  <li key={claim.id} className="px-6 py-4 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/dashboard/claims/${claim.id}`)}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {claim.claim_number}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(claim.status)}`}>
                              {claim.status.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <p>
                            {getTypeDisplay(claim.type)} • ₹{claim.amount?.toLocaleString() || 'N/A'} • {new Date(claim.incident_date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 truncate">
                          {claim.description}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}