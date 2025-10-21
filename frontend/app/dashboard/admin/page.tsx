'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import Link from 'next/link'

// Sample admin data
const adminStats = {
  totalUsers: 1247,
  totalClaims: 2890,
  pendingClaims: 127,
  approvedClaims: 2456,
  rejectedClaims: 307,
  totalPolicies: 5420,
  systemRevenue: 18500000,
  monthlyGrowth: 12.5
}

const recentClaims = [
  {
    id: 'CLM-2024-001',
    customer: 'John Doe',
    type: 'Auto Insurance',
    amount: 125000,
    status: 'pending',
    agent: 'Sarah Johnson',
    priority: 'high',
    date: '2024-01-15'
  },
  {
    id: 'CLM-2024-002',
    customer: 'Jane Smith',
    type: 'Health Insurance',
    amount: 85000,
    status: 'approved',
    agent: 'Mike Wilson',
    priority: 'medium',
    date: '2024-01-14'
  },
  {
    id: 'CLM-2024-003',
    customer: 'Bob Johnson',
    type: 'Property Insurance',
    amount: 350000,
    status: 'under_review',
    agent: 'Lisa Chen',
    priority: 'urgent',
    date: '2024-01-13'
  }
]

const systemAlerts = [
  { id: 1, type: 'warning', message: 'High claim volume detected in Auto Insurance', time: '2 hours ago' },
  { id: 2, type: 'info', message: 'New agent training scheduled for next week', time: '4 hours ago' },
  { id: 3, type: 'error', message: 'Payment gateway maintenance required', time: '6 hours ago' }
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-xl font-semibold">Access Denied</div>
        <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200 text-red-700'
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-700'
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-700'
      default: return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl p-6 lg:p-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-white/10 rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold">Welcome back, {user?.name}!</h1>
                  <p className="text-red-100 mt-1">Administrator Dashboard</p>
                </div>
              </div>
              <p className="text-red-100 text-lg">Here's what's happening with your insurance system today.</p>
              
              <div className="flex flex-wrap items-center gap-6 mt-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-red-100">System Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-100">Last login: Today, 9:30 AM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-red-100">{adminStats.pendingClaims} pending actions</span>
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 lg:ml-8">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 min-w-0">
                  <div className="text-lg font-bold text-white">{adminStats.totalUsers.toLocaleString()}</div>
                  <div className="text-xs text-red-100">Active Users</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 min-w-0">
                  <div className="text-lg font-bold text-white">{adminStats.pendingClaims}</div>
                  <div className="text-xs text-red-100">Pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">Total Users</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{adminStats.totalUsers.toLocaleString()}</p>
              <div className="flex items-center text-sm text-green-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17H7V7" />
                </svg>
                <span>+5.2% from last month</span>
              </div>
            </div>
            <div className="flex-shrink-0 p-3 bg-blue-100 rounded-xl">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">Total Claims</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{adminStats.totalClaims.toLocaleString()}</p>
              <div className="flex items-center text-sm text-orange-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17H7V7" />
                </svg>
                <span>+8.1% from last month</span>
              </div>
            </div>
            <div className="flex-shrink-0 p-3 bg-orange-100 rounded-xl">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">Pending Claims</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{adminStats.pendingClaims}</p>
              <div className="flex items-center text-sm text-yellow-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Requires attention</span>
              </div>
            </div>
            <div className="flex-shrink-0 p-3 bg-yellow-100 rounded-xl">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">Revenue</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">₹{(adminStats.systemRevenue / 1000000).toFixed(1)}M</p>
              <div className="flex items-center text-sm text-green-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17H7V7" />
                </svg>
                <span>+{adminStats.monthlyGrowth}% growth</span>
              </div>
            </div>
            <div className="flex-shrink-0 p-3 bg-green-100 rounded-xl">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Claims - Takes 8 columns on large screens */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Claims</h3>
                  <p className="text-sm text-gray-600 mt-1">Latest insurance claims requiring attention</p>
                </div>
                <Link href="/dashboard/admin/claims" className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                  View all
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Claim Info</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{claim.id}</div>
                          <div className="text-sm text-gray-500">{claim.type}</div>
                          <div className="text-xs text-gray-400">{claim.date}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{claim.customer}</div>
                          <div className="text-sm text-gray-500">Agent: {claim.agent}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">₹{claim.amount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(claim.status)}`}>
                          {claim.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(claim.priority)}`}>
                          {claim.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                            Edit
                          </button>
                          <button className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar - System Alerts & Quick Actions */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 space-y-5">
            {/* System Alerts */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">System Alerts</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {systemAlerts.length}
                  </span>
                </div>
              </div>
              <div className="p-3 space-y-2">
                {systemAlerts.map((alert) => (
                  <div key={alert.id} className={`p-2.5 rounded-lg border ${getAlertColor(alert.type)}`}>
                    <div className="flex items-start space-x-2.5">
                      <div className="flex-shrink-0 mt-0.5">
                        {alert.type === 'error' && (
                          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        )}
                        {alert.type === 'warning' && (
                          <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                        )}
                        {alert.type === 'info' && (
                          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 leading-tight">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <Link href="/dashboard/admin/alerts" className="text-xs text-red-600 hover:text-red-700 font-medium">
                  View all alerts →
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                <h3 className="text-base font-semibold text-gray-900">Quick Actions</h3>
                <p className="text-xs text-gray-600 mt-0.5">Common admin tasks</p>
              </div>
              <div className="p-3 space-y-1.5">
                <Link 
                  href="/dashboard/admin/users" 
                  className="flex items-center p-2.5 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 group-hover:bg-red-100 flex items-center justify-center mr-2.5 transition-colors">
                    <svg className="w-3.5 h-3.5 text-blue-600 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium">Add New User</div>
                    <div className="text-xs text-gray-500">Create user account</div>
                  </div>
                </Link>
                
                <Link 
                  href="/dashboard/admin/reports" 
                  className="flex items-center p-2.5 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-green-100 group-hover:bg-red-100 flex items-center justify-center mr-2.5 transition-colors">
                    <svg className="w-3.5 h-3.5 text-green-600 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium">Generate Report</div>
                    <div className="text-xs text-gray-500">Analytics & insights</div>
                  </div>
                </Link>
                
                <Link 
                  href="/dashboard/admin/settings" 
                  className="flex items-center p-2.5 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-100 group-hover:bg-red-100 flex items-center justify-center mr-2.5 transition-colors">
                    <svg className="w-3.5 h-3.5 text-purple-600 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium">System Settings</div>
                    <div className="text-xs text-gray-500">Configuration & preferences</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                <h3 className="text-base font-semibold text-gray-900">System Status</h3>
              </div>
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">System Status</span>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-600">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Response Time</span>
                  <span className="text-xs font-medium text-gray-900">145ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Uptime</span>
                  <span className="text-xs font-medium text-gray-900">99.9%</span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Active Sessions</span>
                    <span className="font-medium text-gray-900">{adminStats.totalUsers}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}